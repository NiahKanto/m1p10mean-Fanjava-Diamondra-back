const db = require("../models/allSchemas");     
const User = db.user;
const RDV = db.rdv;
const Service = db.service; 
const userController = require('../controller/userController');
const mongoose = require('mongoose');

exports.all = async (req, res) => {
    try{ 
        rdvs = await RDV.find();
        res.json(rdvs);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.add = async (req, res) => {
    const user = req.user;
    const isClient = await userController.testClient(user.roles)

    if(isClient === false){
        return res.status(403).json({message : 'Vous n\'etes pas un client' });
    }

    if(new Date(req.body.dateHeure) < Date.now()){
        return res.status(400).json({message: "La date du rendez-vous doit etre ulterieure a l'heure actuelle"})
    }

    try{
        console.log('anaty trry')
        const {dateHeure, service} = req.body;
        const idUser = req.user.id;

        const servicesWithData = await Promise.all(service.map(async (serv) => {
            const {idService, idEmploye} = serv;
            const serviceData = await Service.findById(idService);
            if(serviceData === null){
                throw new Error("Un des services est invalide")
            }
            if(idEmploye !== null){
                const emp = await User.findById(idEmploye);
                if(emp === null){
                    throw new Error("Un des employes est inexistant")
                }

                const isEmploye = await userController.testEmploye(emp.roles);
                if(isEmploye === false){
                    throw new Error("Un des employes est inexistant")
                }
                return {
                    ...serv,
                    nom: serviceData.nom,
                    prix: serviceData.prix,     
                    delai: serviceData.delai,
                    commission: serviceData.commission,
                    nomEmploye: emp.nom,
                    etat: 0
                };
            }
            return {
                idService: idService,
                nom: serviceData.nom,
                prix: serviceData.prix,
                delai: serviceData.delai,
                commission: serviceData.commission,
                etat: 0
            };
        }) );                 

        const rdv = {
            idUser,
            dateHeure: new Date(dateHeure),
            service : servicesWithData
        };
        RDV.create(rdv).then(modele => {
            return res.status(200).json({message: 'RDV inséré avec succès'})
        }).catch(error =>{
            return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
        });

    } catch(error){
        return res.status(500).json({message: 'Erreur lors de l\'insertion :'+error})
    }
}

exports.findById = async (req, res) => {
    try {
        const { id } = req.params;
        const rdv = await RDV.findById(id);
        console.log('anaty yr'+rdv);
    
        if (!rdv) {
          return res.status(404).json({ message: 'Rendez-vous non trouvé' });
        }
        res.json(rdv);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
}
//historiqueRDV
exports.listByEmployee = async (req, res) => {
    const { id } = req.user;
    const objectId = new mongoose.Types.ObjectId(id);

    try {
        // Use the ObjectId in the query
        const rdvs = await RDV.find({ 'service.idEmploye': objectId });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.listByClient = async (req, res) => {
    const user = req.user;
    const isClient = await userController.testClient(user.roles)

    if(isClient === false){
        return res.status(403).json({message : 'Vous n\'etes pas un client' });
    }

    try {
        const total = await RDV.aggregate([
            {
                $match:{
                    idUser: new db.mongoose.Types.ObjectId(user.id)
                }
            },
            {$unwind: "$service"},
            {
                $group:{
                    _id: '$_id',

                    totalMontant: {$sum : "$service.prix"},
                    totalDuree: {$sum : "$service.delai"}
                }
            }
        ]);

        const rdvs = await RDV.find({idUser: user.id});
        const totalRdvs = total.reverse();
        res.json({totalRdvs,rdvs});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.rdvToday = async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.status(400).json({ message: "L'ID de l'employé est requis." });
    }
    console.log(id);
    const objectId = new mongoose.Types.ObjectId(id);

    // Get the current date and time in UTC
    const today = new Date(new Date().toISOString().slice(0,  10) + "T00:00:00Z");
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() +  1); // Set to tomorrow
    const endOfToday = new Date(tomorrow); // This will be just after midnight of tomorrow
    endOfToday.setSeconds(endOfToday.getSeconds() - 1); // Set it just before midnight

    console.log(today);
    console.log(endOfToday);
    try {
        // Use the ObjectId and the date range in the query
        const rdvs = await RDV.find({
            'service.idEmploye': objectId,
            dateHeure: { $gte: today, $lt: endOfToday }
        });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findServ4RDV = async (req, res) => {
    try{ 
        const { idRDV } = req.params;
        const { idService } = req.params;
        console.log("idRDV=="+idRDV);
        console.log("idService=="+idService);
        const rdvs = await RDV.findOne({'_id':idRDV, 'service.idService':idService  });
        res.json(rdvs.service[0]);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}
//test ah zao
exports.findServ4RDVbyEmp = async (req, res) => {
    try {
        const { id } = req.user;
        const objectId = new mongoose.Types.ObjectId(id);
 
        console.log("idEMP==" + objectId);
        
        const rdvs = await RDV.find({'service.idEmploye': objectId });
        
        let allServices = [];
        
        for (const rdv of rdvs) {
            for (const service of rdv.service) {
                const user = await User.findById(rdv.idUser);
                if (!user) {
                    throw new Error("Utilisateur non trouvé");
                }
                
                let serviceWithInfo = {
                    dateHeure: rdv.dateHeure,
                    idUser: rdv.idUser,
                    nomUser: user.nom, 
                    service: service
                };
                allServices.push(serviceWithInfo);
            }
        }

        res.json(allServices);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

exports.acceptservice = async (req, res) => {
    const user = req.user;
    const isEmploye = await userController.testEmploye(user.roles);  

    if (!isEmploye) {
        return res.status(403).json({ message: "Vous n'êtes pas un employé." });
    }

    const { idService } = req.params;
    const { idRDV } = req.params;
    try {
        const { id } = req.user;
        const idEmp = new mongoose.Types.ObjectId(id);

        console.log("idRDV="+idRDV);
        console.log("idService="+idService);
        console.log("id employe="+id);
        
        const rdv = await RDV.findOne({'_id':idRDV, 'service.idService':idService  });
        console.log("rdv="+rdv);
        console.log('----------------------------------------')
        console.log("rdv.service[0]="+rdv.service[0]);
        console.log("rdv.service[0].etat="+rdv.service[0].etat);
        if (rdv.service[0].etat !==  0) {
            return res.status(400).json({ message: "Le service a déjà été traité." });
        }
        if (rdv.service[0].etat ===  0) {
            rdv.service[0].etat =  1; //  1=en Cours
            rdv.service[0].idEmploye=id;
            await rdv.save();
            return res.status(200).json({ message: "Le service a été accepté avec succès." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'acceptation du service : " + error });
    }
}

exports.finishservice = async (req, res) => {
    const user = req.user;
    const isEmploye = await userController.testEmploye(user.roles);  

    if (!isEmploye) {
        return res.status(403).json({ message: "Vous n'êtes pas un employé." });
    }

    const { idService } = req.params;
    const { idRDV } = req.params;
    try {
        const { id } = req.user;
        const idEmp = new mongoose.Types.ObjectId(id);

        console.log("idRDV="+idRDV);
        console.log("idService="+idService);
        console.log("id employe="+id);
        
        const rdv = await RDV.findOne({'_id':idRDV, 'service.idService':idService  });
        console.log("rdv="+rdv);
        console.log('----------------------------------------')
        console.log("rdv.service[0]="+rdv.service[0]);
        console.log("rdv.service[0].etat="+rdv.service[0].etat);
        if (rdv.service[0].etat ===  2) {
            return res.status(400).json({ message: "Le service a déjà été terminé." });
        }
        if (rdv.service[0].etat ===  1) {
            rdv.service[0].etat =  2; 
            await rdv.save();
            return res.status(200).json({ message: "Le service a été terminé avec succès." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'achevement du service : " + error });
    }
}