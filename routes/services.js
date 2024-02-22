const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')


const serviceController = require('../controller/serviceController');

router.get('/all', authenticateToken, serviceController.all);

router.post('/add', authenticateToken, serviceController.add);

router.get('/findById/:id', authenticateToken, serviceController.findById);


module.exports = router;