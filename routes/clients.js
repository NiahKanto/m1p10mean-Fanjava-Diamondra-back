const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/AuthenticateToken')

router.get('/', authenticateToken, (req, res) => {
    const user = req.user;
    res.json({user : user});
});

module.exports = router;