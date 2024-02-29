const db = require("../models/allSchemas");     
const Depense = db.depense; 
const mongoose = require('mongoose');

const userController = require('../controller/userController');

exports.all = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    try{ 
        depenses = await Depense.find();
        res.json(depenses);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.add = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const prix = req.body.prix;
    if(prix<=0){
        return res.status(400).json({message: 'Le prix ne doit pas etre negatif ou nul'})
    }
    Depense.create(req.body).then(modele => {
        return res.status(200).json({message: 'Depense insere avec succes'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    });
}