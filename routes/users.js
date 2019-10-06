var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');


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
            firebase.doc('users').collection(username).doc('profile').set(
            {
                fullname : fullname,
                email : email,
                password : encrypt(password)
            });
        
        //Suucessfully created new user
        res.redirect('./login');              
    }
     
});


//Perform Login
router.post('/login',[    
], async (req,res) => 
{          
    var result = {
        err: 1,
        data : {}
      }; 
    
    var username = req.body.username;       
    
    //User wanted to login, send them a token if credentails are valid
    admin.auth().createCustomToken(username)
        .then(function(customToken) 
    {
        //Verify credentials
        //Obtain the user details from firebase    
        firebase.doc('users').collection(username).doc('profile').get().then(user_data =>
        {   
            if(!user_data.exists)        
            {   
                result.data = {info : "User does not exist. Please register"}
                res.send(result);
                return;
            }  
            user_data = user_data.data();                
            var dec_pass;
            try {
                dec_pass = decrypt(user_data.password);
            } catch (error) {
                result.data = {info : "FATAL DECRYPT ERROR : Please report to admin!"};                                        
                res.clearCookie('authToken');
                res.send(result);
                return;
            }
            if(dec_pass===(req.body.password))
            {
                //User has been verified, now send token to authenticate
                result.err = 0;                                                        
                result.data = {token : customToken};
                res.send(result);                                                                            
            }
            else{
                result.data = {info : "Invalid password"}
                res.clearCookie('authToken');
                res.send(result);
            }
               
            
       
        })
        .catch(function(error) {
                result.data = {info : error};
                res.clearCookie('authToken');
                res.send(result);
        });   
        
  });   
});

module.exports = router;