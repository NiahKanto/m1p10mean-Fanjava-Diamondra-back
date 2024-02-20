const db = require("../models/allSchemas");     
const User = db.user;
const RDV = db.rdv;
const Service = db.service; 
const userController = require('../controller/userController');

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

exports.accept = async (req, res) => {
    const user = req.user;
    const isEmploye = await userController.testEmploye(user.roles);  

    if (!isEmploye) {
        return res.status(403).json({ message: "Vous n'êtes pas un employé." });
    }

    const { idRdv } = req.body;
    if (!idRdv) {
        return res.status(400).json({ message: "L'identifiant du rendez-vous est requis." });
    }

    try {
        const rdv = await RDV.findById(idRdv);
        if (!rdv) {
            return res.status(404).json({ message: "Le rendez-vous n'existe pas." });
        }

        if (rdv.etat !==  0) {
            return res.status(400).json({ message: "Le rendez-vous a déjà été traité." });
        }
        if (rdv.etat ===  0) {
            rdv.etat =  3; //  3=en Cours
            await rdv.save();
            return res.status(200).json({ message: "Le rendez-vous a été accepté avec succès." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'acceptation du rendez-vous : " + error });
    }
}

exports.finish = async (req, res) => {
    const user = req.user;
    const isEmploye = await userController.testEmploye(user.roles);   

    if (!isEmploye) {
        return res.status(403).json({ message: "Vous n'êtes pas un employé." });
    }

    const { idRdv } = req.body;
    if (!idRdv) {
        return res.status(400).json({ message: "L'identifiant du rendez-vous est requis." });
    }

    try {
        const rdv = await RDV.findById(idRdv);
        if (!rdv) {
            return res.status(404).json({ message: "Le rendez-vous n'existe pas." });
        }

        if (rdv.etat ===  1) {
            return res.status(400).json({ message: "Le rendez-vous a déjà été achevé." });
        }
        if (rdv.etat ===  3) {
            rdv.etat =  1; //  1=fini
            await rdv.save();
            return res.status(200).json({ message: "Le rendez-vous a été clos avec succès." });
        }


    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de l'achevement du rendez-vous : " + error });
    }
}

exports.listByEmployee = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ message: "L'ID de l'employé est requis." });
    }

    try {
        const rdvs = await RDV.find({ idEmployeResponsable: id });
        res.json(rdvs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}