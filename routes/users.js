var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
argon2 = require('argon2');


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
    res.render('login',{
        title: 'Login',
        cssfile : '../css/index.css',
        cssanimate : '../frameworks/animate.css'
    });    
});

//Perform registration
router.post('/register',[
    check('email').isEmail(),    
], async (req,res) => {
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
        //Hash and salt the password using argon2id
        var pass_hash;
        try {
            pass_hash = await argon2.hash(password,{
                type: argon2.argon2id
            });
          } catch (err) {
            res.send("Hashing error");
            return;
          }

        firebase.ref('users').child(username).set({
            fullname : fullname,
            email : email,
            password : pass_hash
        });

        //Temporary Redirect
        res.redirect('./login');
    }
    

  
});


//Perform Login
router.post('/login',[    
], async (req,res) => {  
    username = req.body.username;    
    //Obtain the user details from firebase
     firebase.ref('users').child(username).once('value',  function(snapshot)
     {  
        user_data = snapshot.val();
        if(user_data==null)        
        {            
            res.render('login',{
                title: 'Login',
                cssfile : '../css/index.css',
                cssanimate : '../frameworks/animate.css',
                errors : "User does not exist. Please <a href='/users/register' target='_self'>register</a>"
            });    
        }
        else
        {            
            hash_pass = user_data.password;                    
            argon2.verify(hash_pass, req.body.password).then((verified) =>
              { 
                  if(verified)
                    res.redirect('/');
                  else{
                    res.render('login',{
                        title: 'Login',
                        cssfile : '../css/index.css',
                        cssanimate : '../frameworks/animate.css',
                        errors : "Invalid password"
                    });      
                  }
              }).catch((err) => {
                res.render('login',{
                    title: 'Login',
                    cssfile : '../css/index.css',
                    cssanimate : '../frameworks/animate.css',
                    errors : "Authentication failed : " + err
                });
              });
           
            //res.redirect('/');
            
        }
    });   


    

  
});

module.exports = router;
