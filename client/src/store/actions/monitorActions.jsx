import  firebase from '../../firebase/firebase'
import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
let unsubscribeMonitor;
let fire = firebase.firestore().collection('root')
let authUser;
const CancelToken = axios.CancelToken;
export const cancellers = {    
    cancelMonitor : undefined
};

let refreshTimeout;
let full_results

export const clearMonitorListener = () =>
{
    return(dispatch,getState) =>
    {
        clearTimeout(refreshTimeout)        
        unsubscribeMonitor && unsubscribeMonitor();        
        cancellers.cancelMonitor && cancellers.cancelMonitor();
    }
}


export const clearAllMonitors = () =>
{
    return(dispatch,getState) =>
    {
        cancellers.cancelMonitor && cancellers.cancelMonitor();
        clearTimeout(refreshTimeout)                
        dispatch({type : 'SET_MONITOR_RESULTS', monitorResults : undefined});                                    
        fire.doc("users").collection(authUser.uid).doc('monitors').delete();
    }
}
export const setMonitorListener = () =>
{    
    return (dispatch,getState) =>
    {
        authUser = getState().auth.authUser;                
        if(unsubscribeMonitor) unsubscribeMonitor();
        dispatch({type : 'SET_PROGRESS_BAR', pbar : true});     
        unsubscribeMonitor = fire.doc('users').collection(authUser.uid).doc('monitors').onSnapshot(function(monitors)
        {                      
            
            if (monitors.exists) {            
                let monitored_hosts = monitors.data();                                  
                dispatch({type : 'SET_REGISTERED_MONITORS_LIST', registeredMonitors : monitored_hosts})                                                                                
            }     
            else
            {
                dispatch({type : 'SET_REGISTERED_MONITORS_LIST', registeredMonitors : undefined})                                                                                
            }
            
            
            dispatch(queryMonitorWorkflows())            
            
        });
    }

}

