var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');

//Register
router.get('/register',function(req,res){        
    //Verify user
    admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
    .then(function(decodedToken) 
    {
        //If user is logged in, take him to the homepage instead
        res.redirect('/');

    }).catch(function(error) 
    {        
        //Otherwise, render registration page
        res.render('register',{
            title: 'Register',
            cssfile : '../css/index.css',
            cssanimate : '../frameworks/animate.css'
        });   
    });       
});

//Login
router.get('/login',function(req,res){
//Check if user has already logged in, by verifying him
admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
    .then(function(decodedToken) 
    {
        //If user is logged in, take him to the homepage instead
        res.redirect('/');  
    }).catch(function(error) 
    {        
        //Otherwise, render login page
        res.render('login',{
            title: 'Login',
            cssfile : '../css/index.css',
            cssanimate : '../frameworks/animate.css'
        });             
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
            firebase.ref('users').child(username).set({
                fullname : fullname,
                email : email,
                password : encrypt(password)
            });
        
        //Suucessfully created new user
        res.redirect('./login');              
    }
     
});


//Logout
router.post('/logout',function(req,res){    
    res.clearCookie('authToken');    
    res.send('Session Ended');    
});


//Perform Login
router.post('/login',[    
], async (req,res) => 
{          
    var result = {
        err: 1,
        data : {}
      }; 
    
    username = req.body.username;       
    
    //User wanted to login, send them a token if credentails are valid
    admin.auth().createCustomToken(username)
        .then(function(customToken) 
    {
        //Verify credentials
        //Obtain the user details from firebase    
        firebase.ref('users').child(username).once('value',  function(snapshot)
        { 
            user_data = snapshot.val();
            if(user_data==null)        
            {   
                result.data = {info : "User does not exist. Please <a href='/users/register' target='_self'>register</a>"}
                res.send(result);
            }
            else
            {   
                if(decrypt(user_data.password)===(req.body.password))
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

                /*                
                argon2.verify(hash_pass, req.body.password).then((verified) =>
                { 
                    if(verified)
                        {                            
                            //User has been verified, now send token to authenticate
                            result.err = 0;                                                        
                            result.data = {token : customToken};
                            res.send(result);                                                        
                            console.log("3. Token sent");                            
                        }
                    else{
                        result.data = {info : "Invalid password"}
                        res.clearCookie('authToken');
                        res.send(result);
                    }
                }).catch((err) => {                    
                    result.data = {info : "Authentication failed : " + err}
                    res.clearCookie('authToken');
                    res.send(result);                 
                });   
                */                          
                
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