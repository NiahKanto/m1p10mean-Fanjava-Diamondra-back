const db = require("../models/allSchemas");     
const User = db.user;
const Role=db.role;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
 
exports.testManager= async function testManager(rolesUser){
  const role = await Role.findOne({nomRole: 'manager'}).lean(); // Utilisez .lean() pour convertir le résultat en un objet JavaScript simple
  if(!role) {
      console.error("Role 'employe' introuvable");
      return false;
  }
  const employeRoleId = role._id.toString(); //  ID en string pour la comparaison
  const userHasRole = rolesUser.some(role => role._id.toString() === employeRoleId); // Comparez les IDs sous forme de chaînes
  return userHasRole;
}
exports.testEmploye= async function testEmploye(rolesUser){
  console.log('rolesuser=='+rolesUser)
  const role = await Role.findOne({nomRole: 'employe'}).lean(); // Utilisez .lean() pour convertir le résultat en un objet JavaScript simple
  if(!role) {
      console.error("Role 'employe' introuvable");
      return false;
  }
  console.log('role='+role)
  const employeRoleId = role._id.toString(); //  ID en string pour la comparaison
  const userHasRole = rolesUser.some(role => role._id.toString() === employeRoleId); // Comparez les IDs sous forme de chaînes
  return userHasRole;
}

exports.testClient= async function testClient(rolesUser){
  const role = await Role.findOne({nomRole: 'client'}).lean(); // Utilisez .lean() pour convertir le résultat en un objet JavaScript simple
  if(!role) {
      console.error("Role 'employe' introuvable");
      return false;
  }
  const employeRoleId = role._id.toString(); //  ID en string pour la comparaison
  const userHasRole = rolesUser.some(role => role._id.toString() === employeRoleId); // Comparez les IDs sous forme de chaînes
  return userHasRole;
}
 
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ nom: req.body.nom }).populate("roles", "-__v");
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    if (await bcrypt.compare(req.body.mdp, user.mdp)) {
        var authorities = [];
        for (let i = 0; i < user.roles.length; i++) {
          authorities.push("ROLE_" + user.roles[i].nomRole.toUpperCase());
        }
        const token = jwt.sign({ username: user.nom, id: user._id, roles: user.roles }, 'secret', { expiresIn: '1h' });
        res.status(200).json({ token, authorities });
    } else {
      res.status(401).json({ message: 'Mot de passe incorrect' });
    }
  } catch (err) {
    console.log(err);
    res.status(403).json({ message: err });
  }
};

exports.inscription_user = async (req, res) => {
try{
    console.log(req.body); 
    const user =new User( 
    {
        ...req.body
    });

    if(!(user.mdp===user.confirmmdp)){
        res.status(400).json({ message:'mot de passe non identique'})
    }
    //refa ok ny mdp, d mila manao controle sur les roles 
    else {
        db.role.findOne({ nomRole: "client" })
        .then(role => {
            if (!role) {
            return res.status(404).send({ message: "Role not found" });
            }

        user.roles = [role._id];
            user.save()
            .then(() =>{
                console.log('[INFO] inscription reussi');
                res.status(201).json({message:"Compte créé avec succès. Connectez-vous pour continuer."})
            })
            .catch((error) => {
              // catch uniquekey for Mail
              let errMsg;
              if (error.code == 11000) {
                  errMsg = "L'email existe déjà";
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
}

exports.inscription_emp = async (req, res) => {
    try{
        const userLogged = req.user;
        const isManager = await this.testManager(userLogged.roles)

        if(isManager === false){
            return res.status(403).json({message : 'Vous n\'etes pas un manager' });
        }

        //mamorona instance anah user iray asiana le data
        const user =new User( 
        {
          ...req.body
        });
    
        if(!(user.mdp===user.confirmmdp)){
          res.status(400).json({ message:'mot de passe non identique'})
        }
        //refa ok ny mdp, d mila manao controle sur les roles 
        else {
          Role.findOne({ nomRole: "employe" })
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
                  errMsg = "L'email existe déjà";
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
}

exports.inscription_manager = async (req, res) => {
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
        else {
          role.findOne({ nomRole: "manager" })
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
}

exports.fiche_user = async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findOne({ _id: id }).populate('roles');
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      const userData = {
        _id: user._id,
        nom: user.nom,
        email: user.email,
        roles: user.roles.map(role => role.nomRole)
      };
      res.json(userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

exports.liste_user = async (req, res) => {
try {
    const { roleName } = req.params;
    const Role= await db.role.findOne({ nomRole: roleName })
    if (!Role) {
        return res.status(404).json({ message: 'Role not found' });
    }

    const usersWithRole = await User.find({ roles: Role._id });

    const userList = usersWithRole.map(user => ({
        _id: user._id,
        nom: user.nom,
        email: user.email,
        roles: user.roles.map(role => Role.nomRole)
    }));

    // Send the list of users with the specified role
    res.json(userList);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
    }   
}

exports.modification_user = async (req, res) => {
try {
    const { id } = req.params;
    const update = req.body;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    if (update.nom && user.nom != update.nom) {
        user.nom = update.nom;
    }
    if (update.email && user.email != update.email) {
        user.email = update.email;
    }
    if (update.mdp && update.confirmmdp) {
        if (update.mdp === update.confirmmdp) {
        user.mdp = await bcrypt.hash(update.mdp,  10);
        } else {
        return res.status(400).json({ message: 'Les mots de passe ne correspondent pas' });
        }
    }
    if (update.role) {
        const roleFound = await role.findOne({ nomRole: update.role });
        if (!roleFound) {
        return res.status(404).json({ message: 'Rôle non trouvé' });
        }
        if(roleFound && update.role!=roleFound)
        {
        user.roles = [roleFound._id];
        }
    }
    const savedUser = await user.save();
    res.json(savedUser);
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur interne' });
    }
}

exports.modif_userfiche = async (req, res) => {
  try {
      const { id } = req.user;
      const update = req.body;
      const user = await User.findById(id);
      console.log(user);
      console.log('body==='+update)
      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      if (update.nom && user.nom != update.nom) {
          user.nom = update.nom;
      }
      if (update.email && user.email != update.email) {
          user.email = update.email;
      }
      const savedUser = await user.save();
      res.json(savedUser);
      } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur interne' });
      }
  }

exports.modif_userMDP = async (req, res) => {
  try {
    const { id } = req.user;
    const update = req.body;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const isMatch = await bcrypt.compare(update.mdpAncien, user.mdp);
    console.log('match ve='+isMatch);
    if (isMatch) { 
      user.mdp = update.mdpVaovao;
      user.confirmmdp = update.mdpVaovao;
      
      const savedUser = await user.save();
      res.json(savedUser);
    } else {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur interne' });
  }
}
  

exports.ma_fiche = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findOne({ _id: id }).populate('roles');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const userData = {
      _id: user._id,
      nom: user.nom,
      email: user.email,
      roles: user.roles.map(role => role.nomRole)
    };
    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};