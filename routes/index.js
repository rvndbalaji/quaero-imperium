var express = require('express');
var router = express.Router();

//Get HomePage
router.get('/',function(req,res){
    res.render('index',{        
        title: 'Quaero Ops',
        cssfile : 'css/index.css',
        cssanimate : 'frameworks/animate.css'
    });
});

module.exports = router;

