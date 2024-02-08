const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const allSchemas = {};

allSchemas.mongoose = mongoose;

allSchemas.user = require("./user");
allSchemas.role = require("./roles");
allSchemas.role = require("./service");
allSchemas.role = require("./RDV")

allSchemas.ROLES = ["client", "employe", "manager"];

module.exports = allSchemas;