var express = require('express');
var router = express.Router();
var path = require("path");
var nodemailer = require('nodemailer');

//Get HomePage
router.get('/about',function(req,res){  
   res.status(200).send(`
   <b>Quaero Imperium API</b>
   <br>
   Version : Sapling 0.5 BETA
   `)
});


router.post('/sendMail',function(req,res)
{  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {        
     transporter = nodemailer.createTransport({
        host: process.env.email_relay,
        port: 25,       
        ignoreTLS : true          
      });      
    
      dispatchEmailWith(decodedToken.uid,decodedToken.name,decodedToken.email,req,res)

  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in : ' + error)
  });
});

function dispatchEmailWith(uid,full_name,email,req,res)
{
  var mailOptions = {
    from: (full_name)?(full_name + ' ' + email):email,
    to: req.body.to,
    cc : (req.body.cc)?(email + ',' + req.body.cc ):email,
    subject: req.body.subject,
    html: req.body.html + '<br><br>Source : Imperium | ' + req.body.source
  }

  var result = {
    err: 1,
    data : {}
  }; 

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      result.data.info = error;
      logger.error(uid + '\tFailed to send a mail');
      res.send(result)
    } else {
      logger.info(uid + '\tSent a mail');
      result.err = 0;
      result.data.info = info;
      res.status(200).send(result)
    }
  });
}

module.exports = router;

