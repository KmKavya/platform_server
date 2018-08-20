const debug = require("debug")("evolvus-platform-server:routes:api:application");
const _ = require("lodash");
const application = require("evolvus-application");

const applicationAttributes = ["applicationName", "applicationId", "description", "enabled", "applicationCode", "createdBy", "createdDate", "logo", "favicon"];
const headerAttributes = ["tenantid", "entityid", "accesslevel"];

module.exports = (router) => {
  router.route('/application')
    .post((req, res, next) => {
      try {
        let body = _.pick(req.body, applicationAttributes);
        let header = _.pick(req.headers, headerAttributes);
        body.tenantId = header.tenantid;
        body.createdBy = "SYSTEM";
        body.createdDate = new Date().toISOString();
        application.save(body).then((app) => {
          debug(`application saved ${app}`);
          res.send(app);
        }).catch((e) => {
          debug(`failed to save ${e}`);
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        debug(`caught exception ${e}`);
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route('/application/find/:applicationCode')
    .get((req, res, next) => {
      try {
        let codeValue = req.params.applicationCode;
        console.log(codeValue);
        application.getOne("applicationCode", codeValue).then((app) => {
          console.log(app);
          if (_.isEmpty(app)) {
            debug(`no application found by this code `, codeValue);
            res.status(204).json({
              message: `no application found by this code ${codeValue}`
            });
          } else {
            debug(`application found ${app}`);
            res.send(app);
          }
        }).catch((e) => {
          debug(`failed to find the appilication by code ${codeValue}`);
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        debug(`caught exception ${e}`);
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route('/application')
    .get((req, res, next) => {
      try {
        application.getAll(-1).then((applications) => {
          if (applications.length > 0) {
            res.send(applications);
          } else {
            res.status(204).json({
              message: "No applications found"
            });
          }
        }).catch((e) => {
          debug(`failed to fetch all applications ${e}`);
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        debug(`caught exception ${e}`);
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route("/application/:id")
    .put((req, res, next) => {
      try {
        application.update(req.params.id, req.body).then((response) => {
          debug(`application updated successfully ${response}`);
          res.send(response);
        }).catch((e) => {
          debug(`failed to update ${e}`);
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        debug(`caught exception ${e}`);
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route('/applicationCodes')
    .get((req, res, next) => {
      try {
        application.getAll(-1).then((applications) => {
          if (applications.length > 0) {
            var codes = _.uniq(_.map(applications, 'applicationCode'));
            res.send(codes);
          } else {
            res.status(204).json({
              message: "No applications found"
            });
          }
        }).catch((e) => {
          debug(`failed to fetch all application Codes ${e}`);
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        debug(`caught exception ${e}`);
        res.status(400).json({
          error: e.toString()
        });
      }
    });
};