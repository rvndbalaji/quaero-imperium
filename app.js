//Declare server parameters
var express = require('express');
var sql = require('mssql');
var events = require('events');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var app = express();

// Create an eventEmitter object
emitter = new events.EventEmitter();

//To parse JSON fields
app.use(express.json())

//To parse url encoded params
app.use(express.urlencoded({
  extended: true
}));

//app.use(express.cookieParser());

var port = '3000';
var hostname = 'localhost';


//Serve the website
app.use(express.static('public'))

//Start Server and listen for requests
var server  = app.listen(port,hostname,function(){
  console.log(`Server running at http://${hostname}:${port}/`);
});

global_conn_pool = null;

//=======================================================================================================
//==========================================BEGIN API===================================================


//Connect to SQL
app.post('/connectSQL',function(req,res)
{    
  var result = {
    err : 1,
    data : {}
  };  
  connectSQL(req,res,result);    
});

//Get the count of any workflows give the type.
//Example : when type = "failed", returns the number of failed workflows in the environment
app.get('/wf/count',function(req,res)
{
  var result = {
    err: 1,
    data : {}
  }; 
  
  getWorkflowCount(req,res,result);  
});

//Perform a search of workflows by using filters
app.get('/search/wf',function(req,res){
  var result = {
    err: 1,
    data : {}
  }; 
  
  fetchWF(req,res,result);
});

//Get all running jobs
app.get('/jobs',function(req,res){
  var result = {
    err: 1,
    data : {}
  }; 
  
  getJobs(req,res,result);
});


//=======================================================================================================

var connectSQL = function (req,res,res_data)
{  
  //Fetch the connection string parameters
  var config = {
    user : req.body.username,
    password : req.body.password,
    server : req.body.server,
    database : req.body.db,
    domain : 'QUAERO'
    }
   
    //Prepare a connection pool
  new sql.ConnectionPool(config).connect()
  .then(pool => {      
      //Save the global pool  
      global_conn_pool = pool;
      res_data.err = 0;      
      res_data.data = {info : "connected"};             
      res.send(res_data);

  }).catch(err => {
      global_conn_pool = null;
      res_data.err = 1;
      res_data.data = {info : err.message}; 
      res.send(res_data);
  });  
}

var getWorkflowCount = async function (req,res,res_data)
{   
    await global_conn_pool; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool.request();
      if(req.query.type=='running')
      {
        sql_result = sql_request.query("with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS ( 	select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_INSTANCE_STATUS not like 'FAILED%' and WORKFLOW_INSTANCE_STATUS not like 'COMPLETE%' ), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME) select count(WID) as COUNT from final");
      }
      else if(req.query.type=='failed')
      {
        sql_result = sql_request.query("with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS ( 	select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_INSTANCE_STATUS like 'FAILED%'), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME) select count(WID) as COUNT from final");
      }
      else{
        throw "Invalid workflow type. Available types are 'running', 'failed'";        
      }      
      
      //Capture the result when the query completes
      sql_result.then(function(result)
      {
        res_data.err = 0; 
        //Get the result and set it
        count_num = result.recordset[0].COUNT;                
        res_data.data = {count : count_num};
        res.send(res_data);
      });
    }
    catch (err)
    {      
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}  

var fetchWF = async function (req,res,res_data)
{   
    
    await global_conn_pool; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool.request();
      //sql_result = sql_request.query("select WORKFLOW_ID, WORKFLOW_NAME,WORKFLOW_DESC,ACTIVE_FLG,UPDATE_USER,UPDATE_DT from M_WORKFLOW where " + req.query.where_key + " like '%" + req.query.where_val + "%' order by " + req.query.order_by + " " + req.query.order_type);      
      sql_result = sql_request.query("with ONE (WF_ID,WFI_ID) as ( select mw.WORKFLOW_ID as WF_ID,es.WORKFLOW_INSTANCE_ID as WFI_ID from M_WORKFLOW mw join VW_WORKFLOW_EXECUTION_STATUS es on es.WORKFLOW_ID= mw.WORKFLOW_ID where mw." + req.query.where_key + " like '%" + req.query.where_val + "%' ), TWO(WORKFLOW_ID,WORKFLOW_INSTANCE_ID) as( select WF_ID as WORKFLOW_ID,max(WFI_ID) as WORKFLOW_INSTANCE_ID from ONE group by WF_ID ) select TWO.WORKFLOW_ID, mw.WORKFLOW_NAME,WORKFLOW_DESC,ACTIVE_FLG,UPDATE_USER,UPDATE_DT, TWO.WORKFLOW_INSTANCE_ID,WORKFLOW_TYPE,START_DT,END_DT,WORKFLOW_INSTANCE_STATUS,RUN_TIME_IN_MINS,EVENT_GROUP_ID from TWO join M_WORKFLOW mw on mw.WORKFLOW_ID = TWO.WORKFLOW_ID join VW_WORKFLOW_EXECUTION_STATUS vw on (vw.WORKFLOW_INSTANCE_ID = TWO.WORKFLOW_INSTANCE_ID and vw.WORKFLOW_ID = TWO.WORKFLOW_ID) order by mw." + req.query.order_by + " " + req.query.order_type); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.send(res_data);
      });
    }
    catch (err)
    {      
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}

var getJobs = async function (req,res,res_data)
{   
    
    /*
    SELECT    
    j.name AS job_name,        
    Js.step_name
FROM msdb.dbo.sysjobactivity ja 
LEFT JOIN msdb.dbo.sysjobhistory jh ON ja.job_history_id = jh.instance_id
JOIN msdb.dbo.sysjobs j ON ja.job_id = j.job_id
JOIN msdb.dbo.sysjobsteps js
    ON ja.job_id = js.job_id
    AND ISNULL(ja.last_executed_step_id,0)+1 = js.step_id
WHERE
  ja.session_id = (
    SELECT TOP 1 session_id FROM msdb.dbo.syssessions ORDER BY agent_start_date DESC
  )
AND start_execution_date is not null
AND stop_execution_date is null;
*/
    

    await global_conn_pool; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool.request();
      //sql_result = sql_request.query("select WORKFLOW_ID, WORKFLOW_NAME,WORKFLOW_DESC,ACTIVE_FLG,UPDATE_USER,UPDATE_DT from M_WORKFLOW where " + req.query.where_key + " like '%" + req.query.where_val + "%' order by " + req.query.order_by + " " + req.query.order_type);      
      sql_result = sql_request.query(); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.send(res_data);
      });
    }
    catch (err)
    {      
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}
