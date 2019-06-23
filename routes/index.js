var express = require('express');
var router = express.Router();

//Get HomePage
router.get('/',function(req,res){          
    
    //Verify user using token
    //If yes, user is logged in so render the home page.        
    admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
        .then(function(decodedToken) 
        {
            res.render('index',{        
                title: 'Quaero Imperium',
                cssfile : 'css/index.css',
                cssanimate : 'frameworks/animate.css'
            });                        
        }).catch(function(error) 
        {        
            //Otherwise, send him to login page            
            res.clearCookie('authToken');  
            res.redirect('/users/login');                  
        });       
});

//Post HomePage
router.post('/',function(req,res)
{    
    
    var result = {
        err: 1,
        data : {}
      };     
    admin.auth().verifyIdToken(acquireTokenAsString(req.body.token))
    .then(function(decodedToken) 
    {
       //Token verified, take him home       
       result.err = 0;
       result.data = {info : "Logging in..."};
       res.cookie('authToken', req.body.token, { httpOnly: true, secure: false });
       res.send(result);          

    }).catch(function(error) 
    {        
        result.data = {info : error};
        res.clearCookie('authToken');   
        res.send(result);     
        
    });      
});

module.exports = router;

