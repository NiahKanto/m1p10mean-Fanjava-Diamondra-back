const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken');

const offreController = require('../controller/offreController');

router.post('/add', authenticateToken, offreController.add);

router.get('/list', authenticateToken, offreController.list);

router.get('/listToday', authenticateToken, offreController.listToday);

router.get('/detailsPack', authenticateToken, offreController.detailsPack);

module.exports = router;