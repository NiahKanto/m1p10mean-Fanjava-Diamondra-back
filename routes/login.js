const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var router = express.Router();

const users = [
    { id: 1, username: 'user1', password: '$2a$10$nLsUFfQ0vzLbQgPLutm5ROaTSkxj.lZJtfb3ii3IEYP/aJIKNFw1m' } // hashed password: "password"
];

// Login route
router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    try {
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username, id: user.id }, 'secret', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Mot de passe incorrect' });
        }
    } catch (error) {
        console.error('Erreur de comparaison de mot de passe avec bcryptjs:', error);
        res.status(500).json({ message: 'Erreur de comparaison de mot de passe' });
    }
});

module.exports = router;

