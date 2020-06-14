var mongoose=require('mongoose');
var signupschema=mongoose.Schema({
    Username:{
        type:String,
    },
    Email:{
        type:String,
    },
    Password:{
        type:String,
    }
});
module.exports=mongoose.model('Signup',signupschema);