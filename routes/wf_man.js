var express = require('express');
var router = express.Router();

//Prepare a global hashmap of global connection pools
//for each collection
var GLOBAL_CONN_POOL = {};

//Prepare a global hashmap of ENCRYPTED passwords of users
//and load them once and store them here. 
//This is loaded once and the password is reused from here instead of the database.
//when the database password updates, this is undefined, so it can be fetched freshly
GLOBAL_FLYING_PASSWORDS = {};

//We maintain a variable that has the last activity of a user
GLOBAL_LAST_USER_ACTIVITY = {}

//Connect to SQL
router.post('/connectSQL',function(req,res)
{ 
  var result = {
    err : 1,
    data : {}
  };       
    admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
    .then(function(decodedToken) 
    {      
       connectSQL(decodedToken,req,res,result)
            .then(resp=>{
                  if(resp.err==1)
                  {
                    throw resp.data.info
                  }
                  else
                  {
                    result.err = 0
                    result.data = {info:err}
                    res.send(result);
                  }
            }).catch(err=>{              
              res.send(err);              
            });

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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
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


router.post('/wf/act_deact',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          setWorkflowActiveFlag(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,setWorkflowActiveFlag);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/exec_details',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  };   
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{   
        
        
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        { 
          
          getWorkflowExecutionStatus(config,req,res,result);  
        }
        else{                    
          reconnectAndCallback(decodedToken,req,res,config,getWorkflowExecutionStatus);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.post('/wf/modifyStatus',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          setWorkflowInstanceStatus(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,setWorkflowInstanceStatus);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/error_log',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getErrorLog(config,req,res,result);  
        }
        else{                    
          reconnectAndCallback(decodedToken,req,res,config,getErrorLog);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});



router.get('/wf/getDatasetInstances',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getDatasetInstances(config,req,res,result);  
        }
        else{                    
          reconnectAndCallback(decodedToken,req,res,config,getDatasetInstances);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

router.get('/wf/datasets',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  };   
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWFDatasets(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWFDatasets);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.post('/wf/restage',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          restageFile(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,restageFile);

        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/entity',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWFEntity(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWFEntity);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});



router.get('/wf/dispatch_window',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getDispatchWindow(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getDispatchWindow);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});



router.post('/toggleJob',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {          
          toggleJob(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,toggleJob);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

router.get('/wf/params',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWFParams(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWFParams);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/source_system',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWFSourceSystem(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWFSourceSystem);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.post('/wf/performSystemScan',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          performSystemScan(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,performSystemScan);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

router.get('/wf/blockInfo',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getBlockedInfo(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getBlockedInfo);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

router.get('/wf/stageInfo',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWFStageInfo(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWFStageInfo);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

router.get('/wf/precompile',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getPrecompile(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getPrecompile);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/evalDispCond',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          evalDispatchCondition(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,evalDispatchCondition);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});

//Get the server stats given the servername and all the metastores
router.get('/wf/stats',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getWorkflowStats(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getWorkflowStats);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


//Get the server stats given the servername and all the metastores
router.get('/jobStatus',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getJobStatus(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getJobStatus);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});



//Get the server stats given the servername and all the metastores
router.get('/serverMemUsage',function(req,res)
{  
  var result = {
    err: 1,
    data : {}
  }; 
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {
          getServerMemoryUsagePercent(config,req,res,result);  
        }
        else{
          reconnectAndCallback(decodedToken,req,res,config,getServerMemoryUsagePercent);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  { 
    generateConfig(req,decodedToken).then(config=>{                   
        
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {           
          fetchWFDetails(config,req,res,result);          
        }
        else{          
          reconnectAndCallback(decodedToken,req,res,config,fetchWFDetails);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {                
          getMetastores(config,req,res,result);
        }
        else
        {          
          reconnectAndCallback(decodedToken,req,res,config,getMetastores);
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

  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {                
          getColumns(config,req,res,result);
        }
        else{          
          reconnectAndCallback(decodedToken,req,res,config,getColumns);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});


//Get columns for a given table name
router.post('/wf/setDispCond',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  }; 

  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {                
          setDispatchCondition(config,req,res,result);
        }
        else{          
          reconnectAndCallback(decodedToken,req,res,config,setDispatchCondition);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});


//Get columns for a given table name
router.post('/wf/setWorkflowParams',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  }; 

  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {                
          setWorkflowParams(config,req,res,result);
        }
        else{          
          reconnectAndCallback(decodedToken,req,res,config,setWorkflowParams);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});



//Get columns for a given table name
router.post('/wf/setSourceEntity',function(req,res){
  
  var result = {
    err: 1,
    data : {}
  }; 

  admin.auth().verifyIdToken(acquireTokenAsString(req.headers['authorization']))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)        
        {                
          setSourceEntity(config,req,res,result);
        }
        else{          
          reconnectAndCallback(decodedToken,req,res,config,setSourceEntity);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});


var getWorkflowStats = async function (config,req,res,res_data)
{   
  await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      

      var sql_result = sql_request.query(`
      DECLARE @STAT_TEMP TABLE (
        STAT varchar(max),
        COUNT bigint  
      )
      ;with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS ( select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from VW_WORKFLOW_EXECUTION_STATUS	where WORKFLOW_INSTANCE_STATUS not like 'FAILED%' and WORKFLOW_INSTANCE_STATUS not like 'COMPLETE%'), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME) 
        INSERT INTO @STAT_TEMP ( STAT, COUNT )
        select 'RUNNING' as STAT, count(WID) as COUNT from final
      
      ;with ONE (WORKFLOW_NAME,WORKFLOW_INSTANCE_ID) AS (	select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID as WORKFLOW_INSTANCE_ID from VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_INSTANCE_STATUS like 'FAILED%'), final (WORKFLOW_NAME,WID) as (select A.WORKFLOW_NAME,max(A.WORKFLOW_INSTANCE_ID) as WID from ONE A join vw_WORKFLOW_EXECUTION_STATUS B on A.WORKFLOW_INSTANCE_ID = B.WORKFLOW_INSTANCE_ID group by A.WORKFLOW_NAME)
        INSERT INTO @STAT_TEMP ( STAT, COUNT )
        select 'FAILED' as STAT, count(WID) as COUNT from final
      
      select STAT,COUNT from @STAT_TEMP`);
      
        //Capture the result when the query completes
        sql_result.then(function(result)
        {
          res_data.err = 0; 
          //Get the result and set it
          count_num = result.recordset[0].COUNT;                
          res_data.data = {count : count_num};
          res.status(200).send(res_data);
        }) .catch(err=>{
          res_data.err = 1; 
          res_data.data = {info : err};
          res.send(res_data);        
        });
    }
    catch (err)
    {      
      res_data.err = 1;             
      res_data.data = {info : 'Something went wrong at (GETWFSTAT) : ' + err.toString()};      
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Stats Error : ' + err.toString());
    }
}  



var getWorkflowCount = async function (config,req,res,res_data)
{   
  await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();     
      var sql_result;
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
          res.status(200).send(res_data);
        }) .catch(err=>{
          res_data.err = 1; 
          res_data.data = {info : err};
          res.send(res_data);        
        });
    }
    catch (err)
    {      
      res_data.err = 1; 
      res_data.data = {info : 'Something went wrong at (GETWFCONT) : ' + err.toString()};      
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Count Error : ' + err.toString());
    }
}  

var fetchWFDetails = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();      
      where_list_query_part = ``;      

      //Dirty fix, if column name is WORKFLOW_INSTANCE_ID, prefix it with "a." alias of the following query
      let new_where_key = 'w.' + req.query.where_key;
      if(req.query.where_key=='WORKFLOW_INSTANCE_ID')
      {
        new_where_key = 'a.' + req.query.where_key;        
      }

      if(req.query.where_is_list=='true')
      {
        let where_list = req.query.where_val.split(',');
        where_list_query_part = parameteriseQueryForIn(sql_request,new_where_key, req.query.where_key +'_', sql.BigInt,where_list)
      }     
      else
      {        
        sql_request.input('where_val','%' + req.query.where_val + '%')
        where_list_query_part = new_where_key + ` like @where_val`;
      }
 

      query_text = `      
      with main_view as (
      select 
            w.WORKFLOW_ID as WORKFLOW_ID,	  
            a.workflow_instance_id as WORKFLOW_INSTANCE_ID,
            (select STATUS from M_WORKFLOW_INSTANCE_STATUS where STATUS_ID=a.STATUS_ID) as WORKFLOW_INSTANCE_STATUS,
            w.WORKFLOW_NAME,   
          w.WORKFLOW_DESC,         
            DATEDIFF(MINUTE,a.START_DT,isnull(a.END_DT,GETDATE()) ) as RUN_TIME_IN_MINS,
            w.ACTIVE_FLG,
          w.UPDATE_USER,
          cast(w.UPDATE_DT as varchar(40)) as UPDATE_DT,          
          cast(START_DT as varchar(40)) as START_DT,
          cast(END_DT as varchar(40)) as END_DT                
      from M_TRACK_WORKFLOW_INSTANCE a
      right join M_WORKFLOW w on w.WORKFLOW_ID=a.WORKFLOW_ID
      left join (SELECT  b.WORKFLOW_DATASET_INSTANCE_MAP_ID,coalesce(a.WORKFLOW_INSTANCE_ID,b.WORKFLOW_INSTANCE_ID) as WORKFLOW_INSTANCE_ID
                                ,a.DATASET_INSTANCE_ID as DSI_IN
                                ,b.DATASET_INSTANCE_ID as DSI_OUT
                    FROM ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                from M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='INPUT' )a
                    full outer join ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                from M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='OUTPUT' ) b 
                    on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID            
                    ) b on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID          
      where ` + where_list_query_part  + `),
      final(WORKFLOW_ID,WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,WORKFLOW_DESC,RUN_TIME_IN_MINS,ACTIVE_FLG,UPDATE_USER,UPDATE_DT,START_DT,END_DT) 
      as(
      select distinct WORKFLOW_ID,WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,WORKFLOW_DESC,RUN_TIME_IN_MINS,ACTIVE_FLG,UPDATE_USER,UPDATE_DT,START_DT,END_DT from main_view where WORKFLOW_INSTANCE_ID in (select max(WORKFLOW_INSTANCE_ID) from main_view group by WORKFLOW_ID)
      union
      select distinct WORKFLOW_ID,WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,WORKFLOW_DESC,RUN_TIME_IN_MINS,ACTIVE_FLG,UPDATE_USER,UPDATE_DT,START_DT,END_DT from main_view 
      where WORKFLOW_INSTANCE_ID  is NULL)
      select top 100 * from final
      order by ` + req.query.order_by + ` ` + req.query.order_type + `;`
         
      
      var sql_result = sql_request.query(query_text);             
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};        
        res.status(200).send(res_data);                        
      })
      .catch(error=>{
        res_data.err = 1;         
        res_data.data = {info : JSON.stringify(error)};
        res.send(res_data);           
      });
    }
    catch (error)
    {             
      res_data.err = 1;       
      res_data.data = {info : 'Something went wrong at (GETWFSTAT) : ' + error};      
      res.send(res_data);            
      logger.error(config.user + '\t' + 'Workflow Fetch Error : ' + error);
    }
}


var getWorkflowExecutionStatus = async function (config,req,res,res_data)
{       
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      sql_request.input('where_clause_val',sql.BigInt,req.query.where_val);              
      let myquery = `
              select
              a.WORKFLOW_ID as WORKFLOW_ID,
              a.workflow_instance_id as WORKFLOW_INSTANCE_ID,
              (select STATUS from M_WORKFLOW_INSTANCE_STATUS where STATUS_ID=a.STATUS_ID) as WORKFLOW_INSTANCE_STATUS,
              w.WORKFLOW_NAME,
              (select WORKFLOW_TYPE from M_WORKFLOW_TYPE where WORKFLOW_TYPE_ID=w.WORKFLOW_TYPE_ID) as WORKFLOW_TYPE,
              c.DATASET_INSTANCE_ID INPUT_DATASET_INSTANCE,
              d.DATASET_INSTANCE_ID OUTPUT_DATASET_INSTANCE,
              REPLACE(REPLACE(l.EVENT_MSG,'<a href="',''),'" target="_blank">Oozie Job URL</a>','') as OOZIE_JOB_URL,
              g.NUM_RECORDS_INSERTED,
              g.NUM_RECORDS_UPDATED,
              g.NUM_RECORDS_DELETED,              
              cast(a.START_DT as varchar(40)) as START_DT,
              cast(a.END_DT as varchar(40)) as END_DT,
              DATEDIFF(MINUTE,a.START_DT,isnull(a.END_DT,GETDATE()) ) as RUN_TIME_IN_MINS,
              w.ACTIVE_FLG as WF_ACTIVE_FLG,
              h.FILE_NM,              
              c1.STATUS as DSI_IN_STATUS,
              d1.STATUS as DSI_OUT_STATUS,
              a.EVENT_GROUP_ID,
              w.DISPATCH_CONDITION
          from  M_TRACK_WORKFLOW_INSTANCE a
          join m_workflow w on w.WORKFLOW_ID=a.WORKFLOW_ID
          left join (SELECT  b.WORKFLOW_DATASET_INSTANCE_MAP_ID,coalesce(a.WORKFLOW_INSTANCE_ID,b.WORKFLOW_INSTANCE_ID) WORKFLOW_INSTANCE_ID
                                    ,a.DATASET_INSTANCE_ID as DSI_IN
                                    ,b.DATASET_INSTANCE_ID as DSI_OUT
                        FROM ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                    from M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='INPUT' )a
                        full outer join ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                    from  M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='OUTPUT' ) b 
                        on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID            
                        ) b on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID
          left join M_TRACK_DATASET_INSTANCE c on b.DSI_IN=c.DATASET_INSTANCE_ID 
          left join M_TRACK_DATASET_INSTANCE d on b.DSI_OUT=d.DATASET_INSTANCE_ID 
          left JOIN M_DATASET_INSTANCE_STATUS c1 on c.STATUS_ID=c1.STATUS_ID
          left JOIN M_DATASET_INSTANCE_STATUS d1 on d.STATUS_ID=d1.STATUS_ID
          left join M_DATASET e on e.DATASET_ID=c.DATASET_ID
          left join M_HOST rak on rak.HOST_ID=e.HOST_ID
          left join M_DATASET f on f.DATASET_ID=d.DATASET_ID
          left join M_HOST rak1 on rak1.HOST_ID=f.HOST_ID
          left join M_TRACK_OUTPUT_DATASET_INSTANCE_STATS g on g.WORKFLOW_DATASET_INSTANCE_MAP_ID=b.WORKFLOW_DATASET_INSTANCE_MAP_ID
          left join M_TRACK_FILE h on h.DATASET_INSTANCE_ID=c.DATASET_INSTANCE_ID
          left join M_TRACK_EVENT_LOG l on l.EVENT_GROUP_ID=a.EVENT_GROUP_ID and l.EVENT_MSG like '%/oozie/?%'
          where w.WORKFLOW_ID = @where_clause_val order by WORKFLOW_INSTANCE_ID desc`;

          
      var sql_result = sql_request.query(myquery); 
      
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);        
      })
      .catch(err=>{        
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);                       
      });
    }
    catch (err)
    {       
      res_data.data = {info : 'Something went wrong at (GETWFSTAT) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Fetch Error : ' + err.toString());
    }
}


var getErrorLog = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      sql_request.input('event_group_id', req.query.event_group_id)
      var sql_result = sql_request.query("select EVENT_ID,EVENT_MSG,cast(UPDATE_DT as varchar(40)) as DATE from M_TRACK_EVENT_LOG where EVENT_GROUP_ID = @event_group_id order by EVENT_ID desc"); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETERRLOG) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Get Logs Error : ' + err.toString());
    }
}



const removeQuotedStrings = function(sourceString)
{
    let single_quote_reg =  new RegExp(/'[^']+'/, "g")
    let double_quote_reg =  new RegExp(/"[^"]+"/, "g")
    modified_string = sourceString
    let single_quoted_strings = sourceString.matchAll(single_quote_reg)
    let double_quoted_strings = sourceString.matchAll(double_quote_reg)
    for(singl_substring of single_quoted_strings)
    {
      //remove single quoted strings
      modified_string = modified_string.replace(singl_substring[0],'')
    }
    for(doubl_substring of double_quoted_strings)
    {
      //remove double quoted strings
      modified_string = modified_string.replace(doubl_substring[0],'')
    }
    return modified_string
}
const sqlStatementContainsType = function(sql_stmt,rejectableKeywords)
{
    let res= false;
    let sql_stmt_nostring = removeQuotedStrings(sql_stmt);        
    let tokens = sql_stmt_nostring.split(' ')        
    for(const index in tokens)
    {
        if(tokens[index] && tokens[index].trim()!=='')
        {
          //Convert valid tokens to lower case and check if they contain the keywords
          
          if(rejectableKeywords.includes(tokens[index].toLowerCase()))
          {            
            res = true;
            break;
          }
        }
    }    
    
  return res
}

var setDispatchCondition = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      
      let disp_cond = req.body.dispatch_condition;
      if(!req.body.workflow_id || req.body.workflow_id.trim()==='')
      {
        throw 'No Workflow ID was specified'        
      }
      

      if(!disp_cond || disp_cond.trim()==='')
      {
        sql_request.input('disp_cond', undefined)         
        disp_cond = undefined
      }            
      else
      {
        //Here check if statement is a delete or update or drop statement                   
          if(sqlStatementContainsType(disp_cond,['drop','delete']))
          {
            throw "Dispatch conditions cannot contain [drop, delete] statements. If this is a special occurence, please report to admin"
          }        
      }
      
      sql_request.input('disp_cond', disp_cond)         
      let myquery = `update M_WORKFLOW set DISPATCH_CONDITION = @disp_cond where WORKFLOW_ID = @workflow_id`      
      
      sql_request.input('workflow_id', req.body.workflow_id)   
      sql_request.query(myquery, (err, result) =>
      {
        if(err)
        {
          res_data.err = 1; 
          res_data.data = {info : JSON.stringify(err)};
          res.send(res_data);     
        }
        else
        {
          res_data.err = 0; 
          res_data.data = {info : JSON.stringify(result)};
          res.send(res_data);
        }
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (SETDISPCOND) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Set Disp Cond : ' + err.toString());
    }
}


var setWorkflowParams = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      if(!req.body.workflow_package_param_id || req.body.workflow_package_param_id.trim()==='' )
      {
        throw 'No Workflow Param ID was specified'        
      }            

      if(!req.body.workflow_param_name || req.body.workflow_param_name.trim()==='' )
      {
        throw 'No Workflow Param Name was specified'        
      }   

      let param_value = req.body.workflow_param_value;
      if(!param_value || param_value.trim()==='')
      {
        param_value = undefined
      }    

      sql_request.input('param_value', param_value)               
     
      let myquery = `update M_WORKFLOW_PACKAGE_PARAM set PARAM_NAME = @workflow_param_name, PARAM_VALUE = @param_value where WORKFLOW_PACKAGE_PARAM_ID = @workflow_package_param_id`            
      sql_request.input('workflow_package_param_id', req.body.workflow_package_param_id)         
      sql_request.input('workflow_param_name', req.body.workflow_param_name)         
      sql_request.query(myquery, (err, result) =>
      {
        if(err)
        {
          res_data.err = 1; 
          res_data.data = {info : JSON.stringify(err)};
          res.send(res_data);     
        }
        else
        {
          res_data.err = 0; 
          res_data.data = {info : JSON.stringify(result)};
          res.send(res_data);
        }
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (SETWFPARAM) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Set Workflow Param : ' + err.toString());
    }
}


var setSourceEntity = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      if(!req.body.source_entity_id || req.body.source_entity_id.trim()==='' )
      {
        throw 'No Source Entity ID was specified'        
      }            

      if(!req.body.keyValuePairs || req.body.keyValuePairs.length===0)
      {
        throw 'No Key Value Pairs were specified'        
      }     
      
      let myquery = `update M_SOURCE_ENTITY set `;
      let query_pieces = []
      keyValuePairs = req.body.keyValuePairs;      
      for(keyname in keyValuePairs)
      {
        if(['FILE_FORMAT'].includes(keyname))
        {
          throw keyname + ' column does not belong to an entity, it was created using joins. Please exclude the column'
        }  
        let value = keyValuePairs[keyname];
        if(!value)
        {
          value = undefined         
        }    
        sql_request.input(keyname, value)                 
        string_val = ` ` + keyname + ` = @` + keyname + ` `
        query_pieces.push(string_val)        
      }
      myquery = myquery + query_pieces.join(',') +  ` where ID = @source_entity_id`;            
      //Replace single quotes with double-single quotes
      //param_value = (param_value)?param_value.replace(/\'/g,"''"):undefined

      
      sql_request.input('source_entity_id', req.body.source_entity_id)               
      sql_request.query(myquery, (err, result) =>
      {
        if(err)
        {
          res_data.err = 1; 
          res_data.data = {info : JSON.stringify(err)};
          res.send(res_data);     
        }
        else
        {
          res_data.err = 0; 
          res_data.data = {info : JSON.stringify(result)};
          res.send(res_data);
        }
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (EDITSCENT) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Set Source Entity : ' + err.toString());
    }
}

var getWFDatasets = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('workflow_id', req.query.workflow_id)      
      var query_string = `
      select 'INPUT' as TYPE, ds.DATASET_ID,DATASET_NAME,DATASET_DESC,OBJECT_TYPE,OBJECT_SCHEMA,OBJECT_NAME,HOST_ID,EXPIRATION_CONDITION,PRIMARY_KEY_COLUMNS,DATA_COLUMNS,PARTITION_COLUMNS,ACTIVE_FLG from M_DATASET ds
      join M_WORKFLOW_INPUT inp on inp.DATASET_ID =  ds.DATASET_ID
      where WORKFLOW_ID = @workflow_id
      union all
      select 'OUTPUT' as DATASET_TYPE,ds.DATASET_ID,DATASET_NAME,DATASET_DESC,OBJECT_TYPE,OBJECT_SCHEMA,OBJECT_NAME,HOST_ID,EXPIRATION_CONDITION,PRIMARY_KEY_COLUMNS,DATA_COLUMNS,PARTITION_COLUMNS,ACTIVE_FLG from M_DATASET ds
      join M_WORKFLOW_OUTPUT outp on outp.DATASET_ID =  ds.DATASET_ID
      where WORKFLOW_ID = @workflow_id`;
      var sql_result = sql_request.query(query_string); 
      
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    {       
      res_data.data = {info : 'Something went wrong at (GETERRLOG) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Get WF Datasets : ' + err.toString());
    }
}


