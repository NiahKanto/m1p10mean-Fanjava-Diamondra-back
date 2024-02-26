const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const service4OffreSchema = new Schema({
    idService: {type: Schema.Types.ObjectId, required: true},
    nom: {type: String, required: true},
    prix:{type: Number, required: true},
    delai:{type: Number, required: true},
    commission:{type: Number, required: true},
    etat:{type: Number, required:true}
});

const OffreSchema = new Schema({
    dateDebut: {type: Date, default: Date.now, required: true},
    dateFin: {type: Date, required: true},
    nom: {type: String, required: true},
    description: {type: String, required: true},
    prixTotal:{type: Number, required: true},
    service: [service4OffreSchema],    
});

const Offre = mongoose.model('Offre',OffreSchema);

module.exports = Offre;