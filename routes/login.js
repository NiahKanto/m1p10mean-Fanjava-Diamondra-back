const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();
const {connectToDB} = require('../db/db');

const collectionName = 'user';
// Login route
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const db = await connectToDB();
    const collection = db.collection(collectionName);
    const user = await collection.findOne({nom: username})

    if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    try {
        if (await bcrypt.compare(password, user.mdp)) {
            const token = jwt.sign({ username: user.nom, id: user._id }, 'secret', { expiresIn: '1h' });
            res.json({ token,user });
        } else {
            res.status(401).json({ message: 'Mot de passe incorrect' });
        }
    } catch (error) {
        console.error('Erreur de comparaison de mot de passe avec bcryptjs:', error);
        res.status(500).json({ message: 'Erreur de comparaison de mot de passe' });
    }
});

module.exports = router;