var getDatasetInstances = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('dataset_id', req.query.dataset_id)      
      var query_string = `
      select DATASET_INSTANCE_ID as INSTANCE_ID, st.STATUS, OBJECT_URI
      from M_TRACK_DATASET_INSTANCE dsi 
      inner join M_DATASET_INSTANCE_STATUS st on st.STATUS_ID = dsi.STATUS_ID
      where DATASET_ID = @dataset_id
      order by DATASET_INSTANCE_ID desc
      `;
      var sql_result = sql_request.query(query_string); 
      
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    {       
      res_data.data = {info : 'Something went wrong at (GETDSI) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Get Dataset Instances : ' + err.toString());
    }
}

var restageFile = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('ftp_id', req.body.ftp_id)                  
      var query_string = `
      DECLARE @TEMP TABLE (
        FTP_ID int  
      )
      ;with dess as
      (
      select ID,PARENT_FTP_ID from M_TRACK_FTP 
      where ID = @ftp_id
      union all
      select A.ID , A.PARENT_FTP_ID  from M_TRACK_FTP A
      inner join dess B on B.PARENT_FTP_ID = A.ID
      )
      INSERT INTO @TEMP ( FTP_ID )
      select ID from dess;
      delete from M_TRACK_FTP where ID in (select FTP_ID from @TEMP);
      delete from M_TRACK_FILE where FTP_ID in (select FTP_ID from @TEMP);
      delete from M_TRACK_DATASET_INSTANCE where DATASET_INSTANCE_ID in (select DATASET_INSTANCE_ID from M_TRACK_FILE where FTP_ID in (select FTP_ID from @TEMP));      
       `;
      var sql_result = sql_request.query(query_string);       
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        logger.info(config.user + '\tRESTAGED file on ' + config.server + ' > ' + config.database + ' with FTP_ID = ' + req.body.ftp_id)
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (RESTGFLE) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Restage File : ' + err.toString());
    }
}



