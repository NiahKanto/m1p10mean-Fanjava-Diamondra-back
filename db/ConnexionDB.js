const mongoose = require('mongoose');
mongoose.set('strictQuery', true);



exports.getConn= () =>{
    mailto:mongoose.connect('mongodb+srv://user:root@m1p10mean.tqzu7aw.mongodb.net/?retryWrites=true&w=majority',
    { useNewUrlParser: true,
      useUnifiedTopology: true })
      .then(() => {
        console.log('Connexion à MongoDB réussie !');

      })
  
    .catch(() => console.log('Connexion à MongoDB échouée !'));
};