var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
// const config = require("../config/tokenConfig");

const db = require("../models/allSchemas");     
const role=db.role;      
const User = db.user;

     //api login , migerer hoe valide ve ilay mail, ensuite hoe true ve mdp, mireturn données users izyy 
     router.post('/login_user', async (req, res) => {
      try {
        let user = await User.findOne({
          nom: req.body.nom
        }).populate("roles", "-__v");
    
        if (!user) {
          return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }
  
      try {
          if (await bcrypt.compare(req.body.mdp, user.mdp)) {
              // const token = jwt.sign({ username: user.nom, id: user._id }, 'secret', { expiresIn: '1h' });
              // res.json({ token,user });
              console.log("tafiditra amzay")
          } else {
              res.status(401).json({ message: 'Mot de passe incorrect' });
          }
      } catch (error) {
          console.error('Erreur de comparaison de mot de passe avec bcryptjs:', error);
          res.status(500).json({ message: 'Erreur de comparaison de mot de passe' });
      }
  
      //   var token = jwt.sign({ id: user.id }, config.secret, {
      //     expiresIn: 86400 // 24 hours
      //   });
  
        //ty le mamoaka anle tableau ana roles
        var authorities = [];
  
        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].nom.toUpperCase());
        }
        res.status(200).send({
          id: user._id,
          nom: user.nom,
          roles: authorities,
          // accessToken: token
        });
      } catch (err) {
        console.log('error : login ou mot de passe erronée');
        res.status(403).json({message:'login ou mot de passe erronée'})
      }
    });

     router.post('/inscription_user', async (req, res) => {
        try{
          console.log(req.body);
          //mamorona instance anah user iray asiana le data
          const user =new User( 
          {
            ...req.body
          });

          if(!(user.mdp===user.confirmmdp)){
            res.status(400).json({ message:'mot de passe non identique'})
          }
          //refa ok ny mdp, d mila manao controle sur les roles 
          // user.save()
          // .then(() =>{
          //   console.log('[INFO] inscription reussi');
          //   res.status(201).json({message:"Compte crée avec succés"})
          // })
          else {
            role.findOne({ nomRole: "client" })
              .then(role => {
                if (!role) {
                  return res.status(404).send({ message: "Role not found" });
                }

              user.roles = [role._id];
                user.save()
                  .then(() =>{
                    console.log('[INFO] inscription reussi');
                    res.status(201).json({message:"Compte crée avec succés"})
                  })
                .catch((error) => {
                  // catch uniquekey for Mail
                  let errMsg;
                  if (error.code == 11000) {
                    errMsg = "L' "+Object.keys(error.keyValue)[0] + " existe déjà";
                  } else {
                    errMsg = error.message;
                  }
                  res.status(400).json({ statusText: "Bad Request", message: errMsg });
                  console.log('[INFO] Email existant!');
                  
                });
              
              });
            }
        } catch(err) {
          console.log(err);
         console.log('error : inscription inachevée');
          res.status(403).json({message:'inscription inachevée'})
        }
      });

module.exports=router;
    