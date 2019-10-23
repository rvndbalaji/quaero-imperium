import  firebase from '../../firebase/firebase'
import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
let fire = firebase.firestore().collection('root')
let authUser;
const CancelToken = axios.CancelToken;
export const cancellers = {    
    cancelView : undefined,
    cancelSourceEntity : undefined,
    cancelSourceSystem : undefined,
    cancelParams : undefined,
    cancelBlock : undefined,
    cancelDatasets : undefined,
    cancelStageInfo : undefined,
    cancelDispatchWindow : undefined
};

let refreshTimeout;
let total_responses = 7;
let loaded_responses = 0;
let wf_details;
let master_workflow_details = {};
//var t0;
//var t1;


export const clearViewRefresh = () =>
{
    return(dispatch,getState) =>
    {
        clearTimeout(refreshTimeout)                        
    }
}
export const setViewMonitor = (wf_details_p)=>
{   
    return (dispatch,getState) =>
    {   
        if(!getState().view.loadComplete)
        {
            dispatch({type : 'SET_PROGRESS_BAR', pbar : 1})            
        }
        else
        {            
            dispatch({type : 'SET_PROGRESS_BAR', pbar : 100})                        
        }
        
        master_workflow_details = {}
        clearTimeout(refreshTimeout)                    
        wf_details  = wf_details_p                 

        //Get workflow block information
        fetchBlockInfo(dispatch,getState);

        //Get Source Entity
        fetchSourceEntity(dispatch,getState);

        //Fetch Workflow Dispatch Window
        fetchDispatchWindow(dispatch,getState);

        //Fetch Datasets
        fetchDatasets(dispatch,getState);

        //Get workflow's parameters
        fetchWFParams(dispatch,getState);

        //Get workflow information
        fetchWFDetails(dispatch,getState);
    }
}

const scheduleNextRefresh=(dispatch,getState)=>
{
    refreshTimeout = setTimeout(()=>
    {           
        
        dispatch(setViewMonitor(wf_details))
    },getState().view.refreshInterval * 1000)
}


const fetchWFDetails = (dispatch,getState)=>
{     
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/exec_details',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelView = c
            }),
            params : {                
                server : server_name,
                auth_type,
                where_key : 'WORKFLOW_ID', 
                where_val : wf_id,                 
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;                
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))                
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;
                    results.forEach(element => {            
                        element.SERVER_NAME = server_name;
                        element.METASTORE_NAME = metastore_name;                        
                    });                                            
                    master_workflow_details['workflowResult'] = results;                              
                }
                else
                {
                    //dispatch(setAlert('No instances found where WORKFLOW_ID like "' + wf_id + '"' ,'info'))      
                    master_workflow_details['workflowResult'] = undefined;
                }
                updateProgress(dispatch,getState);
                
            }
            
            
        }).catch(function (thrown) {
                if (axios.isCancel(thrown)) {                
                    
                } else {
                    dispatch(setAlert(thrown.message,'danger'))
                }                        
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))            
        });   
}


const updateProgress =(dispatch,getState)=>
{

    loaded_responses++;            
    if(loaded_responses>=total_responses)
    {
        dispatch(setAlert(undefined))                   
        dispatch({type : 'SET_PROGRESS_BAR', pbar : 0})  
        if(!getState().view.loadComplete)
        {
            dispatch({type : 'SET_LOAD_STATUS', loadComplete :true })        
        }      

        dispatch(setMasterWorkflowDetails())        
        loaded_responses = 0;        
        //console.log((t1-t0)/1000 + ' seconds ')
        scheduleNextRefresh(dispatch,getState)
    }
    else
    {
        if(!getState().view.loadComplete)
        {
            dispatch({type : 'SET_PROGRESS_BAR', pbar : (loaded_responses/total_responses)*100})        
        }
    }
}

const fetchSourceEntity = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/entity',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelSourceEntity = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                workflow_id : wf_id,                 
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['entityResult'] = results;
                    updateProgress(dispatch,getState);                    
                    fetchStageInfo(dispatch,getState);
                    fetchSourceSystem(dispatch,getState);
                }
                else
                {                    
                    master_workflow_details['entityResult'] = undefined;
                    //Call thrice.  For stage, entity, and source system
                    updateProgress(dispatch,getState);                    
                    updateProgress(dispatch,getState);                    
                    updateProgress(dispatch,getState);                    
                }
                
                
            }            
            
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {                
                                
            } else {
                dispatch(setAlert(thrown.message,'danger'))
            }            
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))            
        });   
}


const fetchDispatchWindow = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/dispatch_window',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelDispatchWindow = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                workflow_id : wf_id,                 
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['window'] = results;
                }
                else
                {                    
                    master_workflow_details['window'] = undefined;                    
                }               
                
            }    
        updateProgress(dispatch,getState);                            
            
        }).catch(function (thrown) {
            updateProgress(dispatch,getState);                                        
        });;

    }).catch(err=>
        {
            updateProgress(dispatch,getState);                            
        });   
}


const fetchStageInfo = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore   
   let ent_id = master_workflow_details.entityResult[0].ID
   let auth_type = wf_details.auth   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/stageInfo',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelStageInfo = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                entity_id : ent_id,                 
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['stageInfo'] = results;
                }
                else
                {
                    master_workflow_details['stageInfo'] = undefined;
                }
                updateProgress(dispatch,getState);
                
            }            
            
        }).catch(function (thrown) {            
            if (axios.isCancel(thrown)) {                
                                
            } else {                                
                dispatch(setAlert(thrown.message,'danger'))
            }            
            });;

    }).catch(err=>
        {            
            dispatch(setAlert(err,'danger'))            
        });   
}



