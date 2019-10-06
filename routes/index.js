var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

//Get HomePage
router.get('/',function(req,res){              
   res.status(200).send('Quaero Imperium API')
});

router.post('/sendMail',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {        
     transporter = nodemailer.createTransport({
        host: "hsrelay01.quaero.com",
        port: 25,       
        ignoreTLS : true          
      });      
    var mailOptions = {
        from: req.body.from,
        to: req.body.to,
        cc : req.body.cc,
        subject: req.body.subject,
        html: req.body.html + '<br><br>Sent by : ' + decodedToken.uid + `<br>Source : Imperium | ` + req.body.source
      }

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        result.data.info = error;
        res.send(error)
      } else {
        result.err = 0;
        result.data.info = info;
        res.status(200).send(info)
      }
    });
    
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


module.exports = router;

