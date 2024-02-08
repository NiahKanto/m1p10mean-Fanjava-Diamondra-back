const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')
const Service = require('../models/service')

async function testManager(rolesUser){
    if(rolesUser.some(role => role.nomRole === 'manager')){
        return true;
    } else{
        return false;
    }
}

router.get('/all', authenticateToken, async (req, res) => {
    const user = req.user;
    const isManager = await testManager(user.roles)
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    try{ 
        services = await Service.find();
        res.json(services);
    } catch(error){
        res.status(500).json({message: error.message})
    }

});

router.post('/add', authenticateToken, async (req, res) => {
    const user = req.user;
    const isManager = await testManager(user.roles)
    console.log(user);
    if(isManager === false){
        return res.status(403).json({message : 'Vous n\'etes pas un manager' });
    }
    const prix = req.body.prix;
    const delai = req.body.delai;
    const commission = req.body.commission;
    if(prix<0){
        return res.status(400).json({message: 'Le prix ne doit pas etre negatif'})
    }
    if(delai<0){
        return res.status(400).json({message: 'Le delai ne doit pas etre negatif'})
    }
    if(commission<0){
        return res.status(400).json({message: 'La commission ne doit pas etre negative'})
    }
    const service = await Service.findOne({nom: req.body.nom});
    if(service !== null){
        return res.status(409).json({message: 'Ce nom service existe deja'})
    }
    Service.create(req.body).then(modele => {
        return res.status(200).json({message: 'Service insere avec succes'})
    }).catch(error =>{
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    });
});

module.exports = router;