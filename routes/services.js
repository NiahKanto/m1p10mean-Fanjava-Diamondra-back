const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')


const serviceController = require('../controller/serviceController');

router.get('/all', authenticateToken, serviceController.all);

router.post('/add', authenticateToken, serviceController.add);

router.get('/findById/:id', authenticateToken, serviceController.findById);

// router.post('/start', authenticateToken, async (req, res) => {
//     const user = req.user;
//     const isEmploye = await testEmploye(user.roles);  

//     if (!isEmploye) {
//         return res.status(403).json({ message: "Vous n'êtes pas un employé." });
//     }

//     const { idRdv } = req.body;
//     if (!idRdv) {
//         return res.status(400).json({ message: "L'identifiant du rendez-vous est requis." });
//     }

//     try {
//         const rdv = await RDV.findById(idRdv);
//         if (!rdv) {
//             return res.status(404).json({ message: "Le rendez-vous n'existe pas." });
//         }
 
//             rdv.etat =  3; //  3=en Cours
//             await rdv.save();
//             return res.status(200).json({ message: "Le rendez-vous a été accepté avec succès." });
//     } catch (error) {
//         return res.status(500).json({ message: "Erreur lors de l'acceptation du rendez-vous : " + error });
//     }
// });
module.exports = router;