var getWFEntity = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('workflow_id', req.query.workflow_id)                  

      var query_string = `
      select ID,SYSTEM_ID,DATASET_ID,ENTITY_NM,ENTITY_DESC,FREQUENCY,FREQUENCY_DAYS,INCLUDE_HEADER,NUM_HEADER_ROWS,STAGE_STRATEGY,STAGE_TABLE_NM,NEXT_EXTRACT_VALUE,STAGE_PACKAGE_PATH,SOURCE_FILE_MASK,FILE_FORMAT,CONTROL_FILE_FLG,CONTROL_FILE_EXT,CONTROL_FILE_DELIMITER,CONTROL_FILE_MASK,COLUMN_DELIMITER,TEXT_QUALIFIER,ALLOW_STRING_TRUNCATION,ROW_DELIMITER,PRE_PROCESS_FUNCTION,DATABASE_HOST,DATABASE_NM,DATABASE_USERNAME,REQUIRED_FLG,REQUIRED_DATE_DIFF,DOWNLOAD_ONLY_FLG,UNZIP_FILE_FLG,STATUS,ACTIVE_FLG,STD_CONFIG_ID,MATCH_CONFIG_ID,DELETE_SOURCE_FILE_FLG,PARENT_SOURCE_ENTITY_ID,SOURCE_UOW_ID_FUNCT,SOURCE_LINEAGE_DT_FUNCT,HEADER_EXCLUDE_EXPRESSION,ROW_DELIM_ESCAPE_CHAR,COLUMN_DELIM_ESCAPE_CHAR from M_SOURCE_ENTITY ent
      left join M_FILE_FORMAT form on form.FILE_FORMAT_ID = ent.FILE_FORMAT_ID
      where DATASET_ID in (
        select DATASET_ID from M_WORKFLOW_INPUT where WORKFLOW_ID = @workflow_id
        union 
        select DATASET_ID from M_WORKFLOW_OUTPUT where WORKFLOW_ID = @workflow_id        
        );`;
      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETWFENT) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Entity Fetch Error : ' + err.toString());
    }
}


