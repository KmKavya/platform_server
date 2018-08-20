var PORT = process.env.PORT || 8080;
const mongoose = require("mongoose");

process.env.MONGO_DB_URL = "mongodb://10.10.69.204:27017/TestPlatform_Dev";
/*
 ** Test /api/audit API's
 */
const debug = require("debug")("evolvus-platform-server.test.routes.api");
const app = require("../../server")
  .app;
const randomstring = require("randomstring");

let chai = require("chai");
let chaiHttp = require("chai-http");
let should = chai.should();

chai.use(chaiHttp);

var serverUrl = "http://localhost:" + PORT;

describe("Testing routes", () => {
  var applicationCode;
  before((done) => {
    app.on('application_started', done());
  });


  describe("Testing save application api", () => {
    let application = {
      tenantId: "ID",
      applicationName: "FLUX CDA",
      applicationId: 100,
      applicationCode: randomstring.generate(4),
      description: "flux-cda"
    };

    it("should save application and return same attribute values", (done) => {
      chai.request(serverUrl)
        .post("/saveApplication")
        .send(application)
        .end((err, res) => {
          if (err) {
            debug(`error in the test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.have.property('applicationName')
              .eql(application.applicationName);
            done();
          }
        });
    });

    it("should not save application and return status 400", (done) => {
      chai.request(serverUrl)
        .post("/saveApplication")
        .send({
          applicationName: "Docket"
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

  describe("Testing getAll application api", () => {

    it("Should return all the applications", (done) => {
      chai.request(serverUrl)
        .get("/getAllApplications")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });

  });

  describe("Testing findByCode application api", () => {

    it("Should return 204 as no application identified by code", (done) => {
      chai.request(serverUrl)
        .get("/findByCode/CDA")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(204);
            done();
          }
        });
    });

  });

  describe("Testing save menuGroup api", () => {
    let menuGroup = {
      tenantId: "name",
      menuGroupCode: randomstring.generate(5),
      applicationCode: "269i",
      title: "fifth menugroup"
    };

    it("should save menuGroup and return same attribute values", (done) => {
      chai.request(serverUrl)
        .post("/saveMenuGroup")
        .send(menuGroup)
        .end((err, res) => {
          if (err) {
            debug(`error in the test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.have.property('menuGroupCode')
              .eql(menuGroup.menuGroupCode);
            done();
          }
        });
    });
    it("should not save role and return status 400", (done) => {
      chai.request(serverUrl)
        .post("/saveRole")
        .send({
          roleName: "admin"
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

  describe("Testing getAllMenuGroup by applicationCode api", () => {

    it("Should return menuGroups identified by code", (done) => {
      chai.request(serverUrl)
        .get("/getAllMenuGroup/:applicationCode")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });
  });
  describe("Testing save menuItem api", () => {
    let menuItemObj = {
      "tenantId": "name",
      "menuItemType": "quicklink",
      "applicationCode": "269i",
      "menuItemCode": "mi1",
      "createdBy": "pavithra",
      "creationDate": new Date().toISOString(),
      "title": "menu item1"
    };

    it("should save menuItem and return same attribute values", (done) => {
      chai.request(serverUrl)
        .post("/saveMenuItem")
        .send(menuItemObj)
        .end((err, res) => {
          if (err) {
            debug(`error in the test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.have.property('menuItemCode')
              .eql(menuItemObj.menuItemCode);
            done();
          }
        });
    });

    it("should not save menuItem and return status 400", (done) => {
      chai.request(serverUrl)
        .post("/saveMenuItem")
        .send({
          menuItemCode: 278568347
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

  describe("Testing getAll menuItem api", () => {

    it("Should return all the menuItems", (done) => {
      chai.request(serverUrl)
        .get("/getAllMenuItems")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });

    it("Should return no menuItem found", (done) => {
      chai.request(serverUrl)
        .get("/getAllApplications")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });
  });

  describe("Testing findMenuItemByCode  api", () => {

    it("Should return a menuItem identified by code", (done) => {
      chai.request(serverUrl)
        .get("/findMenuItemByCode/:applicationCode")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });
  });


  describe("Testing save role api", () => {
    let role = {
      tenantId: "tid",
      applicationCode: "269i",
      roleName: "CDA",
      roleType: "IT",
      description: "role",
      activationStatus: "active",
      processingStatus: "authorized",
      associatedUsers: 3,
      createdDate: new Date().toISOString(),
      createdBy: "kamalarani",
      lastUpdatedDate: new Date().toISOString(),
      menuItems: [{
        tenantId: "name",
        menuItemType: "quicklink",
        applicationCode: "CDA",
        menuItemCode: "mi4",
        createdBy: "user2",
        title: "menu item4"
      }, {
        tenantId: "name",
        menuItemType: "queues",
        applicationCode: "CDA",
        menuItemCode: "mi5",
        createdBy: "user3",
        title: "menu item5"
      }]
    };

    it("should save role and return same attribute values", (done) => {
      chai.request(serverUrl)
        .post("/saveRole")
        .send(role)
        .end((err, res) => {
          if (err) {
            debug(`error in the test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            res.body.should.have.property("roleName")
              .eql(role.roleName);
            done();
          }
        });
    });

    it("should not save role and return status 400", (done) => {
      chai.request(serverUrl)
        .post("/saveRole")
        .send({
          roleName: "admin"
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

  describe("Testing getAll role api", () => {

    it("Should return all the roles", (done) => {
      chai.request(serverUrl)
        .get("/getAllRoles")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });

    it("Should return no role found", (done) => {
      chai.request(serverUrl)
        .get("/getAllRoles")
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });
  });
  describe("Testing findMenuItemsByRoleName  api", () => {

    it("Should return a menuItems identified by roleName", (done) => {
      chai.request(serverUrl)
        .get('/findMenuItemsByRoleName/:roleName')
        .end((err, res) => {
          if (err) {
            debug(`error in test ${err}`);
            done(err);
          } else {
            res.should.have.status(200);
            done();
          }
        });
    });
  });
});