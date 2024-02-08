const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const service4RDVSchema = new Schema({
    idService: {type: Schema.Types.ObjectId, required: true},
    nom: {type: String, required: true},
    prix:{type: Number, required: true},
    delai:{type: Number, required: true},
    commission:{type: Number, required: true},
    idEmploye: {type: Schema.Types.ObjectId, required: true},
    nomEmploye: {type: String, required: true},
    etat:{type: Number, required:true}
});

const RDVSchema = new Schema({
    idUser: {type: Schema.Types.ObjectId, required: true},
    dateHeure: {type: Date, default: Date.now},
    service: [service4RDVSchema]
});

const RDV = mongoose.model('RDV',RDVSchema);

module.exports = RDV;