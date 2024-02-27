var express = require('express');
var router = express.Router(); 
const authenticateToken = require('../middlewares/AuthenticateToken')
 
const userController = require('../controller/userController');

//api login , migerer hoe valide ve ilay mail, ensuite hoe true ve mdp, mireturn données users izyy 
router.post('/login_user',userController.loginUser);

router.post('/inscription_user',userController.inscription_user);

router.post('/inscription_emp',authenticateToken, userController.inscription_emp);

router.post('/inscription_manager',  userController.inscription_manager);

router.get('/fiche_user/:id',authenticateToken,  userController.fiche_user);

router.get('/liste_user/:roleName',authenticateToken,  userController.liste_user);

router.put('/modification_user/:id',authenticateToken,  userController.modification_user);

router.get('/ma_fiche/',authenticateToken,  userController.ma_fiche);

router.put('/modif_userfiche/',authenticateToken,  userController.modif_userfiche);

router.put('/modif_userMDP/',authenticateToken,  userController.modif_userMDP);

module.exports=router;