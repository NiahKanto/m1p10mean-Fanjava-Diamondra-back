const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepenseSchema = new mongoose.Schema({
    nom: {type: String, required: true},
    prix:{type: Number, required: true},
    date: {type: Date, required: true},
});

const Depense = mongoose.model('Depense',DepenseSchema);
module.exports = Depense;