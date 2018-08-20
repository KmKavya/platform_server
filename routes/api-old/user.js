const debug = require("debug")("evolvus-platform-server:routes:api:user");
const _ = require("lodash");
const user = require("evolvus-user");
const application = require("evolvus-application");
const response = {
  "status": "200",
  "description": "",
  "data": {}
};

const userAttributes = ["tenantId", "entityid", "accessLevel", "application", "contact", "entity", "role", "userId", "designation", "userName", "userPassword", "saltString", "enabledFlag", "activationStatus", "processingStatus", "createdBy", "createdDate", "lastUpdatedDate", "deletedFlag", "token"];
const headerAttributes = ["tenantid", "entityid", "accesslevel"];
const credentials = ["userName", "userPassword", "applicationCode"];

module.exports = (router) => {
  router.route("/user")
    .post((req, res, next) => {
      try {
        console.log(user);
        let body = _.pick(req.body, userAttributes);
        let header = _.pick(req.headers, headerAttributes);
        body.tenantId = header.tenantid;
        body.entityid = header.entityid;
        body.accessLevel = header.accesslevel;
        body.activationStatus = "ACTIVE";
        body.processingStatus = "PENDING_AUTHORIZATION";
        body.createdBy = "SYSTEM";
        body.createdDate = new Date().toISOString();
        body.lastUpdatedDate = body.createdDate;
        user.save(body).then((savedUser) => {
          response.status = "200";
          response.description = `New User ${body.userName} has been added successfully.`;
          response.data = savedUser;
          res.status(200)
            .send(JSON.stringify(response, null, 2));
        }).catch((e) => {
          response.status = "400";
          response.description = e.toString();
          response.data = {};
          console.log(e);
          res.status(400)
            .send(JSON.stringify(response, null, 2));
        });
      } catch (e) {
        response.status = "400";
        response.description = e.toString();
        response.data = {};
        console.log(e);
        res.status(400)
          .send(JSON.stringify(response, null, 2));
      }
    });

  router.route("/user/authenticate")
    .post((req, res, next) => {
      try {
        let body = _.pick(req.body, credentials);
        user.authenticate(body).then((user) => {
          res.send(user);
        }).catch((e) => {
          res.status(400).send(JSON.stringify({
            error: e.toString(),
            message: `Authentication Failed due to ${e}`
          }));
        });
      } catch (e) {
        res.status(400).send(JSON.stringify({
          error: e.toString(),
          message: `Authentication Failed due to ${e}`
        }));
      }
    });

  router.route("/user/updateToken")
    .post((req, res, next) => {
      try {
        let body = _.pick(req.body, ["token", "id"]);
        user.updateToken(body.id, body.token).then((user) => {
          res.send(user);
        }).catch((e) => {
          res.status(400).send(JSON.stringify({
            error: e.toString(),
            message: `Token updation Failed due to ${e}`
          }));
        });
      } catch (e) {
        res.status(400).send(JSON.stringify({
          error: e.toString(),
          message: `Token updation Failed due to ${e}`
        }));
      }
    });
};