export const toggleWorkflowMonitor = (togglestate,wf_details) =>
{    
    return (dispatch,getState) =>
    {
        cancellers.cancelMonitor && cancellers.cancelMonitor();
        clearTimeout(refreshTimeout)        
        dispatch({type : 'SET_REGISTERED_MONITORS_LIST', registeredMonitors : undefined})            
        let server_name = wf_details.server_name
        let metastore_name = wf_details.metastore_name
        let wfid = wf_details.wf_id

        let a_type = 0
        if(getState().host.hosts[server_name])
        {
            a_type = getState().host.hosts[server_name]['auth_type']
        }        
        
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
                dispatch({type : 'SET_MONITOR_RESULTS', monitorResults : undefined});                                    
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

let bulk_requests = []
const prepareAxiosRequests = (token,req_data)=>
{
    axios.defaults.headers.common['Authorization'] = token
    const single_req = axios.get('/wf_man/search/wf',{                                      
        params : {                
            ...req_data 
       },
       timeout : 15000, //15 sec,              
    cancelToken : new CancelToken(function executor(c){
            cancellers.cancelMonitor = c
        })
    }).catch(err =>{
        if (!axios.isCancel(err)) {            
            return {type : 'err', msg : err.message, payload : req_data};
          }         
    });

    bulk_requests.push(single_req);
}

const processResponses = async (respArray,dispatch,getState)=>
{
    respArray.forEach(resp => {        
        
        //Sometimes, requests may get cancelled, in such cases the response object may be undefined.
        //Don't process undefined objects

        if(!resp) return;
        //Check if error object
        if(resp.type && resp.type==='err')
        {
            resp.msg  = resp.payload.server + ' - ' + resp.payload.db + ' : ' + resp.msg             
            full_results.push(resp)            
        }
        else
        {
            let res = resp.data
            let msg = res.data.info;
            if(res.err===1)
            {
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
                
                //Prepare Error object            
                msg = {type : 'err', msg }                     
                full_results.push(msg);
            }
            else{

                if(res.data.info.length>=1)
                {   
                      //Add server and host details
                    msg.forEach(element => 
                        {            
                            element.SERVER_NAME =  resp.config.params.server;
                            element.METASTORE_NAME = resp.config.params.db;                                
                            full_results.push(element);
                        });  
                    
                }
                else
                {
                    msg = 'No workflows found in ' + resp.config.params.server + '.' + resp.config.params.db + ' where ' + resp.config.params.where_key + ' like "' + resp.config.params.where_value + '"';
                    //Prepare Error object
                    msg = {type : 'err', msg }
                    full_results.push(msg);
                }
                
            }  
        }                
 
    });
    
    
    
    //All results ready
     dispatch({type : 'SET_MONITOR_RESULTS', monitorResults : full_results});                    
     //After the results have been obtained, set a timeout and perform a refresh again using refresh interval
     let interval = getState().monitor.refreshInterval                        
     dispatch({type : 'SET_PROGRESS_BAR', pbar : false})
     refreshTimeout = setTimeout(()=>
     {            
         dispatch(queryMonitorWorkflows())            
     },interval * 1000)
}

export const queryMonitorWorkflows = () =>
{    
    //One idea is to fetch all workflow IDs and prepare a request for each and display them. But this would be very inefficient
    //due to the round-trip request time and query execution planning time on the server.
    //Instead, For each server, we collect the workflow IDs, group them by server and form a query per metastore
    //thus reducing the number of queries per workflow 

    return (dispatch,getState) =>
    {

        cancellers.cancelMonitor && cancellers.cancelMonitor();        
        clearTimeout(refreshTimeout)    
        let monitored_hosts = getState().monitor.registeredMonitors;                
        full_results = [];
        bulk_requests = []
        dispatch({type : 'SET_PROGRESS_BAR', pbar : true});     
        let isEmpty = true;        
        getIDToken().then(token=>
            {                
                for(var server_name in monitored_hosts)
                    {                           
                        for(var metastore_name in monitored_hosts[server_name])
                        {            
                            let wf_list = monitored_hosts[server_name][metastore_name];                            
                            if(wf_list && wf_list.wf_id && wf_list.wf_id.length>0)
                            {                                
                                //Group all workflow ID together
                                let wf_id_string = wf_list.wf_id.join(',');    
                                let auth_type = monitored_hosts[server_name]['auth_type']
                                let req_data = {
                                     server : server_name,
                                     auth_type, where_key : 'WORKFLOW_ID',
                                     where_val : wf_id_string,
                                     where_is_list : 'true' ,
                                     order_by: 'WORKFLOW_ID', order_type: 'asc', 
                                     db:metastore_name, 
                                     schema:'dbo'
                                };                                                                                        
                                isEmpty = false 
                                prepareAxiosRequests(token,req_data)                                
                            }                    
                        
                        }
                    }
                    if(isEmpty)
                    {                        
                        dispatch({type : 'SET_MONITOR_RESULTS', monitorResults : undefined});                                    
                        dispatch({type : 'SET_PROGRESS_BAR', pbar : false})                                
                    }
                    else
                    {                           
                        axios.all(bulk_requests)
                        .then(respArray => {
                           //dispatch({type : 'SET_MONITOR_RESULTS', monitorResults : undefined});                    
                           processResponses(respArray,dispatch,getState); 
                        }).catch(error =>{
                            let err = {type : 'err',msg: 'Fatal Refresh Error', payload : error }
                            console.log(err)
                        });
                    }
            });        
    }

}



export const setRefreshInterval = (interval) =>
{    
    return (dispatch,getState) =>
    {        
        cancellers.cancelMonitor && cancellers.cancelMonitor();
        clearTimeout(refreshTimeout)    
        dispatch({type : 'SET_REFRESH_INTERVAL', interval})              
        refreshTimeout = setTimeout(()=>
        {
            dispatch(queryMonitorWorkflows())            
        },1000)
    }
}