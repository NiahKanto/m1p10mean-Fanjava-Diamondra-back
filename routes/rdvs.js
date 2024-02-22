const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken');

 
const rdvController = require('../controller/rdvController');

router.get('/all', authenticateToken, rdvController.all);

router.post('/add', authenticateToken,rdvController.add);

router.get('/findById/:id', authenticateToken,rdvController.findById);

router.post('/accept', authenticateToken,rdvController.accept);

router.post('/finish', authenticateToken, rdvController.finish);

router.get('/list-rdv-by-employee/:id', authenticateToken,rdvController.listByEmployee);

router.get('/list-by-client', authenticateToken,rdvController.listByClient);

module.exports = router;
