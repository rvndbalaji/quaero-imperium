var express = require('express');
var router = express.Router();

//Prepare a global hashmap of global connection pools
//for each collection
var global_conn_pool = {};

//Get HomePage
router.get('/', async function(req,res){
  
    //Verify user
    admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
    .then(function(decodedToken) 
    {
      res.render('wf_man',{
          title: 'Workflow Manager',
          cssfile : 'css/wf_man.css',
          cssanimate : 'frameworks/animate.css'          
      });        
    }).catch(function(error) 
    { 
      res.clearCookie('authToken');  
      res.redirect('/users/login');    
    });
});


//Connect to SQL
router.post('/connectSQL',function(req,res)
{ 
  var result = {
    err : 1,
    data : {}
  };    
   
    admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
    .then(function(decodedToken) 
    {
      connectSQL(decodedToken,req,res,result);        
    }).catch(function(error) 
    {   
      res.status(403).send('Forbidden. Please sign in.')
    });
});


//Get the count of any workflows give the type.
//Example : when type = "failed", returns the number of failed workflows in the environment
router.get('/wf/count',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWorkflowCount(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETWFCNT)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

//Perform a search of workflows by using filters
router.get('/search/wf',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  };   
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
    generateConfig(req,decodedToken).then(config=>{                   
        if(JSON.stringify(config) in global_conn_pool)        
        {
          fetchWF(config,req,res,result);
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (FETWF)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403);
    result.data = {info:'Forbidden. Please sign in.'}
    res.send(result);
  });    
});

//Get metastores for a given server
router.post('/getMetastores',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  }; 

  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {                
          getMetastores(config,res,result);
        }
        else{          
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETMS)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});


//Get columns for a given table name
router.post('/getColumns',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  }; 

  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {                
          getColumns(config,req,res,result);
        }
        else{          
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETMS)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});

var getWorkflowCount = async function (config,req,res,res_data)
{   
  await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();
      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + "."

      if(req.query.type=='running')
      {
        sql_result = sql_request.query("with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS ( 	select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from " + current_db_schema + "VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_INSTANCE_STATUS not like 'FAILED%' and WORKFLOW_INSTANCE_STATUS not like 'COMPLETE%' ), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join " + current_db_schema + "vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME) select count(WID) as COUNT from final");
      }
      else if(req.query.type=='failed')
      {
        sql_result = sql_request.query("with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS ( 	select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from " + current_db_schema + "VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_INSTANCE_STATUS like 'FAILED%'), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join " + current_db_schema + "vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME) select count(WID) as COUNT from final");
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
        }) .catch(err=>{
          res_data.err = 1; 
          res_data.data = {info : err};
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

var fetchWF = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + "."
      
      sql_result = sql_request.query("with ONE (WF_ID,WFI_ID) as ( select mw.WORKFLOW_ID as WF_ID,es.WORKFLOW_INSTANCE_ID as WFI_ID from " + current_db_schema +  "M_WORKFLOW mw join " + current_db_schema +  "VW_WORKFLOW_EXECUTION_STATUS es on es.WORKFLOW_ID= mw.WORKFLOW_ID where mw." + req.query.where_key + " like '%" + req.query.where_val + "%' ), TWO(WORKFLOW_ID,WORKFLOW_INSTANCE_ID) as( select WF_ID as WORKFLOW_ID,max(WFI_ID) as WORKFLOW_INSTANCE_ID from ONE group by WF_ID ) select TWO.WORKFLOW_ID, mw.WORKFLOW_NAME,WORKFLOW_DESC,ACTIVE_FLG,UPDATE_USER,UPDATE_DT, TWO.WORKFLOW_INSTANCE_ID,WORKFLOW_TYPE,START_DT,END_DT,WORKFLOW_INSTANCE_STATUS,RUN_TIME_IN_MINS,EVENT_GROUP_ID from TWO join " + current_db_schema + "M_WORKFLOW mw on mw.WORKFLOW_ID = TWO.WORKFLOW_ID join " + current_db_schema + "VW_WORKFLOW_EXECUTION_STATUS vw on (vw.WORKFLOW_INSTANCE_ID = TWO.WORKFLOW_INSTANCE_ID and vw.WORKFLOW_ID = TWO.WORKFLOW_ID) order by mw." + req.query.order_by + " " + req.query.order_type); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
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


    /*  JOBS
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


var getMetastores = async function (config,res,res_data)
{     
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = global_conn_pool[JSON.stringify(config)].request();          
          sql_result = sql_request.query("select NAME from sysdatabases where NAME like '%_metastore'");

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
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


var getColumns = async function (config,req,res,res_data)
{     
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          REQ_COL = "COLUMN_NAME";
          DB_NAME  = req.body.db;
          SCHEMA_NAME  = "INFORMATION_SCHEMA";
          TBL_NAME  = "COLUMNS";

          //Prepare an SQL request
          const sql_request = global_conn_pool[JSON.stringify(config)].request();          
          sql_result = sql_request.query("select " + REQ_COL + " from " + DB_NAME + "." + SCHEMA_NAME + "." + TBL_NAME + " where TABLE_NAME='" + req.body.table_name + "'");

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.send(res_data);
            
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : JSON.stringify(err)};
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


var generateConfig = function(req,decodedToken)
{   
  return new Promise((resolve,reject) => {    
    if(req.method=='GET')
        {
          servername = req.query.server;
          auth_type = req.query.auth_type;          
        }
        else if(req.method=='POST')
        {
          servername = req.body.server;
          auth_type = req.body.auth_type;          
        }
        
      
    firebase.doc('users').collection(decodedToken.uid).doc('profile').get().then( user_data =>
    {   
      if(!user_data.exists)        
      {   
        result.data = {info : "User does not exist. Please <a href='/users/register' target='_self'>register</a>"}
        reject(result);
      }        
      user_data = user_data.data();       
      //Prepare a connection config
      var config = {
        user : decodedToken.uid,
        password : decrypt(user_data.password),
        server : servername,        
        domain : 'QUAERO',
        options: 
            {
              trustedConnection: (auth_type==0)?true:false
            }
        }                
      resolve(config);      
    })
    .catch(function(error) {
      result.data = {info : error};          
      reject(result)
    }); 
  });
}

var connectSQL = async function (decodedToken,req,res,res_data)
{ 
    generateConfig(req,decodedToken).then(config=>{
    
        //Once we prepare the config, we check to see if global conn pool exists
        //Check if conn pool exists               
        if(JSON.stringify(config) in global_conn_pool)
        {                       
          res_data.err = 0;      
          res_data.data = {info : "connected"};             
          res.send(res_data);                
        }
        else
        {                    
          //Prepare a connection pool
          new sql.ConnectionPool(config).connect()
          .then(pool => {      
              //Save the connection in global pool
              global_conn_pool[JSON.stringify(config)] = pool;
              res_data.err = 0;      
              res_data.data = {info : "connected"};             
              res.send(res_data);              

          }).catch(err => {
              delete global_conn_pool[JSON.stringify(config)];
              res_data.err = 1;
              res_data.data = {info : err.message}; 
              res.send(res_data);
          });  
        }        

  });

 }
module.exports = router;