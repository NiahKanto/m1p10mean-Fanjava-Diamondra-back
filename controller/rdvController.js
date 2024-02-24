const db = require("../models/allSchemas");     
const User = db.user;
const RDV = db.rdv;
const Paiement = db.paiement;
const Service = db.service; 
const userController = require('../controller/userController');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

    if(new Date(req.body.dateHeure).getDay() === 0){
        return res.status(400).json({message: "La date est un dimanche"})
    }

    heure = new Date(req.body.dateHeure).getHours();
    if(heure < 8 || heure>17){
        return res.status(400).json({message: "L\'heure est en dehors de la plage de travail (8h-17h)"})
    }

    try{
        console.log('anaty trry')
        const {dateHeure, service} = req.body;
        const idUser = req.user.id;

        duree = 0;
        const servicesWithData = await Promise.all(service.map(async (serv) => {
            const {idService, idEmploye} = serv;
            const serviceData = await Service.findById(idService);
            if(serviceData === null){
                throw new Error("Un des services est invalide")
            }
            duree += serviceData.delai;
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
                etat: 0,
            };
        }) ); 
        
        dateDebut = new Date(dateHeure);
        dateFin = new Date(new Date(dateHeure).getTime()+(duree*60000));

        console.log(dateDebut + ' - ' + dateFin); 
        
        const rdv = {
            idUser,
            dateHeure: dateDebut,
            dateFin : dateFin,
            service : servicesWithData
        };

        rdvExist = await RDV.findOne({
            idUser: idUser,
            $or:
            [
                { dateHeure: { $lte: dateDebut}, dateFin: { $gt: dateDebut}},
                { dateHeure: { $lt: dateFin}, dateFin: { $gte: dateFin}},
                { dateHeure: { $gte: dateDebut}, dateFin: { $lte: dateFin}},
            ] 
        });

        if(rdvExist){
            return res.status(400).json({message: "Vous avez déjà un rendez-vous dans cette intervalle de temps"})
        }

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
        const rdvs = await RDV.find({idUser: user.id}).sort({dateHeure:-1});
        totalRdvs = [];
        const promises = rdvs.map(async (rdv) =>{
            totalMontant = 0;
            totalDuree = 0;
            rdv.service.forEach(service => {
                totalMontant = totalMontant + service.prix;
                totalDuree = totalDuree + service.delai;
            })
            const paiements = await Paiement.find({idRDV: rdv._id});
            totalPaiement = 0;
            paiements.forEach((paiement) =>{
                totalPaiement += paiement.montant
            })
            total = {
                totalMontant: totalMontant,
                totalDuree: totalDuree,
                totalPaiement: totalPaiement
            }
            return total;
        });
        totalRdvs = await Promise.all(promises);
        console.log(totalRdvs)
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

