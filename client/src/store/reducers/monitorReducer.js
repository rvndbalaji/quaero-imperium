const initState = {        
    monitorResults : undefined,
    registeredMonitors : undefined,
    refreshInterval : 60,
    progressVisible : false
}

const monitorReducer = (state = initState,action) =>
{    
    
   switch(action.type)
   {  
        case 'SET_PROGRESS_BAR':          
        return {
            ...state,
            progressVisible : action.pbar,     
        }    

        case 'SET_MONITOR_RESULTS':          
        return {
            ...state,
            monitorResults : action.monitorResults,                
        }      

        case 'SET_REGISTERED_MONITORS_LIST':                            
            return {
                ...state,
                registeredMonitors : action.registeredMonitors           
            }    

        case 'SET_REFRESH_INTERVAL':          
            return {
                ...state,
                refreshInterval : action.interval
            }   
    default : return state  
   }   
}
export default monitorReducer;