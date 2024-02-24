const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')


const serviceController = require('../controller/serviceController');

router.get('/all', authenticateToken, serviceController.all);

router.post('/add', authenticateToken, serviceController.add);

router.get('/findById/:id', authenticateToken, serviceController.findById);

router.post('/modifyNom', authenticateToken, serviceController.modifyNom);

router.post('/modifyPrix', authenticateToken, serviceController.modifyPrix);

router.post('/modifyDelai', authenticateToken, serviceController.modifyDelai);

router.post('/modifyCommission', authenticateToken, serviceController.modifyCommission);

router.post('/delete', authenticateToken, serviceController.delete);


module.exports = router;