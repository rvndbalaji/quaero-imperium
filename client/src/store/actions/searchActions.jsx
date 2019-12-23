//import  firebase from '../../firebase/firebase'
import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
const CancelToken = axios.CancelToken;
//let fire = firebase.firestore().collection('root')
//let authUser;
export const cancellers = {
    cancelGetMetastore : undefined,
    cancelSearch : undefined
};
let start_time;
let end_time;
      

export const changeOption =(opt_name,opt_value)=>{        
    return (dispatch,getState)=>
    {   
        //Cancel any ongoing requests
        cancellers.cancelGetMetastore && cancellers.cancelGetMetastore();
        //Cancel any ongoing searches    
        cancellers.cancelSearch && cancellers.cancelSearch();        
        
        dispatch({
            type : 'NEW_OPTION_SELECTED',
            opt_name,
            opt_value
        });             
        //Depending on the type of update, dispatch various other actions
        processSearchOption(opt_name,dispatch,getState)        
    }
}

//let typingTimer;
//let doneTypingInterval = 1000; //1 second
const processSearchOption =(opt_name,dispatch,getState)=>
{    
    let opt_value = getState().search.options[opt_name]    
    switch(opt_name)
    {
        case 'selectedServer' : serverChanged(opt_value,dispatch,getState); break;
        case 'selectedMetastore' : ;break
        case 'selectedWorkflowColumn'  : break;
        case 'selectedSearchText' :  performSearch(dispatch,getState); break;
        case 'selectedSortColumn' : performSearch(dispatch,getState); break;
        case 'selectedSortOrder' : performSearch(dispatch,getState); break;
        default : ;
    }
}


const performSearch = (dispatch,getState)=>
{
    let srch_text =  getState().search.options.selectedSearchText.trim()
    
    //clear screen
    if(srch_text==='')
    {
        dispatch(setAlert(undefined))      
        dispatch({type: 'SET_SEARCH_RESULTS', workflowResults : undefined});
        return
    }    

    //Obtain the current search options
   
   let host_key = getState().search.options.selectedServer.trim()
   let server_name = getState().host.hosts[host_key].host;            
   let sql_un = getState().host.hosts[host_key].sql_un;     
   let auth_type = getState().host.hosts[host_key].auth_type
   let encrypt = getState().host.hosts[host_key].encrypt

    //Search col
   let srch_col = getState().search.options.selectedWorkflowColumn.trim()
    //Order by
   let order_col = getState().search.options.selectedSortColumn.trim()
    //Order asc/desc
   let order_ad = getState().search.options.selectedSortOrder.trim()

   let metastore_name = getState().search.options.selectedMetastore.trim()
   
   //Prepare request     
   getIDToken().then(token=>
    {            
        dispatch(setAlert('Fetching workflows...','primary'))                       
        start_time = performance.now();
        axios.defaults.headers.common['Authorization'] =token
        axios.get('/wf_man/search/wf',{            
            cancelToken : new CancelToken(function executor(c){
                cancellers.cancelSearch = c
            }),
            params : {                
                server : server_name,
                auth_type,
                sql_un,
                encrypt,
                where_key : srch_col, 
                where_val : srch_text, 
                where_is_list : 'false',
                order_by: order_col, 
                order_type: order_ad,
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
                    dispatch(setAlert(undefined))   
                    let results = res.data.info;
                    results.forEach(element => {            
                        element.SERVER_NAME = server_name;
                        element.METASTORE_NAME = metastore_name;
                        element.AUTH_TYPE = auth_type;                        
                        element.SQL_UN = sql_un ;     
                        element.ENCRYPT = (encrypt)?encrypt:0;                   
                    });     
                    end_time = performance.now();            
                    let timeTaken = (end_time-start_time)
                    
                    dispatch({type: 'SET_SEARCH_RESULTS', workflowResults : results, timeTaken});                    
                }
                else
                {
                    dispatch(setAlert('No workflows found where ' + srch_col + ' like "' + srch_text + '"' ,'info'))      
                }
                
            }
        }).catch(function (thrown) {
            if (axios.isCancel(thrown)) {                
                dispatch(setAlert(undefined))                    
            } else {
                dispatch(setAlert(thrown.message,'danger'))
            }
            });;

    }).catch(err=>
        {
            dispatch(setAlert(err,'danger'))
        });   
}

const serverChanged = (new_host_name,dispatch,getState)=> {    
    //Get host's auth type from store
    let auth_type = getState().host.hosts[new_host_name].auth_type;            
    let host_name = getState().host.hosts[new_host_name].host;            
    let sql_un = getState().host.hosts[new_host_name].sql_un;      
    let encrypt = getState().host.hosts[new_host_name].encrypt;
          
    //Set a dispatch that resets the metastore list 
    dispatch({type: 'SET_METASTORE_LIST', metastoreList : []});    
    dispatch({type: 'SET_SEARCH_RESULTS', workflowResults : undefined});
    
    getIDToken().then(token=>
        {            
            dispatch(setAlert('Fetching metastores...','warning'))                                    
            axios.defaults.headers.common['Authorization'] =token
            axios.post('/wf_man/getMetastores',{                
                server : host_name,
                auth_type: auth_type,
                encrypt,
                sql_un
                },{
                    cancelToken : new CancelToken(function executor(c){
                        cancellers.cancelGetMetastore = c
                    })
                })
                .then(response=> response.data)
                .then(res=>{
                    //console.log(store.getState())                    
                    if(res.err===1)
                    {                        
                        dispatch(setAlert(res.data.info,'danger'))
                    }
                    else{                        
                        let metastoreList = []            
                        res.data.info.forEach(element => {                            
                            metastoreList.push(element.NAME);
                       });                        
                       dispatch(setAlert(undefined))      
                       dispatch({type: 'SET_METASTORE_LIST', metastoreList});
                    }
                }).catch(function (thrown) {                    
                    if (axios.isCancel(thrown)) {
                        dispatch(setAlert(undefined))
                    } else {
                        dispatch(setAlert(thrown.message,'danger'))
                    }
                  });;

    }).catch(err=>{
       dispatch(setAlert(err,'danger'))
    });      
}

export const setAlert =(msg,color)=>{    
    return (dispatch,getState)=>
    {   
        dispatch({
            type : 'SET_SRCH_ALERT',
            msg,
            color
        });
    }
}