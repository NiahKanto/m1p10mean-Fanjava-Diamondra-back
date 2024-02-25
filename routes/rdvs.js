const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken');

 
const rdvController = require('../controller/rdvController');

router.get('/all', authenticateToken, rdvController.all);

router.post('/add', authenticateToken,rdvController.add);

router.get('/findById/:id', authenticateToken,rdvController.findById);

router.get('/historic-by-employee', authenticateToken,rdvController.listByEmployee);

router.get('/rdvToday', authenticateToken,rdvController.rdvToday);

router.get('/list-by-client', authenticateToken,rdvController.listByClient);

router.post('/acceptServ/:idRDV/:idService', authenticateToken,rdvController.acceptservice);

router.post('/finishServ/:idRDV/:idService', authenticateToken,rdvController.finishservice);

router.get('/findServ4RDV/:idRDV/', authenticateToken,rdvController.findServ4RDV);

router.get('/findServ4RDVbyEmp', authenticateToken,rdvController.findServ4RDVbyEmp);

router.get('/listAfaire', authenticateToken,rdvController.listAfaire);

router.get('/listEnCours', authenticateToken,rdvController.listEnCours);

router.get('/listFini', authenticateToken,rdvController.listFini);

router.get('/nextRDV', authenticateToken,rdvController.nextRDV);

router.get('/findRDV4Serv/:idService', authenticateToken,rdvController.findRDV4Serv);

router.post('/pay', authenticateToken,rdvController.pay);

router.post('/assignerservice/:idService', authenticateToken,rdvController.assignerservice);

router.get('/listServiceNonAssignes', authenticateToken,rdvController.listServiceNonAssignes);

module.exports = router;
