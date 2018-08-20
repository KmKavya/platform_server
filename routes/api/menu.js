const debug = require("debug")("evolvus-platform-server:routes:api:menu");
const _ = require("lodash");
const menu = require("@evolvus/evolvus-menu");

const LIMIT = process.env.LIMIT || 20;
const ORDER_BY = process.env.ORDER_BY || {
  menuGroupOrder: 1
};
const tenantHeader = "X-TENANT-ID";
const userHeader = "X-USER";
const ipHeader = "X-IP-HEADER";
const PAGE_SIZE = 20;

const menuAttributes = ["menuGroupCode", "title", "applicationCode", "tenantId", "menuItems", "createdBy", "createdDate", "menuGroupOrder"];
const filterAttributes = ["applicationCode"];


module.exports = (router) => {

  router.route('/menu')
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
        menu.find(tenantId, createdBy, ipAddress, filter, orderby, skipCount, +limit)
          .then((menus) => {
            if (menus.length > 0) {
              response.status = "200";
              response.description = "SUCCESS";
              response.data = menus;
              res.status(200)
                .send(JSON.stringify(response, null, 2));
            } else {
              response.status = "204";
              response.data = [];
              response.description = "No menus found";
              debug("response: " + JSON.stringify(response));
              res.status(200)
                .send(JSON.stringify(response, null, 2));
            }
          })
          .catch((e) => {
            debug(`failed to fetch all menus ${e}`);
            response.status = "400";
            response.description = `Unable to fetch all menus`;
            response.data = e.toString();
            res.status(response.status).send(JSON.stringify(response, null, 2));
          });
      } catch (e) {
        debug(`caught exception ${e}`);
        response.status = "400";
        response.description = `Unable to fetch all menus`;
        response.data = e.toString();
        res.status(response.status).send(JSON.stringify(response, null, 2));
      }
    });

  router.route('/menu/')
    .post((req, res, next) => {
      const tenantId = req.header(tenantHeader);
      const createdBy = req.header(userHeader);
      const ipAddress = req.header(ipHeader);
      const response = {
        "status": "200",
        "description": "",
        "data": {}
      };
      debug("query: " + JSON.stringify(req.query));
      let body = _.pick(req.body, menuAttributes);
      body.createdBy = createdBy;
      body.createdDate = new Date().toISOString();
      body.lastUpdatedDate = body.createdDate;
      try {
        menu.save(tenantId, body)
          .then((menus) => {
            response.status = "200";
            response.description = "SUCCESS";
            response.data = menus;
            res.status(200)
              .send(JSON.stringify(response, null, 2));
          })
          .catch((e) => {
            debug(`failed to fetch all menus ${e}`);
            response.status = "400";
            response.description = `Unable to add new  menus.Due to ${e.message}`;
            response.data = e.toString();
            res.status(response.status).send(JSON.stringify(response, null, 2));
          });
      } catch (e) {
        debug(`failed to fetch all menus ${e}`);
        response.status = "400";
        response.description = `Unable to add new  menus.Due to ${e.message}`;
        response.data = e.toString();
        res.status(response.status).send(JSON.stringify(response, null, 2));
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