var getDispatchWindow = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('workflow_id', req.query.workflow_id)                  

      var query_string = `
      select * from M_WORKFLOW_DISPATCH_WINDOW where WORKFLOW_ID = @workflow_id`;
      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETDISPWIN) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Dispatch Window Error : ' + err.toString());
    }
}

var getWFParams = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('workflow_id', req.query.workflow_id)                  

      var query_string = `
      select WORKFLOW_PACKAGE_PARAM_ID,PARAM_NAME,PARAM_VALUE,WORKFLOW_PACKAGE_NAME,WORKFLOW_PACKAGE_DESC from M_WORKFLOW_PACKAGE_PARAM par
      inner join M_WORKFLOW_PACKAGE_MAP map on map.WORKFLOW_PACKAGE_MAP_ID = par.WORKFLOW_PACKAGE_MAP_ID
      inner join M_WORKFLOW_PACKAGE pack on pack.WORKFLOW_PACKAGE_ID = map.WORKFLOW_PACKAGE_ID
      where WORKFLOW_ID = @workflow_id`;
      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETWFPARAM) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Param Error : ' + err.toString());
    }
}

var reconnectAndCallback = async function(decodedToken,req,res,config,callBack)
{
  result = {
    err : 1,
    data : {}
  }
    
    connectSQL(decodedToken,req,res,result)
    .then(resp=>{      
    if(resp.err==1)
    {                        
      throw resp.data.info
    }
    else
    {            
      result.err  = 0
      result.data = resp.data.info
      callBack(config,req,res,result);      
    }
    }).catch(err=>{             
      res.send(err);              
    });
}

function parameteriseQueryForIn(request, columnName, parameterNamePrefix, type, values) {
  var parameterNames = [];
  for (var i = 0; i < values.length; i++) {
    var parameterName = parameterNamePrefix + i;
    request.input(parameterName, type, values[i]);
    parameterNames.push(`@${parameterName}`);
  }
  return `${columnName} IN (${parameterNames.join(',')})`
}

var getWFSourceSystem = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      let SS_IDs = req.query.ss_id.split(',')           
      var query_string = `
      select ID,SYSTEM_NM,DATA_INGESTION_PROTOCOL,API_HOST_ID,SOURCE_SYSTEM_TIME_BETWEEN_SCAN_SECS,REMOTE_DIRECTORY,SYSTEM_TYPE,ACTIVE_FLG from M_SOURCE_SYSTEM
      where ` + parameteriseQueryForIn(sql_request,'ID','SS_ID_',sql.BigInt,SS_IDs);
      
      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETSS) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Source System Fetch Error : ' + err.toString());
    }
}


var performSystemScan = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('ss_id',req.body.source_system_id);      
      var query_string = `
        delete from M_TRACK_SOURCE_SYSTEM_SCAN where SOURCE_SYSTEM_SCAN_ID in (
        select max(SOURCE_SYSTEM_SCAN_ID) from M_TRACK_SOURCE_SYSTEM_SCAN where SOURCE_SYSTEM_ID = @ss_id)
        and SOURCE_SYSTEM_SCAN_END_DT is not NULL
      `;
      
      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        logger.info(config.user + '\tForced system scan on ' + config.server + ' > ' + config.database + ' with SS_ID = ' + req.body.source_system_id)
        res_data.err = 0; 
        //Get the result and set it                        
        res_data.data = {info : result.rowsAffected};        
        res.status(200).send(res_data);
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (FRCSSCAN) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Source System Scan Error : ' + err.toString());
    }
}

var getWFStageInfo = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      
      sql_request.input('entity_id',req.query.entity_id);
      var query_string = `with dess as
      (
      select ID,PARENT_FTP_ID from M_TRACK_FTP
      where PARENT_FTP_ID is NULL
      and SOURCE_ENTITY_ID = @entity_id
      union all
      select A.ID , A.PARENT_FTP_ID  from M_TRACK_FTP A
      inner join dess B on B.ID = A.PARENT_FTP_ID
      )
      select SOURCE_ENTITY_ID, ftp.ID as FTP_ID, fle.ID as FLE_ID,fle.DATASET_INSTANCE_ID,dsis.STATUS as DSI_STATUS,ftp.FILE_NM,ftp.STATUS as FTP_STATUS, fle.STATUS as FLE_STATUS,PARENT_FTP_ID,fle.FILE_SIZE_BYTES from M_TRACK_FTP ftp
      left join M_TRACK_FILE fle on ftp.ID = fle.FTP_ID
      left join M_TRACK_DATASET_INSTANCE dsi on dsi.DATASET_INSTANCE_ID = fle.DATASET_INSTANCE_ID
      left join M_DATASET_INSTANCE_STATUS dsis on dsi.STATUS_ID=dsis.STATUS_ID
      where ftp.ID not in (select PARENT_FTP_ID from dess where PARENT_FTP_ID is not NULL)
      and SOURCE_ENTITY_ID = @entity_id
      order by ftp.ID desc`;
      
      var sql_result = sql_request.query(query_string); 
      
      
      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
        
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
        
      });
    }
    catch (err)
    { 
      
      res_data.data = {info : 'Something went wrong at (GETWFSTGINF) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Stage Info Fetch Error : ' + err.toString());
    }
}


