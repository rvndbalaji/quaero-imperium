const initState = {
    serverJobs : {}
}

const hostReducer = (state = initState,action) =>
{    
   switch(action.type)
   {       
       case 'SET_SERVER_JOBS' :            
            return {
                ...state,                
                serverJobs : {
                    ...state.serverJobs,
                    [action.serverName] : action.serverJobs
                }
            }         
            
       default : return state;
   }   
}
export default hostReducer;