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
      res.status(200).render('wf_man',{
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



//Get Workflow View Page
router.get('/view', async function(req,res){
  
  //Verify user
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {
    res.status(200).render('wf_view',{
        title: 'Workflow Viewer',     
        cssfile : '../css/wf_man.css',
        cssanimate : '../frameworks/animate.css',
        viewer_flag: true
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


router.post('/wf/act_deact',function(req,res)
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
          setWorkflowActiveFlag(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (SETWFAD)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWorkflowExecutionStatus(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (SETWFES)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          setWorkflowInstanceStatus(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (MODWFS)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getErrorLog(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETELOG)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWFDatasets(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETWFDS)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


router.get('/wf/restage',function(req,res)
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
          restageFile(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (RESTGE)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWFEntity(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETENT)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWFSourceSystem(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETSS)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getBlockedInfo(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETBLK)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getWFStageInfo(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETSTG)'}
          res.send(result);
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
  
  admin.auth().verifyIdToken(acquireTokenAsString(req.cookies.authToken))
  .then(function(decodedToken) 
  {    
      generateConfig(req,decodedToken).then(config=>{          
        if(JSON.stringify(config) in global_conn_pool)        
        {
          getPrecompile(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETPRCMP)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  });
});


//Get the server stats given the servername and all the metastores
router.get('/stats',function(req,res)
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
          getServerStats(config,req,res,result);  
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETSTAT)'}
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
          fetchWFDetails(config,req,res,result);
        }
        else{
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETWF)'}
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
          result.data = {info:'Server connection does not exist. Please reload/re-login (GETCOL)'}
          res.send(result);
        }
    });
  }).catch(function(error) 
  {   
    res.status(403).send('Forbidden. Please sign in.')
  }); 
});



var getServerStats = async function (config,req,res,res_data)
{   
  await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();
      

      var sql_result;
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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}  



var getWorkflowCount = async function (config,req,res,res_data)
{   
  await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();
      //Set Database and Schema
      var current_db_schema = req.query.db + "." + req.query.schema + "."

      var sql_result;
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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}  

var fetchWFDetails = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();      
      where_list_query_part = ``;
      if(req.query.where_is_list=='true')
      {
        where_list_query_part = `in (` + req.query.where_val + `)`        
      }     
      else
      {
        where_list_query_part = `like '%` + req.query.where_val + `%'`        
      }

      //Dirty fix, if column name is WORKFLOW_INSTANCE_ID, prefix it with "a." alias of the following query
      if(req.query.where_key=='WORKFLOW_INSTANCE_ID')
      {
        req.query.where_key = 'a.' + req.query.where_key;        
      }
      else
      {
        req.query.where_key = 'w.' + req.query.where_key;
      }

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";            
      query_text = `      
      with main_view as (
      select 
            a.WORKFLOW_ID as WORKFLOW_ID,	  
            a.workflow_instance_id as WORKFLOW_INSTANCE_ID,
            (select STATUS from ` + current_db_schema + `M_WORKFLOW_INSTANCE_STATUS where STATUS_ID=a.STATUS_ID) as WORKFLOW_INSTANCE_STATUS,
            w.WORKFLOW_NAME,   
          w.WORKFLOW_DESC,         
            DATEDIFF(MINUTE,a.START_DT,isnull(a.END_DT,GETDATE()) ) as RUN_TIME_IN_MINS,
            w.ACTIVE_FLG,
          w.UPDATE_USER,
          cast(w.UPDATE_DT as varchar(40)) as UPDATE_DT,
          cast(START_DT as varchar(40)) as START_DT,
          cast(END_DT as varchar(40)) as END_DT                
      from ` + current_db_schema + `M_TRACK_WORKFLOW_INSTANCE a
      join ` + current_db_schema + `M_WORKFLOW w on w.WORKFLOW_ID=a.WORKFLOW_ID
      left join (SELECT  b.WORKFLOW_DATASET_INSTANCE_MAP_ID,coalesce(a.WORKFLOW_INSTANCE_ID,b.WORKFLOW_INSTANCE_ID) as WORKFLOW_INSTANCE_ID
                                ,a.DATASET_INSTANCE_ID as DSI_IN
                                ,b.DATASET_INSTANCE_ID as DSI_OUT
                    FROM ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                from ` + current_db_schema + `M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='INPUT' )a
                    full outer join ( select  a.WORKFLOW_DATASET_INSTANCE_MAP_ID,a.WORKFLOW_INSTANCE_ID,a.DATASET_INSTANCE_DIRECTION,a.DATASET_INSTANCE_ID 
                                from `+ current_db_schema +`M_TRACK_WORKFLOW_DATASET_INSTANCE_MAP a where DATASET_INSTANCE_DIRECTION='OUTPUT' ) b 
                    on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID            
                    ) b on a.WORKFLOW_INSTANCE_ID=b.WORKFLOW_INSTANCE_ID          
      where ` + req.query.where_key + ` ` + where_list_query_part  + `)
      select distinct WORKFLOW_ID,WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,WORKFLOW_DESC,RUN_TIME_IN_MINS,ACTIVE_FLG,UPDATE_USER,UPDATE_DT,START_DT,END_DT from main_view where WORKFLOW_INSTANCE_ID in (select max(WORKFLOW_INSTANCE_ID) from main_view group by WORKFLOW_ID)
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


var getWorkflowExecutionStatus = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var sql_result = sql_request.query("select WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,RUN_TIME_IN_MINS,OOZIE_JOB_URL,FILE_NM,NUM_RECORDS_INSERTED,cast(START_DT as varchar(40)) as START_DT,cast(END_DT as varchar(40)) as END_DT, INPUT_DATASET_INSTANCE,OUTPUT_DATASET_INSTANCE,WF_ACTIVE_FLG,DSI_IN_STAUTS,DSI_OUT_STATUS,EVENT_GROUP_ID from " + current_db_schema + "VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_ID = " + req.query.where_val + " order by " + req.query.order_by + " " + req.query.order_type); 
      //var sql_result = sql_request.query("declare @limit int; set @limit = " + req.query.limit + "; select top (@limit) WORKFLOW_NAME,WORKFLOW_INSTANCE_ID,WORKFLOW_INSTANCE_STATUS,RUN_TIME_IN_MINS,OOZIE_JOB_URL,FILE_NM,NUM_RECORDS_INSERTED,cast(START_DT as varchar(40)) as START_DT,cast(END_DT as varchar(40)) as END_DT, INPUT_DATASET_INSTANCE,OUTPUT_DATASET_INSTANCE,WF_ACTIVE_FLG,DSI_IN_STAUTS,DSI_OUT_STATUS,EVENT_GROUP_ID from " + current_db_schema + "VW_WORKFLOW_EXECUTION_STATUS where WORKFLOW_ID = " + req.query.where_val + " order by " + req.query.order_by + " " + req.query.order_type); 

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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}


var getErrorLog = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var sql_result = sql_request.query("select EVENT_ID,EVENT_MSG,cast(UPDATE_DT as varchar(40)) as DATE from " + current_db_schema + "M_TRACK_EVENT_LOG where EVENT_GROUP_ID = " + req.query.event_group_id + " order by EVENT_ID desc"); 

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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}



var getWFDatasets = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `
      select 'INPUT' as DATASET_TYPE, ds.DATASET_ID,DATASET_NAME,DATASET_DESC,OBJECT_TYPE,OBJECT_SCHEMA,OBJECT_NAME,HOST_ID,EXPIRATION_CONDITION,PRIMARY_KEY_COLUMNS,DATA_COLUMNS,PARTITION_COLUMNS,ACTIVE_FLG from ` + current_db_schema + `M_DATASET ds
      join ` + current_db_schema + `M_WORKFLOW_INPUT inp on inp.DATASET_ID =  ds.DATASET_ID
      where WORKFLOW_ID = ` + req.query.workflow_id + `
      union all
      select 'OUTPUT' as DATASET_TYPE,ds.DATASET_ID,DATASET_NAME,DATASET_DESC,OBJECT_TYPE,OBJECT_SCHEMA,OBJECT_NAME,HOST_ID,EXPIRATION_CONDITION,PRIMARY_KEY_COLUMNS,DATA_COLUMNS,PARTITION_COLUMNS,ACTIVE_FLG from ` + current_db_schema + `M_DATASET ds
      join ` + current_db_schema + `M_WORKFLOW_OUTPUT outp on outp.DATASET_ID =  ds.DATASET_ID
      where WORKFLOW_ID = ` + req.query.workflow_id + `;`;
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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}


var getBlockedInfo = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `
      select BLOCKED_REASON from ` + current_db_schema + `VW_BLOCKED_WORKFLOWS where WORKFLOW_ID = ` + req.query.workflow_id ;
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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}


var restageFile = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `
      DECLARE @TEMP TABLE (
        FTP_ID int  
      )
      ;with dess as
      (
      select ID,PARENT_FTP_ID from ` + current_db_schema + `M_TRACK_FTP 
      where ID = ` + req.query.ftp_id + `
      union all
      select A.ID , A.PARENT_FTP_ID  from ` + current_db_schema + `M_TRACK_FTP A
      inner join dess B on B.PARENT_FTP_ID = A.ID
      )
      INSERT INTO @TEMP ( FTP_ID )
      select ID from dess;
      delete from ` + current_db_schema + `M_TRACK_FTP where ID in (select FTP_ID from @TEMP);
      delete from ` + current_db_schema + `M_TRACK_FILE where FTP_ID in (select FTP_ID from @TEMP);
      delete from ` + current_db_schema + `M_TRACK_DATASET_INSTANCE where DATASET_INSTANCE_ID in (select DATASET_INSTANCE_ID from ` + current_db_schema + `M_TRACK_FILE where FTP_ID in (select FTP_ID from @TEMP));      
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
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}



var getWFEntity = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `
      select ID,SYSTEM_ID,DATASET_ID,ENTITY_NM,ENTITY_DESC,FREQUENCY,FREQUENCY_DAYS,INCLUDE_HEADER,NUM_HEADER_ROWS,STAGE_STRATEGY,STAGE_TABLE_NM,SOURCE_FILE_MASK,FILE_FORMAT_ID,COLUMN_DELIMITER,TEXT_QUALIFIER,ALLOW_STRING_TRUNCATION,ROW_DELIMITER,UNZIP_FILE_FLG,STATUS,ACTIVE_FLG,DELETE_SOURCE_FILE_FLG,HEADER_EXCLUDE_EXPRESSION from ` + current_db_schema + `M_SOURCE_ENTITY
      where DATASET_ID in (
        select DATASET_ID from ` + current_db_schema + `M_WORKFLOW_INPUT where WORKFLOW_ID = ` + req.query.workflow_id +`
        union 
        select DATASET_ID from ` + current_db_schema + `M_WORKFLOW_OUTPUT where WORKFLOW_ID = ` + req.query.workflow_id +`        
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
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}



var getWFSourceSystem = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `
      select ID,SYSTEM_NM,DATA_INGESTION_PROTOCOL,API_HOST_ID,SOURCE_SYSTEM_TIME_BETWEEN_SCAN_SECS,REMOTE_DIRECTORY,SYSTEM_TYPE,ACTIVE_FLG from ` + current_db_schema + `M_SOURCE_SYSTEM
      where ID in (` + req.query.ss_id + `);`;
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
      res_data.data = {info : err};
      res.send(res_data);               
    }
}


var getWFStageInfo = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var query_string = `with dess as
      (
      select ID,PARENT_FTP_ID from ` + current_db_schema + `M_TRACK_FTP 
      where PARENT_FTP_ID is NULL
      and SOURCE_ENTITY_ID = ` + req.query.entity_id + `
      union all
      select A.ID , A.PARENT_FTP_ID  from ` + current_db_schema + `M_TRACK_FTP A
      inner join dess B on B.ID = A.PARENT_FTP_ID
      )
      select SOURCE_ENTITY_ID, ftp.ID as FTP_ID, fle.ID as FLE_ID,fle.DATASET_INSTANCE_ID,dsis.STATUS as DSI_STATUS,ftp.FILE_NM,ftp.STATUS as FTP_STATUS, fle.STATUS as FLE_STATUS,PARENT_FTP_ID,fle.FILE_SIZE_BYTES from ` + current_db_schema + `M_TRACK_FTP ftp
      left join ` + current_db_schema + `M_TRACK_FILE fle on ftp.ID = fle.FTP_ID
      left join ` + current_db_schema + `M_TRACK_DATASET_INSTANCE dsi on dsi.DATASET_INSTANCE_ID = fle.DATASET_INSTANCE_ID
      left join ` + current_db_schema + `M_DATASET_INSTANCE_STATUS dsis on dsi.STATUS_ID=dsis.STATUS_ID
      where ftp.ID not in (select PARENT_FTP_ID from dess where PARENT_FTP_ID is not NULL)
      and SOURCE_ENTITY_ID = ` + req.query.entity_id + `
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
      res_data.err = 1; 
      res_data.data = {info : err};
      res.send(res_data);               
    }
}


var getPrecompile = async function (config,req,res,res_data)
{   
    
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
      //Prepare an SQL request
      const sql_request = global_conn_pool[JSON.stringify(config)].request();

      //Set Database and Schema
      current_db_schema = req.query.db + "." + req.query.schema + ".";      
      
      var sql_result = sql_request.query("EXEC " + current_db_schema + "USP_PRECOMPILE_WORKFLOW_PACKAGE_MANIFEST " + req.query.workflow_instance_id); 

      //Capture the result when the query completes
      sql_result.then(function(first_result)
      {                
        //Get the resultant temp table name
        temp_tbl_name = first_result.recordset[0].PRECOMPILED_TEMP_TABLE_NAME;
        
        //We can now send another request to query the PARAM_NAME and PARAM_VALUE in this temp table
        param_request = global_conn_pool[JSON.stringify(config)].request();
        var param_result = param_request.query("select distinct PARAM_NAME,PARAM_VALUE from " + temp_tbl_name);         
      
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
        res_data.err = 1; 
        res_data.data = {info : err};
        res.send(res_data);               
      }
}


var setWorkflowActiveFlag = async function (config,req,res,res_data)
{     
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = global_conn_pool[JSON.stringify(config)].request();    

          //Set Database and Schema
          current_db_schema = req.body.db + "." + req.body.schema + ".";      
          var sql_result;          
          
          //Check for both true and false, return error incase it undefined or some other value                                       
          if(req.body.act_flag==1)    
          {
            sql_result = sql_request.query('EXEC ' + current_db_schema + 'USP_ACTIVATE_WORKFLOW ' + req.body.workflow_id);
          }
          else if(req.body.act_flag==0)    
          {              
            sql_result = sql_request.query('EXEC ' + current_db_schema + 'USP_DEACTIVATE_WORKFLOW ' + req.body.workflow_id);          
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
        res_data.data = {info : 'Something went wrong'};
        res.send(res_data);               
      }
}


var setWorkflowInstanceStatus = async function (config,req,res,res_data)
{     
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          //Prepare an SQL request
          const sql_request = global_conn_pool[JSON.stringify(config)].request();    

          //Set Database and Schema
          current_db_schema = req.body.db + "." + req.body.schema + ".";      
          var sql_result;          
          
          sql_result = sql_request.query('EXEC ' + current_db_schema + 'USP_MODIFY_WORKFLOW_INSTANCE_STATUS ' + req.body.workflow_instance_id + ',\'' + req.body.workflow_status + '\'');

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
        res_data.data = {info : 'Something went wrong'};
        res.send(res_data);               
      }
}

var getColumns = async function (config,req,res,res_data)
{     
    await global_conn_pool[JSON.stringify(config)]; //Ensure a global sql connection exists
    try{
          var REQ_COL = "COLUMN_NAME";
          var DB_NAME  = req.body.db;
          var SCHEMA_NAME  = "INFORMATION_SCHEMA";
          var TBL_NAME  = "COLUMNS";

          //Prepare an SQL request
          const sql_request = global_conn_pool[JSON.stringify(config)].request();          
          var sql_result = sql_request.query("select " + REQ_COL + " from " + DB_NAME + "." + SCHEMA_NAME + "." + TBL_NAME + " where TABLE_NAME='" + req.body.table_name + "'");

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
        res_data.data = {info : err};
        res.send(res_data);             
      }
}


var generateConfig = function(req,decodedToken)
{ 
  return new Promise((resolve,reject) => {
    
    var result = {
      err: 1,
      data : {}
    }; 

    var servername;
    var auth_type;
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
      var user_data = user_data.data();       
      //Prepare a connection config
      

      var config = {
        user : decodedToken.uid,
        password : decrypt(user_data.password),
        server : servername,        
        domain : 'QUAERO',
        requestTimeout : 30000,
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
          res.status(200).send(res_data);                
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
              res.status(200).send(res_data);              

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