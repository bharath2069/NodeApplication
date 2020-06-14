var express=require('express');
var router=express.Router();
router.get('/login',(req,res)=>{
    res.sendFile('login.html',{root:__dirname});
});
router.get('/signup',(req,res)=>{
    res.sendFile('signup.html',{root:__dirname});
});
// router.get('/getdata',(req,res)=>{
//     res.sendFile('getdata.html',{root:__dirname});
// });
// router.get('/update',(req,res)=>{
//     res.sendFile('update.html',{root:__dirname});
// })
router.get('/*',(req,res)=>{
    res.send('Sorry!! Your url is wrong');
});
module.exports=router;