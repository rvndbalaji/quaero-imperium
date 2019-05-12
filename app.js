//Declare server parameters
var express = require('express');
var port = '3000';
var hostname = 'localhost';
var app = express();

//Start Server and listen for requests
var server  = app.listen(port,hostname,function(){
    console.log(`Server running at http://${hostname}:${port}/`);
});


app.post('/get_wf',function(req,res){
  var sql =  require('mssql');
  var config = {
      user: 'balajia',
      password : 'Rvndqr04',
      domain : 'QUAERO',
      server : 'HSVSQLESPN03T',
      database : 'Test_espnregr4_3128_metastore'
  };
  
  sql.close();
  sql.connect(config,function(err)
  {
    if(err) 
    {
      res.send(err);      
    }
    new sql.Request().query("select top 10 * from M_WORKFLOW",function(err, recordset)
    {
      if(err) 
      {
        res.send(err);        
      }
      else
      {
        res.send(recordset);        
      }        
          
    });
  });
  

});

//Serve the website
app.use(express.static('public'))



