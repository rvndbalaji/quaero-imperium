const initState = {        
    latestInstance : undefined,    
    allInstances : undefined,
    entityResult : undefined,    
    stageInfo : undefined,
    sourceSystems : undefined,
    datasets : undefined,
    workflowParams : undefined,
    dispatchWindow : undefined,
    blockinfo : undefined,
    refreshInterval : 60,
    viewRefreshProgress : 0,
    alertView : undefined,
    loadComplete : false,
    selectedViewInstance : undefined,
    selectedStageInfo : undefined,
    selectedDataset : undefined,
    selectedEntity : undefined,
    selectedSystem : undefined,
    selectedParam : undefined,
    selectedWindow : undefined,
    failedStageCount : 0
}

const viewReducer = (state = initState,action) =>
{    
    
   switch(action.type)
   {  
        case 'SET_PROGRESS_BAR':                  
        return {
            ...state,
            viewRefreshProgress : action.pbar,     
        }    

        case 'SET_LOAD_STATUS':          
        
        return {
            ...state,
            loadComplete : action.loadComplete,     
        }    

        case 'SET_FAILED_STAGE_COUNT':
            return {
                ...state,
                failedStageCount : action.failed_count
            }


        case 'SET_MASTER_WORKFLOW_DETAILS' :         
        
        return {
            ...state,
            allInstances : action.allInstances,  
            latestInstance : (action.allInstances)? [action.allInstances[0]] : undefined,
            entityResult : action.entityResult,
            sourceSystems : action.sourceSystems,
            datasets : action.datasets,
            stageInfo : action.stageInfo,
            workflowParams : action.params, 
            dispatchWindow : action.window           
        }

        case 'SET_WF_BLOCK_INFO' :                 
            return {
                ...state,           
                blockinfo : action.blockinfo
            }

        case 'SET_REFRESH_INTERVAL':          
            return {
                ...state,
                refreshInterval : action.interval
            }   

        
        case 'SET_SELECTED_ROW':                  
        return {
            ...state,         
                [action.tbl_name] : action.sel_value             
            }    
        
    case 'SET_VIEW_ALERT' :
            
        if(!action.msg)
        {
            return {
                ...state,
                alertView : undefined
            }
        }           
        return{
            ...state,
            alertView : {
                msg : action.msg,
                color : action.color
            }
        }
        
    default : return state  
   }   
}
export default viewReducer;