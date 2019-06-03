var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');


//Register
router.get('/register',function(req,res){
    res.render('register',{
        title: 'Register',
        cssfile : '../css/index.css',
        cssanimate : '../frameworks/animate.css'
    });    
});

//Login
router.get('/login',function(req,res){
    res.render('login');
});

//Perform registration
router.post('/register',[
    check('email').isEmail(),    
],(req,res) => {
    var fullname = req.body.full_name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    
    var errors = validationResult(req); 
    if(!errors.isEmpty())
    {
        res.render('register',{
            title: 'Register',
            cssfile : '../css/index.css',
            cssanimate : '../frameworks/animate.css',
            errors : errors.array()
        });        
    }
    else{
        firebase.ref('users').child(username).set({
            fullname : fullname,
            email : email,
            password : password
        });
        res.redirect('/');

    }
    

  
});

module.exports = router;

//users_ref.once('value',function(snapshot){
    //  console.log(snapshot.val());
  //  });
    