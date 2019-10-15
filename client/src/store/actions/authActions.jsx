import  firebase from '../../firebase/firebase'
import axios from 'axios'

function disp_LOGIN_MSG (msg,color,dispatch) 
{    
    dispatch({
        type : 'LOGIN_MSG',                
        alert : {
                msg,
                color
            },
        });    
}

function loginWithToken(custom_token,dispatch)
{       
    firebase.auth().signInWithCustomToken(custom_token)
    .then(function()                    
    {           
        disp_LOGIN_MSG('Logging in...','info',dispatch);            
        //User has signed in using custom token,
        //Now, we set up a listener that listens for user's sign in state.        
        dispatch(performLoginWithUser())
        
    }).catch(err=>{
        
        disp_LOGIN_MSG(err.message,'danger',dispatch);            
    });    
}

export const performLoginWithUser =()=>
{    
    return ( dispatch,getState)=> {        
        firebase.auth().onAuthStateChanged(user => 
        {       
            if (user) {                                         
                //Save the user to the redux store                
                dispatch({
                    type : 'UPDATE_AUTH_STATE',                
                    authUser : user
                    });    
            }         
            else{                   
                dispatch(performLogOut());
            }
        });

    }   
}
export const performLoginWithCreds = (login_creds) =>
{
    return (dispatch,getState) => {     
        
        disp_LOGIN_MSG('Authenticating...','warning',dispatch);        
        axios.post('/users/performLogin',
        {            
            username : login_creds.username,
            password : login_creds.password,            
        })        
        .then(response=> {
            let res = response.data;                
            if(res.err===0)
            {
                //Authentication successful. User recieves the token.
                //Store it away for login                                
                let custom_token = res.data.token
                //storeToken(custom_token);
                loginWithToken(custom_token,dispatch);
                
            }
            else{
                disp_LOGIN_MSG(res.data.info,'danger',dispatch);                     
            }
        }).catch(error =>
        {
            disp_LOGIN_MSG(error,'danger',dispatch);                     
        });
    }
}

export const performLogOut =()=>
{    
    return ( dispatch,getState)=> {
        //Destory the authToken in localStorage
        //window.localStorage.clear("authToken");        
        firebase.auth().signOut().then(function()
        {   
            dispatch({ type : 'LOG_OUT'});    
        }).catch(function() {                    
            dispatch({ type : 'LOG_OUT'});    
        });
    }   
}