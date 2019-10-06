
const initState = {            
    alertAuth : undefined,    
    authUser : undefined,
    tryLogin : true
}

const authReducer = (state = initState,action) =>
{
   switch(action.type)
   {
       case 'LOGIN_MSG' :                  
            return {              
                ...state,
                alertAuth : action.alert                             
            }   
        case 'LOG_OUT':
            return{                
                tryLogin : false                
            }
        case 'UPDATE_AUTH_STATE' :
            return{
                ...state,
                authUser : action.authUser
            }
       default : return state;
   }   
}
export default authReducer;