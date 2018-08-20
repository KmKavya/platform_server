const debug = require("debug")("evolvus-platform-server:routes:api:menu");
const _ = require("lodash");
const menu = require("evolvus-menu");
const application = require("evolvus-application");

const menuAttributes = ["menuGroupCode", "title", "applicationCode", "tenantId", "menuItems", "createdBy", "createdDate", "menuGroupOrder"];

module.exports = (router) => {
  router.route("/menu")
    .post((req, res, next) => {
      try {
        let body = _.pick(req.body, menuAttributes);
        body.createdBy = "SYSTEM";
        body.createdDate = new Date().toISOString();
        application.getOne({
          applicationCode: body.applicationCode
        }).then((app) => {
          if (_.isEmpty(app)) {
            throw new Error(`No Application with ${body.applicationCode} found`);
          } else {
            menu.save(body).then((menuObj) => {
              res.send(menuObj);
            }).catch((e) => {
              res.status(400).json({
                error: e.toString()
              });
            });
          }
        }).catch((e) => {
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route('/menu')
    .get((req, res, next) => {
      try {
        menu.getAll(-1).then((menus) => {
          if (menus.length > 0) {
            res.json(menus);
          } else {
            res.status(204).json({
              message: "No menus found"
            });
          }
        }).catch((e) => {
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        res.status(400).json({
          error: e.toString()
        });
      }
    });

  router.route('/menu/find')
    .get((req, res, next) => {
      try {
        let codeValue = req.query.applicationCode;
        menu.getMany("applicationCode", codeValue).then((app) => {
          res.json(app);
        }).catch((e) => {
          res.status(400).json({
            error: e.toString()
          });
        });
      } catch (e) {
        res.status(400).json({
          error: e.toString()
        });
      }
    });



};