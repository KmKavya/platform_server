const debug = require("debug")("evolvus-platform-server:routes:api:entity");
const _ = require("lodash");
const entity = require("@evolvus/evolvus-entity");
const randomString = require("randomstring");

const ORDER_BY = process.env.ORDER_BY || {
  lastUpdatedDate: -1
};
const LIMIT = process.env.LIMIT || 20;
const tenantHeader = "X-TENANT-ID";
const userHeader = "X-USER";
const ipHeader = "X-IP-HEADER";
const PAGE_SIZE = 20;
const entityIdHeader = "X-ENTITY-ID";
const accessLevelHeader = "X-ACCESS-LEVEL"
const entityAttributes = ["tenantId", "name", "entityCode", "entityId", "wfInstanceId", "wfInstanceStatus", "description", "processingStatus", "activationStatus", "enableFlag", "createdBy", "createdDate", "parent", "acessLevel", "lastUpdatedDate"];
const filterAttributes = entity.filterAttributes;
const sortAttributes = entity.sortAttributes;

module.exports = (router) => {

  router.route('/entity')
    .post((req, res, next) => {
      console.log(req.headers);
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const accessLevel = req.header(accessLevelHeader);
      const entityId = req.header(entityIdHeader)
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      let body = _.pick(req.body, entityAttributes);
      console.log(tenantId, entityId);
      try {
        body.createdBy = createdBy;
        body.createdDate = new Date().toISOString();
        body.lastUpdatedDate = body.createdDate;
        body.tenantId = tenantId;
        entity.save(tenantId, createdBy, ipAddress, entityId, accessLevel, body).then((ent) => {
          response.status = "200";
          response.description = `New entity ${body.name.toUpperCase()} has been added successfully  and sent for the supervisor authorization.`;
          response.data = ent;
          res.status(200)
            .json(response);
        }).catch((e) => {
          response.status = "400";
          response.description = `Unable to add new Entity ${body.name}. Due to ${e}`;
          response.data = e;
          res.status(response.status).json(response);
        });
      } catch (e) {
        response.status = "400";
        response.description = `Unable to add new Entity ${body.name}. Due to ${e}`;
        response.data = e;
        res.status(response.status).send(JSON.stringify(response, null, 2));
      }
    });

  router.route('/entity/')
    .get((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const accessLevel = req.header(accessLevelHeader);
      const entityId = req.header(entityIdHeader)
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      try {
        debug("query: " + JSON.stringify(req.query));
        var limit = _.get(req.query, "limit", LIMIT);
        limit = parseInt(limit);
        if (isNaN(limit)) {
          throw new Error("limit must be a number")
        }
        var pageSize = _.get(req.query, "pageSize", PAGE_SIZE);
        pageSize = parseInt(pageSize);
        if (isNaN(pageSize)) {
          throw new Error("pageSize must be a number")
        }
        var pageNo = _.get(req.query, "pageNo", 1);
        pageNo = parseInt(pageNo);
        if (isNaN(pageNo)) {
          throw new Error("pageNo must be a number")
        }
        var skipCount = pageSize * (pageNo - 1);
        if (skipCount < 0) {
          throw new Error("skipCount must be positive value or 0")
        }
        var filterValues = _.pick(req.query, filterAttributes);
        var filter = _.omitBy(filterValues, function(value, key) {
          return value.startsWith("undefined");
        });
        var invalidFilters = _.difference(_.keys(req.query), filterAttributes);
        let a = _.pull(invalidFilters, 'pageSize', 'pageNo', 'limit', 'sort', 'query');
        debug("invalidFilters:", invalidFilters);
        if (a.length !== 0) {
          response.status = "200";
          response.description = "No entity found";
          response.data = [];
          response.totalNoOfPagses = 0;
          response.totalNoOfRecords = 0;
          res.json(response);
        } else {

          var sort = _.get(req.query, "sort", {});
          var orderby = sortable(sort);
          limit = (+pageSize < limit) ? pageSize : limit;
          Promise.all([entity.find(tenantId, createdBy, ipAddress, entityId, accessLevel, filter, orderby, skipCount, limit), entity.find(tenantId, createdBy, ipAddress, entityId, accessLevel, filter, {}, 0, 0)])
            .then((result) => {
              if (result[0].length > 0) {
                response.status = "200";
                response.description = "SUCCESS";
                response.totalNoOfPages = Math.ceil(result[1].length / pageSize);
                response.totalNoOfRecords = result[1].length;
                response.data = result[0];
                res.status(200)
                  .json(response);
              } else {
                response.status = "200";
                response.description = "No entity found";
                response.data = [];
                response.totalNoOfPages = 0;
                response.totalNoOfRecords = 0;
                debug("response: " + JSON.stringify(response));
                res.status(response.status)
                  .json(response);
              }
            })
            .catch((e) => {
              debug(`failed to fetch all entity ${e}`);
              response.status = "400";
              response.description = `Unable to fetch all entities`;
              response.data = e.toString();
              res.status(response.status).json(response);
            });
        }
      } catch (e) {
        debug(`caught exception ${e}`);
        response.status = "400";
        response.description = `Unable to fetch all entities`;
        response.data = e.toString();
        res.status(response.status).json(response);
      }
    });

  router.route("/entity/:entityCode")
    .put((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const accessLevel = req.header(accessLevelHeader);
      const entityId = req.header(entityIdHeader)
      const response = {
        "status": "200",
        "description": "",
        "data": []
      };
      debug("query: " + JSON.stringify(req.query));
      try {
        let body = _.pick(req.body, entityAttributes);
        body.updatedBy = req.header(userHeader);;
        body.lastUpdatedDate = new Date().toISOString();
        body.processingStatus = "IN_PROGRESS";
        body.activationStatus = "INACTIVE";
        entity.update(tenantId, createdBy, ipAddress, req.params.entityCode, body).then((updatedEntity) => {
          response.status = "200";
          response.description = `${body.name} Entity has been modified successful and sent for the supervisor authorization.`;
          response.data = body;
          res.status(200)
            .json(response);

        }).catch((e) => {
          response.status = "400";
          response.description = `Unable to modify entity ${body.name}. Due to ${e}`;
          response.data = e.toString();
          res.status(response.status).json(response);
        });
      } catch (e) {
        response.status = "400";
        response.description = `Unable to modify entity ${req.body.name}. Due to ${e}`;
        response.data = e.toString();
        res.status(response.status).json(response);
      }
    });

  router.route("/private/api/entity/:id")
    .put((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const accessLevel = req.header(accessLevelHeader);
      const entityId = req.header(entityIdHeader)
      const response = {
        "status": "200",
        "description": "",
        "data": []
      };
      debug("query: " + JSON.stringify(req.query));
      try {
        let body = _.pick(req.body, entityAttributes);
        console.log("body", body);

        body.updatedBy = req.header(userHeader);
        body.lastUpdatedDate = new Date().toISOString();
        entity.updateWorkflow(tenantId, createdBy, ipAddress, req.params.id, body).then((updatedEntity) => {
          response.status = "200";
          response.description = `${req.params.id} entity has been modified successful and sent for the supervisor authorization.`;
          response.data = body;
          res.status(200)
            .json(response);

        }).catch((e) => {
          console.log(e);

          response.status = "400";
          response.description = `Unable to modify entity ${req.params.name}. Due to ${e}`;
          response.data = e.toString();
          res.status(response.status).json(response);
        });
      } catch (e) {
        console.log(e);

        response.status = "400";
        response.description = `Unable to modify role ${req.params.name}. Due to ${e}`;
        response.data = e.toString();
        res.status(response.status).json(response);
      }
    });


};


function sortable(sort) {
  if (typeof sort === 'undefined' ||
    sort == null) {
    return ORDER_BY;
  }
  if (typeof sort === 'string') {
    var result = sort.split(",")
      .reduce((temp, sortParam) => {
        if (sortParam.charAt(0) == "-") {
          return _.assign(temp, _.fromPairs([
            [sortParam.replace(/-/, ""), -1]
          ]));
        } else {
          return _.assign(_.fromPairs([
            [sortParam.replace(/\+/, ""), 1]
          ]));
        }
      }, {});
    return result;
  } else {
    return ORDER_BY;
  }
}