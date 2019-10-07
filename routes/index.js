var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

//Get HomePage
router.get('/',function(req,res){              
   res.status(200).send('Quaero Imperium API')
});

router.post('/sendMail',function(req,res)
{  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {        
     transporter = nodemailer.createTransport({
        host: "hsrelay01.quaero.com",
        port: 25,       
        ignoreTLS : true          
      });      
    
      admin.auth().getUser(decodedToken.uid)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.        
        dispatchEmailWith(userRecord.displayName,decodedToken,req,res)

      })
      .catch(function(error) {        
        dispatchEmailWith(undefined,decodedToken,req,res)
      });

  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in : ' + error)
  });
});

function dispatchEmailWith(full_name,decodedToken,req,res)
{
  var mailOptions = {
    from: (full_name)?(full_name + ' ' + decodedToken.email):decodedToken.email,
    to: req.body.to,
    cc : (req.body.cc)?(req.body.cc + decodedToken.email):decodedToken.email,
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
      res.send(result)
    } else {
      result.err = 0;
      result.data.info = info;
      res.status(200).send(result)
    }
  });
}

module.exports = router;

