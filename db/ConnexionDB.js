const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const schemas = require("../models/allSchemas");            
 
const Role=schemas.role;

exports.getConn= () =>{
    mailto:mongoose.connect('mongodb+srv://user:root@m1p10mean-v2.qhgidaj.mongodb.net/',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
      .then(() => {
          console.log('Connexion à MongoDB réussie !');
          //initial();

      })
  
    .catch(() => console.log('Connexion à MongoDB échouée !'));
};


async function initial() { 
    try {
      await new Role({ nomRole: "client" }).save();
      console.log("added 'client' to roles collection");
  
      await new Role({ nomRole: "employe" }).save();
      console.log("added 'employe' to roles collection");
  
      await new Role({ nomRole: "manager" }).save();
      console.log("added 'manager' to roles collection");
    } catch (err) {
        console.log('tsy tafiditra');
      console.log("error", err);
    }
  
  }
  