const fetchSourceSystem = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore

   let system_id_list =  [] 
   let cur_entity = master_workflow_details.entityResult
   
   for(var i=0; i<cur_entity.length; i++)
   {
       system_id_list.push(cur_entity[i].SYSTEM_ID)
   }    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/source_system',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelSourceSystem = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                ss_id : system_id_list.join(","),           
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['sourceSystems'] = results;
                }
                else
                {                    
                    master_workflow_details['sourceSystems'] = undefined;
                }
                updateProgress(dispatch,getState);
            }            
            
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {                
                                
            } else {
                dispatch(setAlert(thrown.message,'danger'))
            }            
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))            
        });   
}




const fetchBlockInfo = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/blockInfo',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelBlock = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                workflow_id : wf_id,           
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                //Since theres an error, reset the block info
                dispatch({
                    type : 'SET_WF_BLOCK_INFO',
                    blockinfo : undefined
                 });                                     
            }
            else{                   
                let results = res.data.info;                                                          
                    dispatch({
                        type : 'SET_WF_BLOCK_INFO',
                        blockinfo : results
                     });   
                }            
            
        }).catch(function (thrown) {
                if (axios.isCancel(thrown)) {                
                                    
                } else {                                        
                    dispatch({
                        type : 'SET_WF_BLOCK_INFO',
                        blockinfo : undefined
                    });       
                }            
            });;

    }).catch(err=>
        {            
            dispatch({
                type : 'SET_WF_BLOCK_INFO',
                blockinfo : undefined
             });       
        });   
}



const fetchWFParams = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/params',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelParams = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                workflow_id : wf_id,           
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['params'] = results;                                                    
                }
                else
                {                    
                    master_workflow_details['params'] = undefined;                                                    
                }
                updateProgress(dispatch,getState);
                
            }            
            
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {                
                                
            } else {
                dispatch(setAlert(thrown.message,'danger'))
            }            
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))            
        });   
}


const fetchDatasets = (dispatch,getState)=>
{  
   let server_name = wf_details.server
   let metastore_name = wf_details.metastore
   let wf_id = wf_details.wf_id    
   let auth_type = wf_details.auth
   
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/wf/datasets',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelDatasets = c
            }),
            params : {                
                server : server_name,
                auth_type,                
                workflow_id : wf_id,           
                db : metastore_name,
                schema:'dbo'            
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                let msg = res.data.info;
                let inner_msg = msg;
                try
                {
                    inner_msg = JSON.parse(msg)                        
                    if(inner_msg.originalError && inner_msg.originalError.info && inner_msg.originalError.info.message)
                    {
                        msg = inner_msg.originalError.info.message;
                    }
                }
                catch(err)
                {
                    msg = res.data.info;                        
                }
                dispatch(setAlert(msg,'danger'))
            }
            else{                   
                if(res.data.info.length>=1)
                {                    
                    let results = res.data.info;                                                          
                    master_workflow_details['datasets'] = results;                                                    
                }
                else
                {                    
                    master_workflow_details['datasets'] = undefined;                                                    
                }
                updateProgress(dispatch,getState);
                
            }            
            
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {                
                                
            } else {
                dispatch(setAlert(thrown.message,'danger'))
            }            
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))            
        });   
}



export const toggleWorkflowMonitor = (togglestate) =>
{    
    return (dispatch,getState) =>
    {        
        let server_name = wf_details.server
        let metastore_name = wf_details.metastore
        let wfid = wf_details.wf_id
        let a_type = wf_details.auth
        authUser = getState().auth.authUser;                                
        if(togglestate)
        {                
                fire.doc("users").collection(authUser.uid).doc('monitors').set({  
                    [server_name] : 
                    {     
                        [metastore_name]: 
                        {
                            wf_id : firebase.firestore.FieldValue.arrayUnion(Number(wfid))
                        },
                        auth_type : a_type             
                    }
                },{merge : true})
                .then(function() {       
                    
                })
                .catch(function() {
                  console.log('Something went wrong while monitoring workflow : ' + wfid)     
                });
        }
        else
        {                
                fire.doc("users").collection(authUser.uid).doc('monitors').set({  
                    [server_name] : 
                    {     
                        [metastore_name]: 
                        {
                            wf_id : firebase.firestore.FieldValue.arrayRemove(Number(wfid))
                        },
                        auth_type : a_type             
                    }
                },{merge : true})
                .then(function() {       
                    
                })
                .catch(function() {
                    console.log('Something went wrong while removing monitor for workflow : ' + wfid)     
                });
        }
    }

}


export const setRefreshInterval = (interval,wf_details) =>
{    
    return (dispatch,getState) =>
    {           
        clearTimeout(refreshTimeout)    
        dispatch({type : 'SET_REFRESH_INTERVAL', interval})              
        refreshTimeout = setTimeout(()=>
        {            
            dispatch(setViewMonitor(wf_details))
        },1000)
    }
}


export const setAlert =(msg,color)=>{        
    return (dispatch,getState)=>
    {   
        dispatch({
            type : 'SET_VIEW_ALERT',
            msg,
            color
        });
    }
}



export const setMasterWorkflowDetails =()=>{    
    return (dispatch,getState)=>
    {   
        
        dispatch({
           type : 'SET_MASTER_WORKFLOW_DETAILS',
           allInstances : master_workflow_details.workflowResult,             
           entityResult : master_workflow_details.entityResult,
           sourceSystems : master_workflow_details.sourceSystems,
           datasets : master_workflow_details.datasets,
           stageInfo : master_workflow_details.stageInfo,
           params : master_workflow_details.params,           
           window : master_workflow_details.window
        });
    }
}