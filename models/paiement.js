const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaiementSchema = new mongoose.Schema({
    idUser: {type: Schema.Types.ObjectId, required: true},
    idRDV: {type: Schema.Types.ObjectId, required: true},
    montant:{type: Number, required: true},
    datePaiement: {type: Date, default: Date.now},
});

const Paiement = mongoose.model('Paiement',PaiementSchema);
module.exports = Paiement;