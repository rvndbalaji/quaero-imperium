import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
const CancelToken = axios.CancelToken;
export const cancellers = {    
    cancelStats : undefined,
    canceMemCheck : undefined
};
let refreshTimeout;

export const getJobStats = ()=>
{   
    return (dispatch,getState) =>
    {               
       clearTimeout(refreshTimeout)   
       let host_list = getState().host.hosts           
       for(var host_index in host_list)
       {                      
           cancellers.cancelStats && cancellers.cancelStats()
           cancellers.canceMemCheck && cancellers.canceMemCheck()
           raiseJobStatusRequest(dispatch,getState,host_list[host_index])
           raiseServerMemUsageRequest(dispatch,getState,host_list[host_index])
       }    
    }
}


export const clearServerRefresh = () =>
{
    return(dispatch,getState) =>
    {
        cancellers.cancelStats && cancellers.cancelStats()
        cancellers.canceMemCheck && cancellers.canceMemCheck()
        clearTimeout(refreshTimeout)                        
    }
}


const scheduleNextRefresh=(dispatch)=>
{
    clearTimeout(refreshTimeout)
    refreshTimeout = setTimeout(()=>
    {                   
        dispatch(getJobStats())
    },5 * 60 * 1000) //5 minutes
}

const raiseJobStatusRequest = (dispatch,getState,host_details)=>
{   
   let server_name = host_details.host   
   let auth_type = host_details.auth_type
   let sql_un = host_details.sql_un
   let encrypt = host_details.encrypt
   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/jobStatus',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelStats = c
            }),
            params : {                
                server : server_name,
                auth_type,    
                sql_un, 
                encrypt,               
                schema:'dbo'                
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                if(res.data.code && res.data.code==='ELOGIN')
                {

                    dispatch({
                        type : 'SET_SERVER_JOBS',
                        serverName : server_name,
                        serverJobs : []
                    })  
                    dispatch(clearServerRefresh())
                }
               else
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
                    dispatch({
                        type : 'SET_SERVER_JOBS',
                        serverName : server_name,
                        serverJobs : []
                    })            
               }
                                    
            }
            else{                   
                dispatch({
                    type : 'SET_SERVER_JOBS',
                    serverName : server_name,
                    serverJobs : res.data.info
                })
                scheduleNextRefresh(dispatch)
            }
            
        }).catch(function (thrown) {
                if (axios.isCancel(thrown)) {                
                    
                } else {
                    dispatch({
                        type : 'SET_SERVER_JOBS',
                        serverName : server_name,
                        serverJobs : []
                    })                    
                }   
                     
            });;

    }).catch(err=>
        {            
            dispatch({
                type : 'SET_SERVER_JOBS',
                serverName : server_name,
                serverJobs : []
            })            
        });   
}


const raiseServerMemUsageRequest = (dispatch,getState,host_details)=>
{   
   let server_name = host_details.host   
   let auth_type = host_details.auth_type
   let sql_un = host_details.sql_un   
   let encrypt = host_details.encrypt

   //Prepare request     
   getIDToken().then(token=>
    {   
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/serverMemUsage',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.canceMemCheck = c
            }),
            params : {                
                server : server_name,
                sql_un,                
                auth_type,
                encrypt       
           }
        })
        .then(response=> response.data)
        .then(res=>{
            
            if(res.err===1)
            {
                if(res.data.code && res.data.code==='ELOGIN')
                {

                    dispatch({
                        type : 'SET_SERVER_MEM_USAGE',
                        serverName : server_name,
                        serverMemory : undefined
                    })     
                    dispatch(clearServerRefresh())
                }
                else
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
                    dispatch({
                        type : 'SET_SERVER_MEM_USAGE',
                        serverName : server_name,
                        serverMemory : undefined
                    })                             
                }
                   
            }
            else{                                   
                dispatch({
                    type : 'SET_SERVER_MEM_USAGE',
                    serverName : server_name,
                    serverMemory : res.data.info[0].USAGE
                })
                scheduleNextRefresh(dispatch)
            }
            
        }).catch(function (thrown) {
                if (axios.isCancel(thrown)) {                
                    
                } else {
                    dispatch({
                        type : 'SET_SERVER_MEM_USAGE',
                        serverName : server_name,
                        serverMemory : undefined
                    })                    
                }                        
            });;

    }).catch(err=>
        {            
            dispatch({
                type : 'SET_SERVER_MEM_USAGE',
                serverName : server_name,
                serverMemory : undefined
            })            
        });   
}