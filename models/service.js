const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prix:{
        type: Number,
        required: true
    },
    delai:{
        type: Number,
        required: true
    },
    commission:{
        type: Number,
        required: true
    }
});

const Service = mongoose.model('Service',ServiceSchema);
module.exports = Service;