const mongoose = require("mongoose");

const Role = mongoose.model(
  "Role",
  new mongoose.Schema({
    nomRole: String
  })
);

module.exports = Role;