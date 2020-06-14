var express=require('express');
var app=express();
var pug=require('pug');
var path=require('path');
var url=require('url');
var {check,validationResult}=require('express-validator');
var crypto=require('crypto');
var Login=require('./loginschema');
var Signup=require('./signupschema');
var Router=require('./Router');
var multer=require('multer');
require('./db');
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use('/user',Router);
app.set('views',path.join(__dirname+'/views'));
app.set('view engine','pug');
var secretKey='12345';
app.listen(8080,(req,res)=>{
    console.log('server connected..');
});
//storage for uploading files
var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./uploads');
    },
    filename:(req,file,cb)=>
    {
        cb(null,file.originalname);
    }
})
var upload=multer({storage:storage});
//uploading single files to the upload dir
app.post('/upload',upload.single('avatar'),(req,res,next)=>{
    var file=req.file;
    if(!file){res.send('OOPS!!Something went wrong.');}
    res.send('file uploaded successfully');
})
//login page and user login template(pug)
app.post('/homepage',[
    check('Username')
    .notEmpty()
    .trim(),
    check('Password')
    .notEmpty()
    .isLength({min:5})
],(req,res)=>{
    var err=validationResult(req);
    if(!err.isEmpty())
    {
        res.send('All fields are required.Password must have atleast 5 characters.');
    }
    else
    {
        var Username=req.body.Username;
        var Password=req.body.Password;
        var Epassword=crypto.createHash('sha256',secretKey).update(Password).digest('hex');
        Signup.find({Username:Username,Password:Epassword},(err,doc)=>{
            if(err){res.send('OOPS!!Something went wrong');}
            if(doc==0)
            {
                res.send('Your Username or Password dosent exists.Signup and try again.');
            }
            else{
                if(Username=='admin')
                {
                    res.render('Admin',{title:Username,message:'Welcome '+Username});
                }
                res.render('User',{title:Username,message:'Welcome '+Username});
            }
        });
    }
        
    
});
//getting specified data from db
app.get('/getdatafromdb',(req,res)=>{
    var q=url.parse(req.url,true).query;
    var Name=q.Username;
    Signup.find({Username:Name},(err,doc)=>{
        if(err){res.send('OOPS!!Something went wrong');}
        else{
            if(doc==0)
            {
                res.send('data not exits');
            }
            else{
                res.send(doc);
            }
            
        }
    })
})
//sign up
app.post('/signupinsert',[
    check('Username')
    .notEmpty()
    .trim(),
    check('Email')
    .trim()
    .isEmail()
    .notEmpty()
    .normalizeEmail(),
    check('Password1')
    .notEmpty()
    .isLength({min:5}),
    check('Password2')
    .notEmpty()
    .isLength({min:5})
],(req,res)=>{
    var err=validationResult(req);
    if(!err.isEmpty()){res.send('Fill the data correctly. 1.Field should not be empty 2.Password must have atleast 5 charachters');}
    else
    {
        Signup.find({Username:req.body.Username},(err,doc)=>{
            if(err){res.send('OOPS!!Something went wrong.');}
            else
            {
                if(doc==0)
                {
                    if(req.body.Password1==req.body.Password2)
                    {
                        var Encryptpassword=crypto.createHash('sha256',secretKey).update(req.body.Password1).digest('hex');
                        new Signup({
                            Username:req.body.Username,
                            Email:req.body.Email,
                            Password:Encryptpassword
                        }).save((err,doc)=>{
                            if(err){res.send('OOPS!!Something went wrong');}
                            res.send('Thankyou for your responce');
                        });
                    }
                    else
                    {
                        res.send('Password Mismatching ');
                    }
                }
                else
                {
                    res.send('Username already exists');
                }
                
                
            }
        });
        
        
    }
});
app.get('/viewdata',(req,res)=>{
    //var array=[];
    Signup.find({},(err,doc)=>{
        if(err){res.send('OOPS!!Something went wrong');}
        else{
            res.send(doc);
        }
    });
   
});
//Updating Email
app.post('/updateEmail',[
    check('Email1')
    .notEmpty()
    .normalizeEmail()
    .isEmail(),
    check('Email2')
    .notEmpty()
    .normalizeEmail()
    .isEmail()
],(req,res)=>{
    var err=validationResult(req);
    if(!err.isEmpty()){res.send('Field should not be empty.Email should be in correct format.');}
    else{
        Signup.find({Email:req.body.Email1},(err,doc)=>{
            if(err){res.send('OOPS!!Something went wrong');}
            else{
                if(doc==0)
                {
                    res.send('Invalid Email id');
                }
                else
                {
                    Signup.updateOne({Email:req.body.Email1},{$set:{Email:req.body.Email2}},(err,doc)=>{
                        if(err){res.send('OOPS!!Something went wrong');}
                        else
                        {
                            res.send('Your Email id is updated');
                        }
                    })
                }
            } 
        })
    }
    
})
//Updating Password
app.post('/updatePassword',[
    check('oldpassword')
    .notEmpty()
    .isLength({min:5}),
    check('newpassword')
    .notEmpty()
    .isLength({min:5}),
    check('confirmpassword')
    .notEmpty()
    .isLength({min:5})    
],(req,res)=>{
    var err=validationResult(req);
    if(!err.isEmpty()){res.send('Field should not be empty.Password must have minimum 5 characters');}
    else
    {
        if(req.body.newpassword==req.body.confirmpassword)
        {
            var oldEncryptpassword=crypto.createHash('sha256',secretKey).update(req.body.oldpassword).digest('hex');
            Signup.find({Password:oldEncryptpassword},(err,doc)=>{
                if(err){res.send('OOPS!!Something went wrong');}
                else
                {
                    if(doc==0)
                    {
                        res.send('Your old Password is not matching.');
                    }
                    else
                    {
                        var NewEncryptPassword=crypto.createHash('sha256',secretKey).update(req.body.newpassword).digest('hex');
                        Signup.updateOne({Password:oldEncryptpassword},{$set:{Password:NewEncryptPassword}},(err,doc)=>{
                            if(err){res.send('OOPS!!Something went wrong');}
                            else
                            {
                                res.send('Your password has been changed');
                            }
                            
                        })
                    }
                }
            })
        
        }
        else
        {
            res.send('Your new password is Mismatching.');
        }
    }
})
app.get('/logout',(req,res)=>{
    res.sendFile('login.html',{root:__dirname});
})
