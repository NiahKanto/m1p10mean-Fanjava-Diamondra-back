const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')


const depenseController = require('../controller/depenseController');

router.get('/all', authenticateToken, depenseController.all);

router.post('/add', authenticateToken, depenseController.add);


module.exports = router;