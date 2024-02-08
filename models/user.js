const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
// mongodb+srv://user:<password>@m1p10mean-v2.qhgidaj.mongodb.net/

const userSchema = mongoose.Schema(
    {
        nom:{
            type:String,
            required: true
    },
        email:{
        type:String,
        required:true,
            unique : true,
        validate(v){
            if(!validator.isEmail(v)) throw new Error('Email invalide !');
        
        }// michek hoe valide ve format ilay email
    },
    mdp:{
            type:String,
            required:true
    },
        confirmmdp:{
            type:String,
            required:true
    },
    roles: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role"
    }
]

    }
);
 
//micheck hoe mi-existe ve ilay mail, ary true ve ilay mdp
userSchema.statics.checkUser = async(nom, password) =>{
    if(!nom) {
        console.log('[INFO] **************nom invalide**********');
        throw new Error ('Erreur de login: nom non reconnue');
    }
    console.log('[INFO] nom :'+nom );
    //micompare le mdp @n'ilay mdp crypté   anaty base
    const isPasswordValid = await bcrypt.compare(password,nom );
         if (!isPasswordValid){
            console.log('[INFO] **************password invalide**********');
            res.status(403).json({ message :'Erreur de login: mot de passe eronnée'});
            throw new Error ('Erreur de login: mot de passe eronnée');s
        }
         console.log('[INFO] valid password,connexion....');
         
    return nom;//mireturn datauser rehefa vrai daholo
}


userSchema.pre('save',function(){
    console.log('[INFO] CRYPTAGE MotDePasse');
    if(this.isModified('mdp')) this.mdp =  bcrypt.hashSync(this.mdp,8);
    if(this.isModified('confirmmdp')) this.confirmmdp =  bcrypt.hashSync(this.confirmmdp,8);
    console.log('[INFO] cryptage réussi');
    return 0;
});


module.exports= mongoose.model('User',userSchema);