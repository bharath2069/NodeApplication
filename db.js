var mongoose=require('mongoose');
var url='mongodb://localhost:27017/loginschema';
mongoose.set('useNewUrlParser',true);
mongoose.set('useUnifiedTopology',true);
mongoose.connect(url,(err,db)=>{
    if(err){console.log('error in connecting database');}
    console.log('db connected');
});
