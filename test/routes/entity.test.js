var PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");

process.env.MONGO_DB_URL = "mongodb://10.10.69.204:27017/TestPlatform_Dev";
/*
 ** Test /api/audit API's
 */
const debug = require("debug")("evolvus-platform-server.test.routes.api");
const app = require("../../server")
  .app;
const entityTestData = require("./entityTestData");
const randomstring = require("randomstring");

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();

chai.use(chaiHttp);

var serverUrl = "http://localhost:" + PORT;

describe("Testing routes", () => {
  before((done) => {
    app.on('application_started', done());
  });

  describe("Testing save entityId api", () => {

      it("should save entity and return same attribute values", (done) => {
        chai.request(serverUrl)
          .post("/api/entity")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .send(entityTestData.validObject3)
          .end((err, res) => {
            if (err) {
              debug(`error in the test ${err}`);
              done(err);
            } else {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.should.have.property('description').eql('SUCCESS');
              res.body.data.should.have.property('name')
                .eql(entityTestData.validObject3.name.toUpperCase());
              done();
            }
          });
      });

      it("should not save entity and return status 400", (done) => {
        chai.request(serverUrl)
          .post("/api/entity")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .send({
            "name": "Docket"
          })
          .end((err, res) => {
            if (err) {
              debug(`error in the test ${err}`);
              done(err);
            } else {
              res.should.have.status(400);
              done();
            }
          });
      });

      it("should not save entity and return status 400 and return data as entityCode is required ", (done) => {
        chai.request(serverUrl)
          .post("/api/entity")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .send(entityTestData.validObject2)
          .end((err, res) => {
            if (err) {
              debug(`error in the test ${err}`);
              done(err);
            } else {
              res.should.have.status(400);
              res.body.should.be.a("object");
              res.body.should.have.property('data').eql('entityCode is required');
              done();
            }
          });
      });

    it("should not save entity and return status 400", (done) => {
       chai.request(serverUrl)
         .post("/api/entity")
         .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
         .send({
           "name": "Dockethhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh"
         })
         .end((err, res) => {
           if (err) {
             debug(`error in the test ${err}`);
             done(err);
           } else {
             res.should.have.status(400);
             done();
           }
         });
     });

  });
  describe("Testing Get entity api", () => {

    it("Should return all the entity", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(2);
            done();
          }
        });
    });
    it("Should return all the entity basedon filterCondition", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .query({
          "processingStatus": "PENDING_AUTHORIZATION"
        })
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(2);
            done();
          }
        });
    });
    it("Should return all the entity based on filterCondition", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .query({
          "processingStatus": "PENDING_AUTHORIZATION",
          "enableFlag": "1"
        })
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(2);
            done();
          }
        });
    });

    it("Should return all the entity based pageSize and PageNo", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .query({
          "processingStatus": "PENDING_AUTHORIZATION",
          "pageSize": "5",
          "pageNo": "1"
        })
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.data.should.be.a('array');
            res.body.data.length.should.be.eql(2);
            done();
          }
        });
    });

      it("Should throw the error if skip count is negative value", (done) => {
        chai.request(serverUrl)
          .get("/api/entity/")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .query({
            "processingStatus": "PENDING_AUTHORIZATION",
            "pageSize": "-2",
            "pageNo": "2"
          })
          .end((err, res) => {
            if (err) {
              debug(`error in test ${err}`);
              done(err);
            } else {
              res.should.have.status(400);
              res.body.should.be.a("object");
              res.body.should.have.property("data").eql("Error: skipCount must be positive value or 0");
              done();
            }
          });
      });

      it("Should return all the entity based on limit if page size is 0", (done) => {
        chai.request(serverUrl)
          .get("/api/entity/")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .query({
            "processingStatus": "PENDING_AUTHORIZATION",
            "pageSize": "0",
            "pageNo": "1"
          })
          .end((err, res) => {
            if (err) {
              debug(`error in test ${err}`);
              done(err);
            } else {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.data.should.be.a('array');
              res.body.data.length.should.be.eql(2);
              done();
            }
          });
      });

      it("Should return the entitys based on sorting condition", (done) => {
        chai.request(serverUrl)
          .get("/api/entity")
          .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
          .query({
            "sort": "-processingStatus,-lastUpdatedDate"
          })
          .end((err, res) => {
            if (err) {
              debug(`error in test ${err}`);
              done(err);
            } else {
              res.should.have.status(200);
              res.body.should.be.a("object");
              res.body.data.should.be.a('array');
              res.body.data.length.should.be.eql(2);
              done();
            }
          });
      });

    it("Should throws an error like limit must be a number", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .query({
          "processingStatus": "PENDING_AUTHORIZATION",
          "pageSize": "10",
          "pageNo": "1",
          "limit": "fdkglud"
        })
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("data").eql("Error: limit must be a number");
            done();
          }
        });
    });

    it("Should throws an error like pageSize must be a number", (done) => {
      chai.request(serverUrl)
        .get("/api/entity/")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .query({
          "pageSize":"guyasgdjh",
          "peocessingstatus": "PENDING_AUTHORIZATION"
        })
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(400);
            res.body.should.be.a("object");
            res.body.should.have.property("data").eql("Error: pageSize must be a number");
            done();
          }
        });
    });
  });

  describe("Testing Update entity api", () => {
    it("Should update the entity based on entityCode", (done) => {
      chai.request(serverUrl)
        .put("/api/entity/ +ENTITY5")
        .set('X-ENTITY-ID', 'H001B001').set("X-TENANT-ID", "T001").set("X-ACCESS-LEVEL", "1").set("X-USER", "user")
        .send(entityTestData.validObject5)
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.data.should.have.property('name')
              .eql("karnataka");
            done();
          }
        });
    });
  });
});