var getPrecompile = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      sql_request.input('workflow_instance_id',sql.BigInt,req.query.workflow_instance_id);      
      var sql_result = sql_request.execute("USP_PRECOMPILE_WORKFLOW_PACKAGE_MANIFEST"); 

      //Capture the result when the query completes
      sql_result.then(function(first_result)
      {                        
        //Get the resultant temp table name
        temp_tbl_name = first_result.recordset[0].PRECOMPILED_TEMP_TABLE_NAME;
        
        //We can now send another request to query the PARAM_NAME and PARAM_VALUE in this temp table
        param_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();        
        var param_result = param_request.query(`
                    select distinct PARAM_NAME,PARAM_VALUE,WORKFLOW_PACKAGE_NAME,WORKFLOW_PACKAGE_DESC from ` + temp_tbl_name + ` A 
                    join M_WORKFLOW_PACKAGE_MAP map on a.WORKFLOW_PACKAGE_MAP_ID = map.WORKFLOW_PACKAGE_MAP_ID
                    join M_WORKFLOW_PACKAGE pack on map.WORKFLOW_PACKAGE_ID = pack.WORKFLOW_PACKAGE_ID`                    
                    );         
      
        //Capture the result when the query completes
        param_result.then(function(final_result)
          {        
            res_data.err = 0; 
            res_data.data = {info : final_result.recordset};
            res.status(200).send(res_data);               
          })
          .catch(err=>{
            res_data.err = 1; 
            res_data.data = {info : JSON.stringify(err)};
            res.send(res_data);               
          });

        //Wait for second request to complete, so don't send response to client
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (GETPRCMP) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Workflow Precompile Error : ' + err.toString());
    }
}



var evalDispatchCondition = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();
      sql_request.input('workflow_id',sql.BigInt,req.query.workflow_id);      
      var sql_result = sql_request.execute("USP_EVALUATE_DISPATCH_CONDITION"); 
      
      //Capture the result when the query completes
      sql_result.then(function(first_result)
      {                        
        //Get the resultant temp table name
        
        temp_tbl_name = first_result.recordset[0].TEMP_TABLE_NAME;
        
        //We can now send another request to query the PARAM_NAME and PARAM_VALUE in this temp table
        param_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();        
        var dsi_result = param_request.query(`
                    select * from ` + temp_tbl_name);         
      
        //Capture the result when the query completes
        dsi_result.then(function(final_result)
          {                    
            res_data.err = 0; 
            res_data.data = {info : final_result.recordset};
            res.status(200).send(res_data);               
          })
          .catch(err=>{
            res_data.err = 1; 
            res_data.data = {info : JSON.stringify(err)};
            res.send(res_data);               
          });

        //Wait for second request to complete, so don't send response to client
      })
      .catch(err=>{
        res_data.err = 1; 
        res_data.data = {info : JSON.stringify(err)};
        res.send(res_data);               
      });
    }
    catch (err)
    { 
      res_data.data = {info : 'Something went wrong at (EVALDISP) : ' + err.toString()};      
      res_data.err = 1;       
      res.send(res_data);               
      logger.error(config.user + '\t' + 'Evaluate Disp Cond: ' + err.toString());
    }
}


var getMetastores = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();          
          var sql_result = sql_request.query("select NAME from sysdatabases where NAME like '%_metastore'");

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.status(200).send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
            res.send(res_data);        
          });
      }
      catch (err)
      {
        res_data.data = {info : 'Something went wrong at (GETMTSTR) : ' + err.toString()};      
        res_data.err = 1;       
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Get Metastore Error : ' + err.toString());
      }
}

var getJobStatus = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();          
          var sql_result = sql_request.query(`
          DECLARE @JOB_NAME_TEMP TABLE (
            job_names varchar(max),
            metastore varchar(max)
          )
          DECLARE @JOB_DETAILTEMP TABLE
                         (job_id               UNIQUEIDENTIFIER NOT NULL,  
                         last_run_date         INT              NOT NULL,  
                         last_run_time         INT              NOT NULL,  
                         next_run_date         INT              NOT NULL,  
                         next_run_time         INT              NOT NULL,  
                         next_run_schedule_id  INT              NOT NULL,  
                         requested_to_run      INT              NOT NULL, 
                         request_source        INT              NOT NULL,  
                         request_source_id     sysname          COLLATE database_default NULL,  
                         running               INT              NOT NULL, 
                         current_step          INT              NOT NULL,  
                         current_retry_attempt INT              NOT NULL,  
                         job_state             INT              NOT NULL) 
          DECLARE @MyCursor CURSOR
          DECLARE @MyField VARCHAR(MAX)
          BEGIN
              SET @MyCursor = CURSOR FOR
              select NAME from sysdatabases where NAME like '%_metastore'
              OPEN @MyCursor 
              FETCH NEXT FROM @MyCursor 
              INTO @MyField
              WHILE @@FETCH_STATUS = 0
              BEGIN     
                insert into @JOB_NAME_TEMP (job_names, metastore)
                select name as job_names, @MyField as metastore FROM msdb.dbo.sysjobs jobs
                where jobs.name like '%' + @MyField + '%'
              FETCH NEXT FROM @MyCursor 
              INTO @MyField 
              END; 
              CLOSE @MyCursor
              DEALLOCATE @MyCursor
          END;
          insert into @JOB_DETAILTEMP
          EXEC master.dbo.xp_sqlagent_enum_jobs 1,dbo;
          select  name as NAME,metastore as METASTORE,enabled as ENABLED,running as RUNNING,
          case 
            when job_state = 0 then 'Unknown' 
            when job_state = 1 then 'Executing' 
            when job_state = 2 then 'Waiting for thread' 
            when job_state = 3 then 'Between retries' 
            when job_state = 4 then 'Idle' 
            when job_state = 5 then 'Suspended' 
            when job_state = 7 then 'Performing completion actions' 
          else 'Invalid' end as JOB_STATUS
          from msdb.dbo.sysjobs jb
          inner join @JOB_DETAILTEMP tmp on tmp.job_id = jb.job_id
          inner join @JOB_NAME_TEMP nm on jb.name=nm.job_names
          order by name asc
          `);

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.status(200).send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
            res.send(res_data);        
          });
      }
      catch (err)
      {
        res_data.data = {info : 'Something went wrong at (GEJOBSTATUS) : ' + err.toString()};      
        res_data.err = 1;       
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Get Job Status Error : ' + err.toString());
      }
}


var getServerMemoryUsagePercent = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();          
          var sql_result = sql_request.query(`
          select
            total_physical_memory_kb/1024 AS TOTAL_PHY_MEM_MB,
            available_physical_memory_kb/1024 AS AVAIL_PHY_MEM_MB,
            total_page_file_kb/1024 AS TOTAL_PAGE_FILE_MB,
            available_page_file_kb/1024 AS AVAIL_PAGE_FILE_MB,
            100 - (100 * CAST(available_physical_memory_kb AS DECIMAL(18,3))/CAST(total_physical_memory_kb AS DECIMAL(18,3))) 
            AS 'USAGE',
            system_memory_state_desc as INFO
          from  sys.dm_os_sys_memory;
          `);

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.status(200).send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
            res.send(res_data);        
          });
      }
      catch (err)
      {
        res_data.data = {info : 'Something went wrong at (GETMEMUSG) : ' + err.toString()};      
        res_data.err = 1;       
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Get Server Memory Usage Error : ' + err.toString());
      }
}

var toggleJob = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();                        
          var sql_result;                    
          //Check for both true and false, return error incase it undefined or some other value                                       
          sql_request.input('job_name',req.body.job_name)
          if(req.body.act_flag==1)    
          {
            sql_result = sql_request.execute('sp_start_job');
            logger.info(config.user + '\tENABLED JOB : ' + req.body.job_name)
          }
          else if(req.body.act_flag==0)    
          {              
            sql_result = sql_request.execute('sp_stop_job');          
            logger.info(config.user + '\tSTOPPED JOB : ' + req.body.job_name)
          }      
          else
          {
            res_data.err = 1; 
            res_data.data = {info : 'Invalid option. Accepts 1 or 0'};
            res.send(res_data);       
            return; 
          }
          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.returnValue};            
            res.send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
            res.status(200).send(res_data);        
          });
      }
      catch (err)
      {
        res_data.data = {info : 'Something went wrong at (TGLJOB) : ' + err.toString()};      
        res_data.err = 1;       
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Toggle Job Error : ' + err.toString());
      }
}

