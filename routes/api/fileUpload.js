const debug = require("debug")("evolvus-platform-server:routes:api:file-upload");
const _ = require("lodash");
const shortid = require('shortid');
const fileUpload = require("@evolvus/evolvus-file-upload");
const ORDER_BY = process.env.ORDER_BY || {
  lastUpdatedDate: -1
};
const LIMIT = process.env.LIMIT || 10;
const tenantHeader = "X-TENANT-ID";
const userHeader = "X-USER";
const ipHeader = "X-IP-HEADER";
const PAGE_SIZE = 10;

const fileUploadAttributes = ["tenantId", "wfInstanceId", "processingStatus", "fileIdentification", "fileName", "fileType", "fileUploadStatus", "totalTransaction", "count", "totalProcessedUserCount", "totalFailedUserCount", "uploadedBy", "successLog", "errorLog", "lastUpdatedDate", "enableFlag", "createdBy", "updatedBy", "uploadDateAndTime", "createdDate"];
const filterAttributes = fileUpload.filterAttributes;
const sortAttributes = fileUpload.sortAttributes;
const workFlowAttributes = ["wfInstanceId", "processingStatus"];

module.exports = (router) => {

  router.route('/fileUpload')
    .get((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
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
      try {
        debug("query: " + JSON.stringify(req.query));
        var limit = _.get(req.query, "limit", LIMIT);
        var limitc = parseInt(limit);
        if (isNaN(limitc)) {
          throw new Error("limit must be a number")
        }
        var pageSize = _.get(req.query, "pageSize", PAGE_SIZE);
        var pageSizec = parseInt(pageSize);
        if (isNaN(pageSizec)) {
          throw new Error("pageSize must be a number")
        }
        var pageNo = _.get(req.query, "pageNo", 1);
        var pageNoc = parseInt(pageNo);
        if (isNaN(pageNoc)) {
          throw new Error("pageNo must be a number")
        }
        var skipCount = pageSizec * (pageNoc - 1);
        var filterValues = _.pick(req.query, filterAttributes);
        var filter = _.omitBy(filterValues, function(value, key) {
          return value.startsWith("undefined");
        });
        var sort = _.get(req.query, "sort", {});
        var orderby = sortable(sort);
        limitc = (+pageSizec < limitc) ? pageSizec : limitc;

        debug(`get API.tenantId :${tenantId}, createdBy :${createdBy}, ipAddress :${ipAddress}, filter :${JSON.stringify(filter)}, orderby :${JSON.stringify(orderby)}, skipCount :${skipCount}, limit :${limit} are parameters`);
        fileUpload.find(tenantId, createdBy, ipAddress, filter, orderby, skipCount, limit)
          .then((fileUploads) => {
            if (fileUploads.length > 0) {
              debug("getting successfully", fileUploads)
              response.status = "200";
              response.description = "SUCCESS";
              response.data = fileUploads;
              res.status(response.status).json(response);
            } else {
              response.status = "200";
              response.data = [];
              response.description = "No fileUpload found";
              debug("response: " + JSON.stringify(response));
              res.status(response.status).json(response);
            }
          })
          .catch((e) => {
            var reference = shortid.generate();
            debug(`failed to fetch all fileUpload ${e} ,and reference id ${reference}`);
            response.status = "400";
            response.description = `Unable to fetch all fileUpload`;
            response.data = e.toString();
            res.status(response.status).json(response);
          });
      } catch (e) {
        var reference = shortid.generate();
        debug(`try catch failed due to : ${e} and reference id :${reference}`);
        response.status = "400";
        response.description = `Unable to fetch all fileUpload`;
        response.data = e.toString();
        res.status(response.status).json(response);;
      };
    });

  router.route("/fileUpload/:fileName")
    .put((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      // const accessLevel = req.header(accessLevelHeader);
      // const entityId = req.header(entityIdHeader);
      var updatefileName = req.params.fileName;
      const response = {
        "status": "200",
        "description": "",
        "data": []
      };
      debug("query: " + JSON.stringify(req.query));
      let body = _.pick(req.body, fileUploadAttributes);
      try {
        body.tenantId = tenantId;
        body.updatedBy = req.header(userHeader);
        body.lastUpdatedDate = new Date().toISOString();
        body.processingStatus = "IN_PROGRESS";
        debug(`Update API.tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)},ipAddress :${ipAddress}, updatefileName :${updatefileName}, body :${JSON.stringify(body)}, are parameters`);
        fileUpload.update(tenantId, createdBy, ipAddress, updatefileName, body).then((updatedfileUpload) => {
          response.status = "200";
          response.description = `${updatefileName} fileUpload has been modified successfully and sent for the supervisor authorization.`;
          response.data = body;
          debug("response: " + JSON.stringify(response));
          res.status(response.status).json(response);
        }).catch((e) => {
          response.status = "400";
          response.description = `Unable to modify fileUpload ${updatefileName}. Due to ${e.message}`;
          response.data = e.toString();
          var reference = shortid.generate();
          debug(`Update promise failed due to :${e} and referenceId :${reference}`);
          res.status(response.status).json(response);
        });

      } catch (e) {
        var reference = shortid.generate();
        debug(`try catch failed due to :${e} , and reference id :${reference}`);
        response.status = "400";
        response.description = `Unable to modify fileUpload ${body.fileName}. Due to ${e.message}`;
        response.data = e.toString();
        res.status(response.status).json(response);
      }

    });

  router.route('/fileUpload')
    .post((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      let body = _.pick(req.body, fileUploadAttributes);
      try {
        body.tenantId = tenantId;
        body.createdBy = createdBy;
        body.createdDate = new Date().toISOString();
        body.lastUpdatedDate = body.createdDate;
        debug(`save API. tenantId :${tenantId}, createdBy :${createdBy}, ipAddress :${ipAddress}, body :${JSON.stringify(body)}, are parameters values `);
        fileUpload.save(tenantId, createdBy, ipAddress, body).then((ent) => {
          response.status = "200";
          response.description = "SUCCESS";
          response.data = ent;
          res.status(200)
            .send(JSON.stringify(response, null, 2));
        }).catch((e) => {
          var reference = shortid.generate();
          debug(`save promise failed .due to ${e},and referenceId is ${reference}`);
          response.status = "400",
            response.description = `Unable to add new fileUpload ${body.fileName}. Due to ${e}`,
            response.data = e;
          res.status(response.status).send(JSON.stringify(response));
        });
      } catch (e) {
        var reference = shortid.generate();
        debug(`try catch failed .due to ${e},and referenceId is ${reference}`);
        response.status = "400",
          response.description = `Unable to add new fileUpload ${body.fileName}. Due to ${e.message}`,
          response.data = e.toString()
        res.status(response.status).send(JSON.stringify(response));
      }
    });

  router.route("/private/api/fileUpload/:id")
    .put((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      var id = req.params.id;
      // const accessLevel = req.header(accessLevelHeader);
      // const entityId = req.header(entityIdHeader)
      const response = {
        "status": "200",
        "description": "",
        "data": []
      };
      debug("query: " + JSON.stringify(req.query));
      try {
        let body = _.pick(req.body, fileUploadAttributes);
        body.updatedBy = req.header(userHeader);
        body.lastUpdatedDate = new Date().toISOString();
        debug(`Update API.tenantId :${tenantId},createdBy :${JSON.stringify(createdBy)},ipAddress :${ipAddress}, id :${id}, body :${JSON.stringify(body)}, are parameters`);
        fileUpload.updateWorkflow(tenantId, createdBy, ipAddress, id, body).then((updatedfileUpload) => {
          response.status = "200";
          response.description = `${id} fileUpload has been modified successfully and sent for the supervisor authorization.`;
          response.data = body;
          res.status(200)
            .json(response);

        }).catch((e) => {
          var reference = shortid.generate();
          response.status = "400",
            response.description = `Unable to modify fileUpload. Due to ${e}`
          response.data = e.toString()
          debug(`calling updateWorkflow failed due to :${e},and referenceId :${reference}`)
          res.status(response.status).json(response);
        });
      } catch (e) {
        console.log(e, "e");
        var reference = shortid.generate();
        response.status = "400",
          response.description = `Unable to modify fileUpload . Due to ${e}`
        response.data = e.toString();
        debug(`try catch failed due to :${e},and referenceId :${reference}`)
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