const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
// const AutoIncrement = require('mongoose-sequence')(mongoose);

// User : 
//     - _id 
//     - nom
//     - mdp
    // -confirpd
    // -email
//     - role (CLT,EMP,MNG)


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

// userData
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
    if(this.isModified('password')) this.password =  bcrypt.hashSync(this.password,8);
    if(this.isModified('confirmPassword')) this.confirmPassword =  bcrypt.hashSync(this.confirmPassword,8);
    console.log('[INFO] cryptage réussi');
    return 0;
});


module.exports= mongoose.model('User',userSchema);