var setWorkflowActiveFlag = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();    

                    
          var sql_result;          
          
          //Check for both true and false, return error incase it undefined or some other value                                       

          sql_request.input('workflow_id',sql.BigInt,req.body.workflow_id)
          if(req.body.act_flag==1)    
          {
            sql_result = sql_request.execute('USP_ACTIVATE_WORKFLOW');            
          }
          else if(req.body.act_flag==0)    
          {              
            sql_result = sql_request.execute('USP_DEACTIVATE_WORKFLOW');          
          }      
          else
          {
            res_data.err = 1; 
            res_data.data = {info : 'Invalid option. Accepts 1 or 0'};
            res.send(res_data);       
            return; 
          }
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
            res.status(200).send(res_data);        
          });
      }
      catch (err)
      {
        res_data.err = 1; 
        res_data.data = {info : 'Something went wrong at (ACTDEACT) : ' + err.toString()};        
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Workflow ActivateDeactivate Error : ' + err.toString());
      }
}


var setWorkflowInstanceStatus = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();    
          
          var sql_result;          
          
          sql_request.input('workflow_instance_id',req.body.workflow_instance_id)
          sql_request.input('status',req.body.workflow_status)
          sql_result = sql_request.execute('USP_MODIFY_WORKFLOW_INSTANCE_STATUS');

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.status(200).send(res_data);
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : err};
            res.send(res_data);        
          });
      }
      catch (err)
      {
        res_data.err = 1; 
        res_data.data = {info : 'Something went wrong at (SETWFINST) : ' + err.toString()};        
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Workflow Instance Status Error : ' + err.toString());
      }
}

var getColumns = async function (config,req,res,res_data)
{     
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          var REQ_COL = "COLUMN_NAME";
          var DB_NAME  = req.body.db;
          var SCHEMA_NAME  = "INFORMATION_SCHEMA";
          var TBL_NAME  = "COLUMNS";

          //Prepare an SQL request
          const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();  
          sql_request.input('req_col',REQ_COL);          
          sql_request.input('req_tbl_name',req.body.table_name);          
          var sql_result = sql_request.query("select @req_col from " + DB_NAME + "." + SCHEMA_NAME + "." + TBL_NAME + " where TABLE_NAME=@req_tbl_name");

          //Capture the result when the query completes
          sql_result.then(function(result)
          {                    
            res_data.err = 0;             
            //Get the result and set it                
            res_data.data = {info : result.recordset};
            res.status(200).send(res_data);
            
          }).catch(err=>{                  
            res_data.err = 1; 
            res_data.data = {info : JSON.stringify(err)};
            res.send(res_data);   
            
          });
      }
      catch (err)
      {
        res_data.err = 1; 
        res_data.data = {info : 'Something went wrong at (GETCLMNS) : ' + err.toString()};        
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Table Column Fetch: ' + err.toString());
      }
}

var generateConfig = async function(req,decodedToken)
{ 
  
  return new Promise((resolve,reject) => {
    
    var result = {
      err: 1,
      data : {}
    }; 

    var servername;
    var auth_type;
    var database;
    var schema;    
    if(req.method=='GET')
        {          
          servername = req.query.server;
          database = req.query.db;
          schema = req.query.schema;
          auth_type = req.query.auth_type;                    
        }
        else if(req.method=='POST')
        {
          servername = req.body.server;
          database = req.body.db;
          schema = req.body.schema;
          auth_type = req.body.auth_type;          
        }
    
    //First check if a the user is present and a password is available,
    let fetchFromFirestore =  false;
    if(decodedToken.uid in GLOBAL_FLYING_PASSWORDS)
    {
      //If password is available, use that to prepare the config. This saves us a firestore READ.
      //If undefined, fetch the password from the firestore and use tha
      let enc_pass = GLOBAL_FLYING_PASSWORDS[decodedToken.uid];
      if(enc_pass)
      {        
        let config = prepareConfigUsingDetails(decodedToken.uid,enc_pass,servername,database,schema,auth_type)
        resolve(config);
      }
      else
      {        
        fetchFromFirestore = true;                
      }
    }
    else
    {      
      fetchFromFirestore = true;              
    }
    //Password isn't available in memory, so fetch it from firestore, and prepare config        
    if(fetchFromFirestore)
    {
      delete GLOBAL_FLYING_PASSWORDS[decodedToken.uid]
      firebase.doc('users').collection(decodedToken.uid).doc('profile').get().then( user_data =>
        {      
          if(!user_data.exists)        
          {                 
            error =  "There was an error fetching user information, please login again. ERR : GENCONF"
            reject(error);
            return
          }        
          var user_data = user_data.data();      
          //Prepare a connection config          
          GLOBAL_FLYING_PASSWORDS[decodedToken.uid] = user_data.password;
          let config = prepareConfigUsingDetails(decodedToken.uid,user_data.password,servername,database,schema,auth_type)                                  
          resolve(config);      
        })
        .catch(function(error) {      
          reject(error)
        }); 
    }
    
  });
}

function prepareConfigUsingDetails(username,enc_pass,servername,database,schema,auth_type)
{
  let config = {
    user : username,
    password : decrypt(enc_pass),
    server : servername,        
    database,
    schema,
    domain : 'QUAERO',        
    requestTimeout : 60000,
    options: 
        {
          trustedConnection: (auth_type==0)?true:false
        },        
    }   

  return config         
}

var connectSQL = async function (decodedToken,req)
{   
  res_data = {
    err : 1,
    data : {}
  }
  return new Promise((resolve,reject) => {
    
    generateConfig(req,decodedToken).then(config=>{
    
        //Once we prepare the config, we check to see if global conn pool exists
        //Check if conn pool exists               
        if(JSON.stringify(config) in GLOBAL_CONN_POOL)
        {                       
          res_data.err = 0;      
          res_data.data = {info : "connected"};             
          resolve(res_data)          
        }
        else
        {                    
          //Prepare a connection pool
          new sql.ConnectionPool(config).connect()
          .then(pool => {      
              //Save the connection in global pool
              GLOBAL_CONN_POOL[JSON.stringify(config)] = pool;
              res_data.err = 0;      
              res_data.data = {info : "connected"};             
              resolve(res_data)

          }).catch(err => {
              delete GLOBAL_CONN_POOL[JSON.stringify(config)];
              res_data.err = 1;
              res_data.data = {info : err.message};               
              reject(res_data)
          });  
        }        

  }).catch(promise_err=>{
    res_data.err = 1;
    res_data.data = {info : promise_err};   
    reject(res_data)
  });

});

}

