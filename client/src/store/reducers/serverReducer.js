const initState = {
    serverJobs : {},
    serverMemory : {}
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
        case 'SET_SERVER_MEM_USAGE' :              
        return {
            ...state,                
            serverMemory : {
                ...state.serverMemory,
                [action.serverName] : action.serverMemory
            }
        }     
            
       default : return state;
   }      
}
export default hostReducer;