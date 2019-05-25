//Declare server parameters
var express = require('express');
var events = require('events');
var app = express();

// Create an eventEmitter object
emitter = new events.EventEmitter();

//To parse JSON fields
app.use(express.json())

//To parse url encoded params
app.use(express.urlencoded({
  extended: true
}));


var port = '3000';
var hostname = 'localhost';

//Execute SQL
app.post('/connectSQL',function(req,res){
  //Prepare connection            
  connectSQL(req,res);
});

var connectSQL = function (req,res)
{  
  var Connection = require('tedious').Connection;
  var Request = require('tedious').Request;
  var TYPES = require('tedious').TYPES;

  var config = {
      server : req.body.server,
      authentication : {
        type : 'ntlm',
        options : {
          userName : req.body.username,
          password : req.body.password,
          domain : 'QUAERO'
        }
      },
      options : {
        database : req.body.db        
      }
  };    
  var connection = new Connection(config);

  connection.on('connect',function(err) 
  {    
    if(err) 
    {
      res.send("FAILED : Try Again");   
      //console.log("Connection failed : " + err);
    }
    else
    {
      res.send("Connected");
    }
  });
}

app.post('/x',function(req,res){  
  var Connection = require('tedious').Connection;
  var Request = require('tedious').Request;
  var TYPES = require('tedious').TYPES;

  var config = {
      server : req.body.server,
      authentication : {
        type : 'ntlm',
        options : {
          userName : req.body.username,
          password : req.body.password,
          domain : req.body.domain
        }
      },
      options : {
        database : req.body.db,        
      }
  };    
  var connection = new Connection(config);

  connection.on('connect',function(err) 
  {    
    if(err) 
    {
      res.send(err);   
      console.log("Connection failed");            
    }
    else
    {
      request = new Request("select top 10 * from M_WORKFLOW",function(err, rowcount,rows)
        {
            if(err) 
            {
              res.send(err);        
              console.log("Query failed");      
              return;
            }        
            else
            {
                console.log("Fetched " + rowcount + " rows");          
            }  
        });
      connection.execSql(request)    
      request.on('row', function(columns) 
        {         
          res.send(columns);
          console.log("Sent results");
        });   
    }
    
  });   
    
   

  
});


//Serve the website
app.use(express.static('public'))

//Start Server and listen for requests
var server  = app.listen(port,hostname,function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});

