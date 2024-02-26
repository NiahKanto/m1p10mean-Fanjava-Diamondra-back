const db = require("../models/allSchemas");     
const User = db.user;
const Service = db.service; 
const Offre = db.offre; 
const userController = require('../controller/userController');
const mongoose = require('mongoose');

exports.add = async (req, res) => {
    const user = req.user;
    const isManager = await userController.testManager(user.roles)

    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }

    if(new Date(req.body.dateDebut) > new Date(req.body.dateFin)){
        return res.status(400).json({message: "La date de debut doit etre ulterieure a la date de fin"})
    }

    try{
        const {dateDebut, dateFin, nom, description, service, reduction} = req.body;
        const idUser = req.user.id;

        totalPrix = 0;
        const servicesWithData = await Promise.all(service.map(async (idService) => {
            const serviceData = await Service.findById(idService);
            if(serviceData === null){
                throw new Error("Un des services est invalide")
            }
            newPrix = serviceData.prix - (serviceData.prix*(reduction/100));
            totalPrix += newPrix;
            return {
                idService: idService,
                nom: serviceData.nom,
                prix: newPrix,
                delai: serviceData.delai,
                commission: serviceData.commission,
                etat: 0,
            };
        }) ); 
        
        const offre = {
            dateDebut: dateDebut,
            dateFin : dateFin,
            service : servicesWithData,
            nom: nom,
            description: description,
            prixTotal : totalPrix
        };

       
        Offre.create(offre).then(modele => {
            return res.status(200).json({message: 'Offre insérée avec succès'})
        }).catch(error =>{
            return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
        });

    } catch(error){
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    }
}

exports.list = async (req, res) => {
    try { 
        const offres = await Offre.find();
        res.json(offres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.listToday = async (req, res) => {
    try { 
        const offres = await Offre.find({
            dateDebut : { $lte : new Date() },
            dateFin : { $gte: new Date() }
        });
        res.json(offres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}