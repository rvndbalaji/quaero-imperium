const initState = {
    hosts : undefined,
    alertHost : undefined,
    isLoading : true
}

const hostReducer = (state = initState,action) =>
{    
   switch(action.type)
   {       
       case 'SET_HOSTS' :            
            return {
                ...state,                
                hosts : action.host_list                
            }  
        case 'SET_HOST_ALERT' :
            if(!action.msg)
            {
                return {
                    ...state,
                    alertHost : undefined
                }
            }
             if(action.msg==='closeModal')
            {
                return {
                    ...state,
                    alertHost : 'closeModal'
                }
            }
            return{
                ...state,
                alertHost : {
                    msg : action.msg,
                    color : action.color
                }
            }
        case 'LOAD_COMPLETE' :
            return{
                ...state,
                isLoading : false
            }
            
       default : return state;
   }   
}
export default hostReducer;