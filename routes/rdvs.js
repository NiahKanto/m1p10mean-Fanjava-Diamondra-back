const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')
const RDV = require('../models/RDV')
const Service = require('../models/service')

async function testClient(rolesUser){
    if(rolesUser.some(role => role.nomRole === 'client')){
        return true;
    } else{
        return false;
    }
}

router.post('/add', authenticateToken, async (req, res) => {
    const user = req.user;
    const isClient = await testClient(user.roles)

    if(isClient === false){
        return res.status(403).json({message : 'Vous n\'etes pas un client' });
    }

    if(new Date(req.body.dateHeure) < Date.now()){
        return res.status(400).json({message: "La date du rendez-vous doit etre ulterieure a l'heure actuelle"})
    }

    try{
        const {dateHeure, service} = req.body;
        const idUser = req.user.id;

        const servicesWithData = await Promise.all(service.map(async (serv) => {
            const {idService, idEmploye} = serv;
            const serviceData = await Service.findById(idService);
            if(serviceData === null){}
            return {
                ...serv,
                nom: serviceData.nom,
                prix: serviceData.prix,
                delai: serviceData.delai,
                commission: serviceData.commission,
                etat: 0
            };
        }));
        const rdv = {
            idUser,
            dateHeure: new Date(dateHeure),
            service : servicesWithData
        };
        console.log(rdv);


        RDV.create(rdv).then(modele => {
            return res.status(200).json({message: 'RDV insere avec succes'})
        }).catch(error =>{
            return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
        });

    } catch(error){
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    }
});

module.exports = router;
