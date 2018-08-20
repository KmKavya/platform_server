module.exports.validObject1 = {
  // valid entity object
  "tenantId": "T001",
   "entityCode": "entity1",
  "name": "HeadOffice",
  "parent": "HeadOffice",
  "description": "bc1 description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-07-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
  "accessLevel": "1",
  "enableFlag": "1",
  "entityId": "H001B001"
};

module.exports.validObject2 = {
  // valid entity object
  "tenantId": "T001",
   // "entityCode": "entity2",
  "name": "southZone",
  "parent": "HeadOffice",
  "description": "southZone description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-06-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-06-05T12:25:22.895Z",
  "accessLevel": "1",
  "enableFlag": "1",
  "entityId": "H001B001def34"
};

module.exports.validObject3 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "entity3",
  "name": "northZone",
  "parent": "HeadOffice",
  "description": "northZone descriptionnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
  "createdBy": "SYSTEM",
  "createdDate": "2018-05-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-05-05T12:25:22.895Z",
  "enableFlag": "1"
};

module.exports.validObject4 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "entity4",
  "name": "tamilNadu",
  "parent": "southZone",
  "description": "tamilNadu description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "3",
  "enableFlag": 1,
  "entityId": "H001B001def34tyu78"
};

module.exports.validObject5 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "ENTITY5",
  "name": "karnataka",
  "parent": "southZone",
  "description": "southZone for updation description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "3",
  "enableFlag": 1,
  "entityId": "H001B001def34jki78"
};

module.exports.validObject6 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "entity6",
  "name": "mumbai",
  "parent": "northZone",
  "description": "mumbai description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "3",
  "enableFlag": 1,
  "entityId": "H001B001ghi56jik34"
};

module.exports.validObject7 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "entity7",
  "name": "maharastra",
  "parent": "northZone",
  "contact": {
    "tenantId": "IVL",
    "firstName": "vignesh",
    "middleName": "varan",
    "lastName": "p",
    "emailId": "xyz@gmail.com",
    "emailVerified": true,
    "phoneNumber": "111111111"
  },
  "description": "maharastra description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-04-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-04-05T12:25:22.895Z",
  "accessLevel": "3",
  "enableFlag": 1,
  "entityId": "H001B001ghi56sde90"
};

module.exports.validObject8 = {
  // valid entity object
  "tenantId": "T001",
  "entityCode": "entity8",
  "name": "chennai",
  "parent": "tamilNadu",
  "contact": {
    "tenantId": "IVL",
    "firstName": "vignesh",
    "middleName": "varan",
    "lastName": "p",
    "emailId": "xyz@gmail.com",
    "emailVerified": true,
    "phoneNumber": "111111111"
  },
  "description": "chennai description",
  "createdBy": "SYSTEM",
  "createdDate": "2018-07-05T12:25:22.895Z",
  "lastUpdatedDate": "2018-07-05T12:25:22.895Z",
  "accessLevel": "4",
  "enableFlag": "1",
  "entityId": "H001B001def34tyu78hju67"
};

module.exports.invalidObject1 = {
  // invalid entity object
  "tenantId": "T001",
  "parent": "headOffice",
  "description": "northZone description",
  "createdBy": "SYSTEM",
  "createdDate": new Date().toISOString(),
  "lastUpdatedDate": new Date().toISOString(),
  "accessLevel": "2",
  "entityId": "H001B001jjmjk"
};
