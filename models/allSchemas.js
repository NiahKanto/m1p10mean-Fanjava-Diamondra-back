const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const allSchemas = {};

allSchemas.mongoose = mongoose;

//atao samihafa pour chaque modele 
allSchemas.user = require("./user");
allSchemas.role = require("./roles");
allSchemas.service = require("./service");
allSchemas.rdv = require("./RDV")

allSchemas.ROLES = ["client", "employe", "manager"];

module.exports = allSchemas;