var getBlockedInfo = async function (config,req,res,res_data)
{   
    
    await GLOBAL_CONN_POOL[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = GLOBAL_CONN_POOL[JSON.stringify(config)].request();

      sql_request.input('workflow_id', req.query.workflow_id)            
      var query_string = `
                            SELECT blocked_wfs.BLOCKED_REASON
                      FROM (
                      --Disabled WFs
                      SELECT WORKFLOW_ID, 'Disabled' AS BLOCKED_REASON
                      FROM M_WORKFLOW WHERE ACTIVE_FLG=0
                      and WORKFLOW_ID = @workflow_id
                      UNION

                      --WFs with no input DS
                      SELECT a.WORKFLOW_ID, 'No Input Dataset' AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      LEFT OUTER JOIN M_WORKFLOW_INPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      WHERE b.WORKFLOW_ID IS NULL
                      and a.WORKFLOW_ID = @workflow_id
                      UNION

                      --WFs with no output DS
                      SELECT a.WORKFLOW_ID, 'No Output Dataset' AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      LEFT OUTER JOIN M_WORKFLOW_OUTPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      WHERE b.WORKFLOW_ID IS NULL
                      and a.WORKFLOW_ID = @workflow_id
                      UNION

                      --WFs with no ready/expired/pending-delete DSIs
                      SELECT x.WORKFLOW_ID, 'No Available DSIs' AS BLOCKED_REASON
                      FROM M_WORKFLOW x
                      LEFT OUTER JOIN (SELECT a.*
                        FROM M_WORKFLOW a
                        JOIN M_WORKFLOW_INPUT b
                        ON a.WORKFLOW_ID=b.WORKFLOW_ID
                        JOIN (SELECT t.*, stat.STATUS
                          FROM M_TRACK_DATASET_INSTANCE t
                          JOIN M_DATASET_INSTANCE_STATUS stat
                          ON t.STATUS_ID=stat.STATUS_ID
                          WHERE stat.STATUS IN ('READY','EXPIRED','PENDING-DELETE')
                          AND t.DATASET_INSTANCE_ID NOT IN (
                            --Exclude dataset instances created by workflow instances that are not complete
                            SELECT y.DATASET_INSTANCE_ID
                            FROM M_TRACK_WORKFLOW_INSTANCE x
                            JOIN (SELECT * FROM M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP WHERE DATASET_INSTANCE_DIRECTION='OUTPUT') y
                            ON x.WORKFLOW_INSTANCE_ID=y.WORKFLOW_INSTANCE_ID
                            JOIN (SELECT * FROM M_WORKFLOW_INSTANCE_STATUS WHERE STATUS_PHASE<>'COMPLETE') z
                            ON x.STATUS_ID=z.STATUS_ID)) c
                        ON b.DATASET_ID=c.DATASET_ID
                        LEFT OUTER JOIN (
                          --Already successfully processed or currently being processed dataset instances for the workflow
                          SELECT DISTINCT x.WORKFLOW_ID, y.DATASET_INSTANCE_ID
                          FROM M_TRACK_WORKFLOW_INSTANCE x
                          JOIN (SELECT * FROM M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP WHERE DATASET_INSTANCE_DIRECTION='INPUT') y
                          ON x.WORKFLOW_INSTANCE_ID=y.WORKFLOW_INSTANCE_ID
                          JOIN M_WORKFLOW_INSTANCE_STATUS stat
                          ON x.STATUS_ID=stat.STATUS_ID
                          WHERE stat.STATUS_PHASE<>'FAILED') d
                        ON a.WORKFLOW_ID=d.WORKFLOW_ID
                        AND c.DATASET_INSTANCE_ID=d.DATASET_INSTANCE_ID
                        WHERE d.WORKFLOW_ID IS NULL) y
                      ON x.WORKFLOW_ID=y.WORKFLOW_ID
                      WHERE y.WORKFLOW_ID IS NULL
                      and x.WORKFLOW_ID = @workflow_id
                      UNION

                      --These are all the workflows that use the output from currently running workflows whose output dataset scope is table
                      SELECT WORKFLOW_ID, 'Input Dataset Blocked by Running WFI Writing to DS' AS BLOCKED_REASON
                      FROM M_WORKFLOW
                      WHERE WORKFLOW_ID IN (
                        --Workflow is currently running, any status besides Failed or Complete designates a workflow that is in some sort of procssing or pending state and is considered active
                        SELECT DISTINCT z.WORKFLOW_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN (SELECT * FROM M_WORKFLOW_OUTPUT WHERE DATASET_SCOPE IN ('DATASET','TABLE')) y -- running WFs' with table scope output
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_INPUT z -- running WFs' output is another WF's input
                        ON y.DATASET_ID=z.DATASET_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE'))

                      UNION

                      --These are all the workflows that write to a dataset that currently running workflow(s) consume(s) with table dataset scope
                      SELECT WORKFLOW_ID, 'Output Dataset Blocked by Running WFI Reading from DS' AS BLOCKED_REASON
                      FROM M_WORKFLOW
                      WHERE WORKFLOW_ID IN (
                        --Workflow is currently running, any status besides Failed or Complete designates a workflow that is in some sort of procssing or pending state and is considered active
                        SELECT DISTINCT z.WORKFLOW_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN (SELECT * FROM M_WORKFLOW_INPUT WHERE DATASET_SCOPE IN ('DATASET','TABLE')) y -- running WF's with table scope input
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_OUTPUT z -- running WFs' input is another WF's output
                        ON y.DATASET_ID=z.DATASET_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE'))

                      UNION

                      --These are all the workflows that write to a dataset that currently running workflow(s) write(s) to with table dataset scope
                      SELECT WORKFLOW_ID, 'Output Dataset Blocked by Running WFI Writing to DS' AS BLOCKED_REASON
                      FROM M_WORKFLOW
                      WHERE WORKFLOW_ID IN (
                        --Workflow is currently running, any status besides Failed or Complete designates a workflow that is in some sort of procssing or pending state and is considered active
                        SELECT DISTINCT z.WORKFLOW_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN (SELECT * FROM M_WORKFLOW_OUTPUT WHERE DATASET_SCOPE IN ('DATASET','TABLE')) y -- running WF's with table scope input
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_OUTPUT z -- running WFs' output is another WF's output
                        ON y.DATASET_ID=z.DATASET_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE'))

                      UNION

                      --These are all the workflows that consume a dataset with table dataset scope that currently running workflow(s) are working on
                      SELECT a.WORKFLOW_ID, 'Input Dataset Scope Blocked by Running WFI' AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      JOIN M_WORKFLOW_INPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      WHERE b.DATASET_ID IN (
                        SELECT DISTINCT z.DATASET_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN M_WORKFLOW y
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_INPUT z -- running WFs' output is another WF's output
                        ON y.WORKFLOW_ID=z.WORKFLOW_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE')
                        UNION
                        SELECT DISTINCT z.DATASET_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN M_WORKFLOW y
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_OUTPUT z -- running WFs' output is another WF's output
                        ON y.WORKFLOW_ID=z.WORKFLOW_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE'))
                      AND b.DATASET_SCOPE IN ('DATASET','TABLE')

                      UNION

                      --These are all the workflows that write to a dataset with table dataset scope that currently running workflow(s) are working on
                      SELECT a.WORKFLOW_ID, 'Output Dataset Scope Blocked by Running WFI' AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      JOIN M_WORKFLOW_OUTPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      WHERE b.DATASET_ID IN (
                        SELECT DISTINCT z.DATASET_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN M_WORKFLOW y
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_INPUT z -- running WFs' output is another WF's output
                        ON y.WORKFLOW_ID=z.WORKFLOW_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE')
                        UNION
                        SELECT DISTINCT z.DATASET_ID
                        FROM M_TRACK_WORKFLOW_INSTANCE x -- running WFs
                        JOIN M_WORKFLOW y
                        ON x.WORKFLOW_ID=y.WORKFLOW_ID
                        and x.WORKFLOW_ID = @workflow_id
                        JOIN M_WORKFLOW_OUTPUT z -- running WFs' output is another WF's output
                        ON y.WORKFLOW_ID=z.WORKFLOW_ID
                        JOIN M_WORKFLOW_INSTANCE_STATUS stat
                        ON x.STATUS_ID=stat.STATUS_ID
                        WHERE stat.STATUS_PHASE NOT IN ('FAILED','COMPLETE'))
                      AND b.DATASET_SCOPE IN ('DATASET','TABLE')

                      UNION

                      SELECT WORKFLOW_ID, 'Dispatch Window Condition Not Met' AS BLOCKED_REASON
                      FROM M_WORKFLOW
                      --These are all the workflows with dispatch windows enabled
                      WHERE WORKFLOW_ID IN (
                      SELECT DISTINCT WORKFLOW_ID FROM M_WORKFLOW_DISPATCH_WINDOW WHERE WINDOW_ENABLED=1)
                      --These are all the workflows with dispatch windows enabled that meet the dispatch window criteria
                      AND WORKFLOW_ID NOT IN (
                        SELECT DISTINCT disp_wind.WORKFLOW_ID
                        FROM (
                          SELECT x.WORKFLOW_ID,
                          CASE WHEN x.WINDOW_TYPE=4 THEN 1
                          WHEN x.WINDOW_TYPE=8 THEN
                            CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                            WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                            WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                            WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                            WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                            WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                            WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                            ELSE 0 END
                          WHEN x.WINDOW_TYPE=16 AND x.WINDOW_INTERVAL=DATEPART(DAY,GETDATE()) THEN 1
                          WHEN x.WINDOW_TYPE=32 THEN
                            CASE WHEN x.WINDOW_RELATIVE_INTERVAL=1 AND (DATEPART(DAY,GETDATE())-1)/7+1=1 THEN
                              CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                              WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                              WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                              WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                              WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                              WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                              WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                              ELSE 0 END
                            WHEN x.WINDOW_RELATIVE_INTERVAL=2 AND (DATEPART(DAY,GETDATE())-1)/7+1=2 THEN
                              CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                              WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                              WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                              WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                              WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                              WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                              WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                              ELSE 0 END
                            WHEN x.WINDOW_RELATIVE_INTERVAL=4 AND (DATEPART(DAY,GETDATE())-1)/7+1=3 THEN
                              CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                              WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                              WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                              WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                              WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                              WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                              WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                              ELSE 0 END
                            WHEN x.WINDOW_RELATIVE_INTERVAL=8 AND (DATEPART(DAY,GETDATE())-1)/7+1=4 THEN
                              CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                              WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                              WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                              WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                              WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                              WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                              WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                              ELSE 0 END
                            WHEN x.WINDOW_RELATIVE_INTERVAL=16 AND (DATEPART(DAY,GETDATE())-1)/7+1=5 THEN
                              CASE WHEN x.WINDOW_SUN_FLG=1 AND DATENAME(dw, GETDATE())='Sunday' THEN 1
                              WHEN x.WINDOW_MON_FLG=1 AND DATENAME(dw, GETDATE())='Monday' THEN 1
                              WHEN x.WINDOW_TUE_FLG=1 AND DATENAME(dw, GETDATE())='Tuesday' THEN 1
                              WHEN x.WINDOW_WED_FLG=1 AND DATENAME(dw, GETDATE())='Wednesday' THEN 1
                              WHEN x.WINDOW_THU_FLG=1 AND DATENAME(dw, GETDATE())='Thursday' THEN 1
                              WHEN x.WINDOW_FRI_FLG=1 AND DATENAME(dw, GETDATE())='Friday' THEN 1
                              WHEN x.WINDOW_SAT_FLG=1 AND DATENAME(dw, GETDATE())='Saturday' THEN 1
                              ELSE 0 END
                            ELSE 0 END
                          ELSE 0 END AS VALID_DAY_OF_WEEK_FLG,
                          CASE WHEN ISNULL(x.WINDOW_START_TIME,'00:00:00.0000000')<=CAST(SYSDATETIME() AS TIME) THEN 1
                            WHEN x.WINDOW_START_TIME>x.WINDOW_END_TIME AND ISNULL(x.WINDOW_END_TIME,'23:59:59.9999999')>=CAST(SYSDATETIME() AS TIME) THEN 1
                            ELSE 0 END AS VALID_START_TIME_FLG,
                          CASE WHEN ISNULL(x.WINDOW_END_TIME,'23:59:59.9999999')>=CAST(SYSDATETIME() AS TIME) THEN 1
                            WHEN x.WINDOW_START_TIME>x.WINDOW_END_TIME AND ISNULL(x.WINDOW_START_TIME,'00:00:00.0000000')<=CAST(SYSDATETIME() AS TIME) THEN 1
                            ELSE 0 END AS VALID_END_TIME_FLG,
                          CASE WHEN ISNULL(x.WINDOW_SUBDAY_TYPE,0)=0 THEN 1
                            WHEN x.WINDOW_SUBDAY_TYPE=2 AND DATEDIFF(SECOND,ISNULL(y.LAST_RUN_TIME,'2016-01-01'),GETDATE())>=x.WINDOW_SUBDAY_INTERVAL THEN 1
                            WHEN x.WINDOW_SUBDAY_TYPE=4 AND DATEDIFF(MINUTE,ISNULL(y.LAST_RUN_TIME,'2016-01-01'),GETDATE())>=x.WINDOW_SUBDAY_INTERVAL THEN 1
                            WHEN x.WINDOW_SUBDAY_TYPE=8 AND DATEDIFF(HOUR,ISNULL(y.LAST_RUN_TIME,'2016-01-01'),GETDATE())>=x.WINDOW_SUBDAY_INTERVAL THEN 1
                            ELSE 0 END AS VALID_INTERVAL_FLG,
                          CASE WHEN x.WINDOW_RECURRENCE_FACTOR>1 AND x.WINDOW_TYPE=8 AND DATEDIFF(WEEK,y.LAST_RUN_TIME,GETDATE())<x.WINDOW_RECURRENCE_FACTOR THEN 0
                            WHEN x.WINDOW_RECURRENCE_FACTOR>1 AND x.WINDOW_TYPE IN (16,32) AND DATEDIFF(MONTH,y.LAST_RUN_TIME,GETDATE())<x.WINDOW_RECURRENCE_FACTOR THEN 0
                            ELSE 1 END AS VALID_RECURRENCE_FLG
                          FROM (SELECT * FROM M_WORKFLOW_DISPATCH_WINDOW WHERE WINDOW_ENABLED=1) x
                          LEFT OUTER JOIN (SELECT t.WORKFLOW_ID, MAX(t.START_DT) AS LAST_RUN_TIME, COUNT(*) AS PROCESS_CNT
                            FROM M_TRACK_WORKFLOW_INSTANCE t
                            JOIN M_WORKFLOW_INSTANCE_STATUS stat
                            ON t.STATUS_ID=stat.STATUS_ID
                            WHERE stat.STATUS_PHASE<>'FAILED'
                            AND CONVERT(VARCHAR(8),t.START_DT,112)=CONVERT(VARCHAR(8),GETDATE(),112)
                            GROUP BY t.WORKFLOW_ID, CONVERT(VARCHAR(8),t.START_DT,120)) y
                          ON x.WORKFLOW_ID=y.WORKFLOW_ID
                          and x.WORKFLOW_ID = @workflow_id
                          ) disp_wind
                        WHERE disp_wind.VALID_DAY_OF_WEEK_FLG+disp_wind.VALID_START_TIME_FLG+disp_wind.VALID_END_TIME_FLG+disp_wind.VALID_INTERVAL_FLG+disp_wind.VALID_RECURRENCE_FLG=5)

                      UNION

                      --WF Client Disabled
                      SELECT a.WORKFLOW_ID,'Client Disabled' AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      JOIN M_CLIENT b
                      ON a.CLIENT_ID=b.ID
                      WHERE b.ACTIVE_FLG=0
                      and a.WORKFLOW_ID = @workflow_id

                      UNION

                      --WFs with disabled input DS
                      SELECT a.WORKFLOW_ID, 'Disabled Input Dataset' + CASE WHEN COUNT(DISTINCT c.DATASET_ID)>1 THEN 's:' ELSE ': ' END + dbo.GROUP_CONCAT(c.DATASET_ID) AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      JOIN M_WORKFLOW_INPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      JOIN (SELECT * FROM M_DATASET WHERE ACTIVE_FLG=0) c
                      ON b.DATASET_ID=c.DATASET_ID
                      and a.WORKFLOW_ID = @workflow_id
                      GROUP BY a.WORKFLOW_ID

                      UNION

                      --WFs with disabled output DS
                      SELECT a.WORKFLOW_ID, 'Disabled Output Dataset' + CASE WHEN COUNT(DISTINCT c.DATASET_ID)>1 THEN 's: ' ELSE ': ' END + dbo.GROUP_CONCAT(c.DATASET_ID) AS BLOCKED_REASON
                      FROM M_WORKFLOW a
                      JOIN M_WORKFLOW_OUTPUT b
                      ON a.WORKFLOW_ID=b.WORKFLOW_ID
                      and a.WORKFLOW_ID = @workflow_id
                      JOIN (SELECT * FROM M_DATASET WHERE ACTIVE_FLG=0) c
                      ON b.DATASET_ID=c.DATASET_ID
                      GROUP BY a.WORKFLOW_ID

                      ) blocked_wfs
                      JOIN M_WORKFLOW wf
                      ON blocked_wfs.WORKFLOW_ID=wf.WORKFLOW_ID
                      and wf.WORKFLOW_ID = @workflow_id
                      ORDER BY wf.WORKFLOW_ID`;

      var sql_result = sql_request.query(query_string); 

      //Capture the result when the query completes
      sql_result.then(function(result)
      {        
        res_data.err = 0; 
        //Get the result and set it                
        res_data.data = {info : result.recordset};
        res.status(200).send(res_data);
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
        res_data.data = {info : 'Something went wrong at (GETBLOCKINF) : ' + err.toString()};        
        res.send(res_data);               
        logger.error(config.user + '\t' + 'Get Blocked Info: ' + err.toString());
    }
}

module.exports = router;