exports.findServ4RDVbyEmp = async (req, res) => {
    try {
        const { id } = req.user;
        const objectId = new mongoose.Types.ObjectId(id);
 
        console.log("idEMP==" + objectId);
        
        const rdvs = await RDV.find();
        
        let allServices = [];
        
        for (const rdv of rdvs) {
            for (const service of rdv.service) {
                if(service.idEmploye == id)
                {
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
        }

        res.json(allServices);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

exports.listAfaire = async (req, res) => {
    try { 
        const rdvs = await RDV.find({'service.etat':0 });
        
        let allServices = [];
        
        rdvs.forEach(rdv => {
            rdv.service.forEach(service => {
                if (service.etat === 0) {
                    allServices.push(service);
                }
            });
        });

        res.json(allServices);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

exports.listEnCours = async (req, res) => {
    try { 
        const { id } = req.user;
        const objectId = new mongoose.Types.ObjectId(id);

        console.log('idEmploye=='+id)
        const rdvs = await RDV.find({'service.etat':1, 'service.idEmploye': id });
        let allServices = [];
        
        rdvs.forEach(rdv => {
            rdv.service.forEach(service => {

                if (service.etat === 1) {
                    allServices.push(service);
                }
            });
        });

        res.json(allServices);
    } catch(error) {
        res.status(500).json({ message: error.message });
    }
}

exports.listFini = async (req, res) => {
    try { 
        const { id } = req.user;
        const objectId = new mongoose.Types.ObjectId(id);

         // Get the current date and time in UTC
        const today = new Date(new Date().toISOString().slice(0,  10) + "T00:00:00Z");
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() +  1); // Set to tomorrow
        const endOfToday = new Date(tomorrow); // This will be just after midnight of tomorrow
        endOfToday.setSeconds(endOfToday.getSeconds() - 1); // Set it just before midnight

        console.log(today);
        console.log(endOfToday);

        const rdvs = await RDV.find({
            'service.etat':2, 
            'service.idEmploye': objectId ,
            dateHeure: { $gte: today, $lt: endOfToday }
        });
        
        let allServices = [];
        
        rdvs.forEach(rdv => {
            rdv.service.forEach(service => {
                if (service.etat === 2) {
                    allServices.push(service);
                }
            });
        });

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

    const { idService, idRDV } = req.params;

    try {
        const { id } = req.user;
        const idEmp = new mongoose.Types.ObjectId(id);

        console.log("idRDV="+idRDV);
        console.log("idService="+idService);
        console.log("id employe="+id);
        
        const rdv = await RDV.findOne({'_id': idRDV, 'service.idService': idService });
        console.log("rdv="+rdv);
        console.log('----------------------------------------')
        
        let serviceTraiteAvecSucces = false;

        for (const service1 of rdv.service) {
            console.log("service[i]="+service1);
            if (service1.etat === 0) {
                service1.etat = 1;
                service1.idEmploye = id;
                serviceTraiteAvecSucces = true;  
            }
        }

        if (serviceTraiteAvecSucces) {
            await rdv.save();
            return res.status(200).json({ message: "Le service a été accepté avec succès." });
        } else  {
            return res.status(400).json({ message: "Aucun service n'a été accepté." });
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
        
        let serviceTraiteAvecSucces = false;

        for (const service1 of rdv.service) {
            console.log("service[i]="+service1);
            if (service1.etat === 1) {
                service1.etat = 2; 
                serviceTraiteAvecSucces = true;  
            }
        }

        if (serviceTraiteAvecSucces) {
            await rdv.save();
            return res.status(200).json({ message: "Le service  a été terminé  avec succès." });
        } else  {
            return res.status(400).json({ message: "Aucun service n'a été terminé." });
        }
        
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'achevement du service : " + error });
    }
}

exports.nextRDV = async (req, res) => {
    const user = req.user;
    const isClient = await userController.testClient(user.roles)

    if(isClient === false){
        return res.status(403).json({message : 'Vous n\'etes pas un client' });
    }

    try {
        totalMontant = 0;
        totalDuree = 0;
        totalRdv={}
        const rdv = await RDV.findOne({idUser: user.id, dateHeure:{$gt: new Date()}}).sort({dateHeure:1});
        if(rdv){
            rdv.service.forEach(service => {
                totalMontant +=  service.prix;
                totalDuree += service.delai;
            })
    
            totalRdv = {
                totalMontant: totalMontant,
                totalDuree: totalDuree
            };
        }

        res.json({totalRdv,rdv});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.findRDV4Serv = async (req, res) => {
    try{ 
        const { idService } = req.params;
        console.log("idService=="+idService);
        const rdvs = await RDV.findOne({ 'service._id':idService  });
        res.json(rdvs);
    } catch(error){
        res.status(500).json({message: error.message})
    }
}

exports.pay = async (req, res) => {
    const user = req.user;
    const isClient = await userController.testClient(user.roles)

    if(isClient === false){
        return res.status(403).json({message : 'Vous n\'etes pas un client' });
    }

    const id= req.body.id
    const montant = req.body.montant
    const mdp = req.body.mdp

    if (!id) {
        return res.status(400).json({ message: "L'ID du rendez-vous est requis." });
    }

    if(montant<=0){
        return res.status(400).json({message: 'Le montant a payer ne doit pas etre negatif ou nul'})
    }

    user2 = await User.findById(user.id)

    const allow = await bcrypt.compare(mdp, user2.mdp);
    if(!allow){
        return res.status(400).json({message: 'Le mot de passe est incorrect'})
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const rdv = await RDV.findById(id);
        if(rdv === null){
            return res.status(400).json({message: 'Rendez-vous non trouvé'})
        }
        montantRDV = 0;
        montantPaiement = 0;
        rdv.service.map(serv =>{
            montantRDV += serv.prix;
        });
        const paiements = await Paiement.find({idRDV: id});
        paiements.map(paiement =>{
            montantPaiement += paiement.montant;
        });

        reste = montantRDV - montantPaiement;
        if(montant > reste){
            return res.status(400).json({message: 'Le montant est plus grand que le reste à payer'})
        }

        if(montant === reste){
            await RDV.findByIdAndUpdate(id,{etat: 1},{new: false})
        }

        const paiement = {
            idUser: user.id,
            idRDV: id,
            montant
        };

        Paiement.create(paiement).then(modele => {
            return res.status(200).json({message: 'Paiement effectué avec succès'})
        }).catch(error =>{
            return res.status(500).json({message: 'Erreur lors du paiement :'+error})
        });

    } catch(error){
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({message: 'Erreur lors du paiement :'+error})
    }
}