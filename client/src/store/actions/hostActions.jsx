import  firebase from '../../firebase/firebase'
import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
import {getJobStats} from './serverActions'

const CancelToken = axios.CancelToken;
let fire = firebase.firestore().collection('root')
let unsubscribeHost;
let authUser;
export const cancellers = {
    cancelTest : undefined
};

export const clearHostListener = () =>
{
    return(dispatch,getState) =>
    {        
        unsubscribeHost && unsubscribeHost();        
    }
}

export const setHostListener = () =>
{    
    return (dispatch,getState) =>
    {
        authUser = getState().auth.authUser;        
        if(unsubscribeHost) unsubscribeHost();
        unsubscribeHost = fire.doc('users').collection(authUser.uid).doc('hosts').onSnapshot(function(hosts)
        {                  
            if (hosts.exists) 
            {            
                let configured_hosts = hosts.data(); 
                let currentlySelectedHost = getState().search.options.selectedServer;                                 
                let host_list = []
                let host_keys = Object.keys(configured_hosts);
                host_keys.forEach(element => {
                    host_list.push(configured_hosts[element]['host'])
                });
                if(currentlySelectedHost!=='Select server' && host_list.includes(currentlySelectedHost))                                
                {  
                    //If a host whcih is currently selected was removed in this update, we reset the selected Host to Default
                    //Since a host was removed, we also remove the metastore list, which when set to 0,
                    //changes the current selected metastore to default
                    dispatch({
                        type : 'NEW_OPTION_SELECTED',
                        opt_name: 'selectedServer',
                        opt_value :  undefined
                    });
                    //Since host was removed, reset the metastore list
                    dispatch({type: 'SET_METASTORE_LIST', metastoreList : []});    
                }
                for(var key in configured_hosts)
                {
                    configured_hosts[key].sql_pw = undefined
                }
                dispatch({type : 'SET_HOSTS',host_list :configured_hosts})                
                dispatch(getJobStats())
                
            }
            else{
                dispatch({type: 'SET_METASTORE_LIST', metastoreList : []});                                    
            }

            dispatch(loadComplete())                
            
        });    
    }
}



export const loadComplete = () =>
{    
    return (dispatch,getState) =>
    {
       dispatch({type : 'LOAD_COMPLETE'})
    }
}


export const fetchUserTitle = () =>
{    
    return (dispatch,getState) =>
    {
        //Fetch user's title from firebase
        fire.doc('users').collection(authUser.uid).doc('profile').get().then(profile => {
            if (profile.exists) {
                dispatch({type : 'SET_USER_TITLE',title : profile.data().title})
            } else {
                dispatch({type : 'SET_USER_TITLE',title : undefined})
            }            
        })
        .catch(function(error) {
            dispatch({type : 'SET_USER_TITLE',title : undefined})
        });
      
    }
}


export const deleteHost = (host_id) =>
{   
    return (dispatch,getState) =>
    {        
        authUser = getState().auth.authUser;            
        
        dispatch(setAlert('Removing host... ' + host_id+'....','danger'))     
        
        fire.doc("users").collection(authUser.uid).doc('hosts').set({ 
            [host_id]: firebase.firestore.FieldValue.delete()
        }, { merge: true })
        .then(function() {                  
            dispatch(setAlert('Removing monitors for host ' + host_id +'....','danger'))               
            //Firestore keys should not contain DOT [.] operator. So we delete using set function
            
            fire.doc("users").collection(authUser.uid).doc('monitors').set({  
                    [host_id] : firebase.firestore.FieldValue.delete()
                }, { merge: true })
                .then(()=>{                                           
                    dispatch(setAlert('closeModal'))                                                               
                })
        })
        .catch(err=> {
            dispatch(setAlert(err,'danger'))                                           
        });        
       
    }
}
    
export const testHost = (host_details) =>
{    
    return (dispatch,getState) =>
    {           
        getIDToken().then(token=>
            {                
                dispatch(setAlert('Testing connection to server ' + host_details.host +'....','warning'))            
                axios.defaults.headers.common['Authorization'] =token
                axios.post('/wf_man/connectSQL',{                    
                    server : host_details.host,
                    auth_type : host_details.auth_type,
                    sql_un : host_details.sql_un,
                    sql_pw : host_details.sql_pw, 
                    },{
                        cancelToken : new CancelToken(function executor(c){
                            cancellers.cancelTest = c
                        })
                    })
                    .then(response=> response.data)
                    .then(res=>{
                        if(res.err===1)
                        {
                            dispatch(setAlert(res.data.info,'danger'))
                        }
                        else{                                                         
                            dispatch(saveHost(host_details))
                        }
                    }).catch(function (thrown) {
                        if (axios.isCancel(thrown)) {
                            
                        } else {
                            dispatch(setAlert(thrown.message,'danger'))
                        }
                      });;

        }).catch(err=>{
            dispatch(setAlert(err,'danger'))
        });       
    }
}


export const saveHost = (host_details) =>
{    
    return (dispatch,getState) =>
    {           
       
        getIDToken().then(token=>
            {            
                dispatch(setAlert('Saving Host. Please Wait...','info'));
                axios.defaults.headers.common['Authorization'] =token
                axios.post('/wf_man/saveHost',{                
                    host_details : 
                            {     
                                host: host_details.host,
                                nickname : host_details.nickname,
                                server_type: host_details.server_type,
                                auth_type: host_details.auth_type ,
                                sql_un : host_details.sql_un,
                                sql_pw : host_details.sql_pw, 
                            }
                    },{
                        cancelToken : new CancelToken(function executor(c){
                            cancellers.cancelTest = c
                        })
                    })
                    .then(response=> response.data)
                    .then(res=>{

                        if(res.err===1)
                        {                        
                            dispatch(setAlert(res.data  ,'danger'))
                        }
                        else
                        {
                            dispatch(setAlert('closeModal'))
                        }

                    }).catch(function (thrown) {                    
                        if (axios.isCancel(thrown)) {
                            dispatch(setAlert(undefined))
                        }
                        else
                        {
                            dispatch(setAlert(thrown.message,'danger'))
                        }

                    });;

        }).catch(err=>{
        dispatch(setAlert(err,'danger'))
        });  

    }
}


export const setAlert =(msg,color)=>{    
    return (dispatch,getState)=>
    {   
        dispatch({
            type : 'SET_HOST_ALERT',
            msg,
            color
        });
    }
}