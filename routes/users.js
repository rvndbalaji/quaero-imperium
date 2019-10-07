var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');


//Perform registration
router.post('/register',[
    check('email').isEmail(),    
], async (req,res) => {

    var result = {
        err: 1,
        data : {}
      }; 
      
    var fullname = req.body.full_name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    
    var errors = validationResult(req); 
    if(!errors.isEmpty())
    {        
        result.data.info = errors.array();
        res.send(result)
    }
    else{       
           admin.auth().createUser({
                uid : username,
                email,
                emailVerified: false,                
                password,
                displayName:  fullname,                
                disabled: false
              })
                .then(function(userRecord) {                    
                    firebase.doc('users').collection(userRecord.uid).doc('profile').set(
                    {
                        fullname : fullname,
                        email : email,
                        password : encrypt(password)
                    }).then(()=>{
                        //Sucessfully created new user
                        result.err = 0;
                        result.data.info = 'Registration successful'
                        res.send(result)
                    });
                })
                .catch(function(error) {                  
                  result.data.info = error
                  res.send(result)
                });
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