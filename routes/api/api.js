module.exports = (router) => {

  require("./application")(router);
  require("./role")(router);
  require("./menu")(router);
  require("./entity")(router);
  require("./user")(router);
  require("./masterCurrency")(router);
  require("./masterTimeZone")(router);
  require("./lookup")(router);
  require("./supportedDateFormats")(router);
  require("./fileUpload")(router);

};