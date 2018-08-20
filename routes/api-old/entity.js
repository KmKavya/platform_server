const debug = require("debug")("evolvus-platform-server:routes:api:entity");
const _ = require("lodash");
const entity = require("evolvus-entity");
const randomString = require("randomstring");
const entityAttributes = ["tenantId", "name", "entityCode", "entityId", "description", "processingStatus", "enableFlag", "createdBy", "createdDate", "parent", "acessLevel", "lastUpdatedDate"];
const headerAttributes = ["tenantid", "entityid", "accesslevel"];

module.exports = (router) => {
  router.route('/entity')
    .post((req, res, next) => {
      try {
        let body = _.pick(req.body, entityAttributes);
        let header = _.pick(req.headers, headerAttributes);
        body.tenantId = header.tenantid;
        body.accessLevel = header.accesslevel;
        body.createdBy = "User";
        body.createdDate = new Date().toISOString();
        body.lastUpdatedDate = body.createdDate;
        entity.getOne("name", body.parent).then((result) => {
          if (_.isEmpty(result)) {
            throw new Error(`No ParentEntity found with ${body.parent}`);
          }
          var randomId = randomString.generate(5);
          if (result.enableFlag) {
            var aces = parseInt(result.accessLevel) + 1;
            body.accessLevel = JSON.stringify(aces);
            body.entityId = result.entityId + randomId;
            Promise.all([entity.getOne("name", body.name), entity.getOne("entityCode", body.entityCode)])
              .then((result) => {
                if (!_.isEmpty(result[0])) {
                  throw new Error(`EntityName ${body.name} already exists`);
                }
                if (!_.isEmpty(result[1])) {
                  throw new Error(`EntityCode ${body.entityCode} already exists`);
                }
                entity.save(body).then((ent) => {
                  res.json({
                    savedEntityObject: ent,
                    message: `New Entity ${body.name.toUpperCase()} has been added successfully and sent for the supervisor authorization.`
                  });
                }).catch((e) => {
                  res.status(400).json({
                    error: e.toString(),
                    message: `Unable to add new Entity ${body.name}. Due to ${e.message}`
                  });
                });
              }).catch((e) => {
                res.status(400).json({
                  error: e.toString(),
                  message: `Unable to add new role ${body.roleName}. Due to ${e.message}`
                });
              });
          } else {
            throw new Error(`ParentEntity is disabled`);
          }
        }).catch((e) => {
          res.status(400).json({
            error: e.toString(),
            message: `Unable to add new Entity ${body.name}. Due to ${e.message}`
          });
        });
      } catch (e) {
        res.status(400).json({
          error: e.toString(),
          message: `Unable to add new Entity ${body.name}. Due to ${e.message}`
        });
      }
    });
  router.route('/entity')
    .get((req, res, next) => {
      try {
        let header = _.pick(req.headers, headerAttributes);
        let pageNo = +req.query.pageNo;
        let pageSize = +req.query.pageSize;
        Promise.all([entity.getAll(header.tenantid, header.entityid, header.accesslevel, pageSize, pageNo), entity.getEntityCounts(header.tenantid, header.entityid, header.accesslevel)])
          .then((result) => {
            let totalNoOfRecords;
            let data;
            let pageObject = {};
            let totalNoOfPages = Math.ceil(result[1] / pageSize);
            pageObject.totalNoOfPages = totalNoOfPages;
            pageObject.totalNoOfRecords = result[1];
            pageObject.data = result[0];
            res.json(pageObject);
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


  router.route("/entity/:id")
    .put((req, res, next) => {
      try {
        let body = _.pick(req.body, entityAttributes);
        body.updatedBy = "User";
        body.lastUpdatedDate = new Date().toISOString();
        Promise.all([entity.getOne("name", body.name), entity.getOne("entityCode", body.entityCode)])
          .then((result) => {
            if (!_.isEmpty(result[0])) {
              throw new Error(`EntityName ${body.name} already exists`);
            }
            if (!_.isEmpty(result[1])) {
              throw new Error(`EntityCode ${body.entityCode} already exists`);
            }
            entity.update(req.params.id, body).then((updatedEntity) => {
              res.json({
                updatedEntityObject: updatedEntity,
                message: `${body.name} Entity has been modified successful and sent for the supervisor authorization.`
              });
            }).catch((e) => {
              res.status(400).json({
                error: e.toString(),
                message: `Unable to modify entity ${body.name}. Due to ${e.message}`
              });
            });
          }).catch((e) => {
            res.status(400).json({
              error: e.toString(),
              message: `Unable to modify entity ${body.name}. Due to ${e.message}`
            });
          });
      } catch (e) {
        res.status(400).json({
          error: e.toString(),
          message: `Unable to modify entity ${body.name}. Due to ${e.message}`
        });
      }
    });

  // router.route('/entity/filter')
  //   .get((req, res, next) => {
  //     try {
  //       entity.filterByEntityDetails(req.query).then((entity) => {
  //         res.send(entity);
  //       }).catch((e) => {
  //         res.status(400).send(JSON.stringify({
  //           error: e.toString()
  //         }));
  //       });
  //     } catch (e) {
  //       res.status(400).send(JSON.stringify({
  //         error: e.toString()
  //       }));
  //     }
  //   });

  router.route('/entity/filter')
    .get((req, res, next) => {
      try {
        let header = _.pick(req.headers, headerAttributes);
        let countQuery = {};
        countQuery.parent = req.query.parent;
        countQuery.enableFlag = req.query.enableFlag;
        countQuery.processingStatus = req.query.processingStatus;

        let filterQuery = {};
        filterQuery.processingStatus = req.query.processingStatus;
        filterQuery.parent = req.query.parent;
        filterQuery.enableFlag = req.query.enableFlag;
        let pageNo = +req.query.pageNo;
        let pageSize = +req.query.pageSize;
        Promise.all([entity.filterByEntityDetails(filterQuery, pageSize, pageNo), entity.getEntityCounts(countQuery)])
          .then((result) => {
            let totalNoOfRecords;
            let data;
            let pageObject = {};
            let totalNoOfPages = Math.ceil(result[1] / pageSize);
            pageObject.totalNoOfPages = totalNoOfPages;
            pageObject.totalNoOfRecords = result[1];
            pageObject.data = result[0];
            res.json(pageObject);
          }).catch((e) => {
            res.status(400).json({
              error: e.toString()
            });
          });
      } catch (e) {
        res.status(400).send(JSON.stringify({
          error: e.toString()
        }));
      }
    });

  router.route('/entity/find')
    .get((req, res, next) => {
      try {
        let entityId = req.query.entityId;
        entity.getOne("entityId", entityId).then((entity) => {
          res.json(entity);
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


  router.route('/entityNames')
    .get((req, res, next) => {
      try {
        let header = _.pick(req.headers, headerAttributes);
        entity.getAll(header.tenantid, header.entityid, header.accesslevel).then((entity) => {
          if (entity.length > 0) {
            var codes = _.uniq(_.map(entity, 'name'));
            res.send(codes);
          } else {
            res.status(204).json({
              message: "No entity found"
            });
          }
        }).catch((e) => {
          debug(`failed to fetch all entity names ${e}`);
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
}