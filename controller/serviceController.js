const db = require("../models/allSchemas");     
const RDV = require('../models/RDV')
const Service = db.service; 
const mongoose = require('mongoose');

const userController = require('../controller/userController');

exports.all = async (req, res) => {
    try{ 
        services = await Service.find();
        res.json(services);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.add = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const prix = req.body.prix;
    const delai = req.body.delai;
    const commission = req.body.commission;
    if(prix<=0){
        return res.status(400).json({message: 'Le prix ne doit pas etre negatif ou nul'})
    }
    if(delai<=0){
        return res.status(400).json({message: 'Le delai ne doit pas etre negatif ou nul'})
    }
    if(commission<0){
        return res.status(400).json({message: 'La commission ne doit pas etre negative'})
    }
    if(commission>100){
        return res.status(400).json({message: 'La commission doit etre inferieure a 100'})
    }
    const service = await Service.findOne({nom: req.body.nom});
    if(service !== null){
        return res.status(409).json({message: 'Ce nom de service existe deja'})
    }
    Service.create(req.body).then(modele => {
        return res.status(200).json({message: 'Service insere avec succes'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    });
}

exports.findById = async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new mongoose.Types.ObjectId(id);
        const services = await Service.findById(objectId);

        console.log("idd"+id)
    
        if (!services) {
          return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.json(services);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
}

exports.modifyNom = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const nom = req.body.nom
    const id= req.body.id

    if (!id) {
        return res.status(400).json({ message: "L'ID du service est requis." });
    }

    const service = await Service.findOne({nom:nom});
    if(service !== null){
        return res.status(409).json({message: 'Ce nom de service existe deja'})
    }
    Service.findByIdAndUpdate(id,{nom: nom},{new: false}).then(modele => {
        return res.status(200).json({message: 'Service modifié avec succès'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de la modification :'+error})
    });
}

exports.modifyPrix = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const prix = req.body.prix
    const id= req.body.id

    if (!id) {
        return res.status(400).json({ message: "L'ID du service est requis." });
    }

    if(prix<=0){
        return res.status(400).json({message: 'Le prix ne doit pas etre negatif ou nul'})
    }

    Service.findByIdAndUpdate(id,{prix: prix},{new: false}).then(modele => {
        return res.status(200).json({message: 'Service modifié avec succès'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de la modification :'+error})
    });
}

exports.modifyDelai = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const delai = req.body.delai
    const id= req.body.id

    if (!id) {
        return res.status(400).json({ message: "L'ID du service est requis." });
    }

    if(delai<=0){
        return res.status(400).json({message: 'Le delai ne doit pas etre negatif ou nul'})
    }

    Service.findByIdAndUpdate(id,{delai: delai},{new: false}).then(modele => {
        return res.status(200).json({message: 'Service modifié avec succès'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de la modification :'+error})
    });
}

exports.modifyCommission = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const commission = req.body.commission
    const id= req.body.id

    if (!id) {
        return res.status(400).json({ message: "L'ID du service est requis." });
    }

    if(commission<0){
        return res.status(400).json({message: 'La commission ne doit pas etre negative'})
    }

    if(commission>100){
        return res.status(400).json({message: 'La commission doit etre inferieure a 100'})
    }

    Service.findByIdAndUpdate(id,{commission: commission},{new: false}).then(modele => {
        return res.status(200).json({message: 'Service modifié avec succès'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de la modification :'+error})
    });
}

exports.delete = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const id= req.body.id

    if (!id) {
        return res.status(400).json({ message: "L'ID du service est requis." });
    }

    Service.findByIdAndDelete(id).then(modele => {
        return res.status(200).json({message: 'Service supprimé avec succès'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de la modification :'+error})
    });
}
 