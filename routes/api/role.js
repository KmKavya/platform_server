const debug = require("debug")("evolvus-platform-server:routes:api:role");
const _ = require("lodash");
const role = require("@evolvus/evolvus-role");
const application = require("@evolvus/evolvus-application");
const ORDER_BY = process.env.ORDER_BY || {
  lastUpdatedDate: -1
};
const LIMIT = process.env.LIMIT || 20;
const tenantHeader = "X-TENANT-ID";
const userHeader = "X-USER";
const ipHeader = "X-IP-HEADER";
const entityIdHeader = "X-ENTITY-ID";
const accessLevelHeader = "X-ACCESS-LEVEL";
const PAGE_SIZE = 20;
const shortid = require('shortid');

const roleAttributes = ["tenantId", "roleName", "applicationCode", "description", "activationStatus", "processingStatus", "associatedUsers", "createdBy", "createdDate", "menuGroup", "lastUpdatedDate", "entityId", "accessLevel", "roleType", "txnType"];
const filterAttributes = role.filterAttributes;
const sortableAttributes = role.sortAttributes;



module.exports = (router) => {

  router.route("/role")
    .post((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const entityId = req.header(entityIdHeader);
      const accessLevel = req.header(accessLevelHeader);
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      let body = _.pick(req.body, roleAttributes);
      console.log("body", body)
      try {
        body.associatedUsers = 5;
        body.tenantId = tenantId;
        body.createdBy = createdBy;
        body.entityId = entityId;
        body.createdDate = new Date().toISOString();
        body.lastUpdatedDate = body.createdDate;
        debug(`save API. tenantId :${tenantId}, createdBy :${createdBy},ipAddress :${ipAddress},accessLevel: ${accessLevel},entityId: ${entityId}, body :${JSON.stringify(body) }are parameters`);
        role.save(tenantId, createdBy, ipAddress, accessLevel, entityId, body).then((roles) => {
          response.status = "200";
          response.description = `New role ${body.roleName.toUpperCase()} has been added successfully for the application ${body.applicationCode} and sent for the supervisor authorization.`;
          response.data = roles;
          debug("response: " + JSON.stringify(response));
          res.status(200)
            .json(response);
        }).catch((e) => {
          console.log(e);
          response.status = "400";
          response.description = `Unable to add new role ${body.roleName}. Due to ${e}`;
          response.data = {};
          var reference = shortid.generate();
          debug(`save promise failed due to :${e} and referenceId :${reference}`);
          res.status(response.status).json(response);
        });
      } catch (e) {
        var reference = shortid.generate();
        debug(`try catch failed due to :${e} , and reference id :${reference}`);
        response.status = "400";
        response.description = `Unable to add new Role ${body.roleName}. Due to ${e}`;
        response.data = {};
        res.status(response.status).json(response);
      }
    });

  router.route('/role/')
    .get((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const entityId = req.header(entityIdHeader);
      const accessLevel = req.header(accessLevelHeader);
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      debug("query: " + JSON.stringify(req.query));
      var limit = _.get(req.query, "limit", LIMIT);
      var pageSize = _.get(req.query, "pageSize", PAGE_SIZE);
      var pageNo = _.get(req.query, "pageNo", 1);
      var skipCount = pageSize * (pageNo - 1);
      var filterValues = _.pick(req.query, filterAttributes);
      var filter = _.omitBy(filterValues, function(value, key) {
        return value.startsWith("undefined");
      });
      var sort = _.get(req.query, "sort", {});
      var orderby = sortable(sort);
      limit = (+pageSize < +limit) ? pageSize : limit;
      try {
        debug(`GET ALL API.tenantId :${tenantId},createdBy :${createdBy},ipAddress :${ipAddress},filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, +limit :${+limit} are parameters`);
        Promise.all([role.find(tenantId, createdBy, ipAddress, filter, orderby, skipCount, +limit), role.find(tenantId, createdBy, ipAddress, filter, orderby, 0, 0)])
          .then((result) => {
            if (result[0].length > 0) {
              response.status = "200";
              response.description = "SUCCESS";
              response.totalNoOfPages = Math.ceil(result[1].length / pageSize);
              response.totalNoOfRecords = result[1].length;
              response.data = result[0];
              debug("response: " + JSON.stringify(response));
              res.status(200)
                .json(response);
            } else {
              response.status = "200";
              response.data = [];
              response.totalNoOfRecords = 0;
              response.totalNoOfPages = 0;
              response.description = "No role found";
              debug("response: " + JSON.stringify(response));
              res.status(response.status)
                .json(response);
            }
          }).catch((e) => {
            var reference = shortid.generate();
            debug(`Get All promise failed due to :${e} and referenceId :${reference}`);
            response.status = "400";
            response.description = `Unable to fetch all roles`;
            response.data = e.toString();
            res.status(response.status).json(response);
          });
      } catch (e) {
        var reference = shortid.generate();
        debug(`try catch failed due to :${e} , and reference id :${reference}`);
        response.status = "400";
        response.description = `Unable to fetch all roles`;
        response.data = e.toString();
        res.status(response.status).json(response);
      }
    });

  router.route("/role/:roleName")
    .put((req, res, next) => {
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
      debug("query: " + JSON.stringify(req.query));
      try {
        let body = _.pick(req.body, roleAttributes);
        body.updatedBy = req.header(userHeader);;
        body.lastUpdatedDate = new Date().toISOString();
        body.processingStatus = "IN_PROGRESS";
        body.activationStatus = "INACTIVE";
        debug(`Update API.tenantId :${tenantId},createdBy :${createdBy},ipAddress :${ipAddress},roleName :${req.params.roleName}, body :${JSON.stringify(body)}, are parameters`);
        role.update(tenantId, createdBy, ipAddress, req.params.roleName, body).then((updatedRoles) => {
          response.status = "200";
          response.description = `${req.params.roleName} Role has been modified successful and sent for the supervisor authorization.`;
          response.data = body;
          debug("response: " + JSON.stringify(response));
          res.status(200)
            .json(response);
        }).catch((e) => {
          response.status = "400";
          response.description = `Unable to modify role ${req.params.roleName}. Due to ${e.message}`;
          response.data = e.toString();
          var reference = shortid.generate();
          debug(`Update promise failed due to :${e} and referenceId :${reference}`);
          res.status(response.status).json(response);
        });
      } catch (e) {
        response.status = "400";
        response.description = `Unable to modify role ${req.params.roleName}. Due to ${e.message}`;
        response.data = e.toString();
        var reference = shortid.generate();
        debug(`try catch failed due to :${e} , and reference id :${reference}`);
        res.status(response.status).json(response);
      }
    });

  router.route("/private/api/role/:id")
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
        let body = _.pick(req.body, roleAttributes);
        body.updatedBy = req.header(userHeader);
        body.lastUpdatedDate = new Date().toISOString();
        debug(`Update workFlow API.tenantId :${tenantId},createdBy :${createdBy},ipAddress :${ipAddress}, id :${req.params.id}, body :${JSON.stringify(body)}, are parameters`);
        role.updateWorkflow(tenantId, createdBy, ipAddress, req.params.id, body).then((updatedRole) => {
          response.status = "200";
          response.description = `${req.params.id} Role has been modified successful and sent for the supervisor authorization.`;
          response.data = body;
          debug("response: " + JSON.stringify(response));
          res.status(200)
            .json(response);

        }).catch((e) => {
          response.status = "400";
          response.description = `Unable to modify role ${req.params.id}. Due to ${e}`;
          response.data = e.toString();
          var reference = shortid.generate();
          debug(`Update workFlow promise failed due to :${e} and referenceId :${reference}`);
          res.status(response.status).json(response);
        });
      } catch (e) {
        response.status = "400";
        response.description = `Unable to modify role ${req.params.id}. Due to ${e}`;
        response.data = e.toString();
        var reference = shortid.generate();
        debug(`try catch failed due to :${e} , and reference id :${reference}`);
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