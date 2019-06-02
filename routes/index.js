var express = require('express');
var router = express.Router();

//Get HomePage
router.get('/',function(req,res){
    res.render('index',{        
        title: 'Quaero Ops',
        cssfilename : 'index.css'        
    });
});

module.exports = router;

