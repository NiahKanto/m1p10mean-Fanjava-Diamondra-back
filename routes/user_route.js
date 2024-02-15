var express = require('express');
var router = express.Router(); 
const authenticateToken = require('../middlewares/AuthenticateToken')
 
const userController = require('../controller/userController');

//api login , migerer hoe valide ve ilay mail, ensuite hoe true ve mdp, mireturn données users izyy 
router.post('/login_user', authenticateToken,userController.loginUser);

router.post('/inscription_user', authenticateToken,userController.inscription_user);

router.post('/inscription_emp',authenticateToken, userController.inscription_emp);

router.post('/inscription_manager',authenticateToken,  userController.inscription_manager);

router.get('/fiche_user/:id',authenticateToken,  userController.fiche_user);

router.get('/liste_user/:roleName',authenticateToken,  userController.liste_user);

router.put('/modification_user/:id',authenticateToken,  userController.modification_user);
  
module.exports=router;
    