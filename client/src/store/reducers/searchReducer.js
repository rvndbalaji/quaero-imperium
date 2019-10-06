const initState = {    
    alertSearch : undefined,      
    metastoreList : undefined,
    workflowResults : undefined,
    timeTaken : undefined,
    options : {        
        selectedServer : 'Select server',
        selectedMetastore : 'Select metastore',
        selectedWorkflowColumn : 'WORKFLOW_NAME',
        selectedSearchText : '',        
        selectedSortColumn : 'WORKFLOW_ID',
        selectedSortOrder : 'desc'        
    }
}

const searchReducer = (state = initState,action) =>
{    
    
   switch(action.type)
   {  
    case 'SET_SEARCH_RESULTS':          
    return {
        ...state,
        workflowResults : action.workflowResults,   
        timeTaken : action.timeTaken   
    }      

    case 'SET_METASTORE_LIST':      
        let cur_metastore = state.options.selectedMetastore;       
        if(action.metastoreList.length<1)        
        {            
            //If list is empty set selected metastore to default
            cur_metastore = initState.options.selectedMetastore           
        }
        return {
            ...state,
            metastoreList : action.metastoreList,
            options : {
                ...state.options,
                selectedMetastore : cur_metastore
            }
        }      

    case 'SET_SRCH_ALERT' :
            if(!action.msg)
            {
                return {
                    ...state,
                    alertSearch : undefined
                }
            }           
            return{
                ...state,
                alertSearch : {
                    msg : action.msg,
                    color : action.color
                }
            }
            
       case 'NEW_OPTION_SELECTED':        
           //If an item currently selected was removed after update, we set the drop down to default
           //An undefined value for an option means it was removed           
           if(!action.opt_value)           
           {               
               return {
                   ...state,
                   options : {
                       ...state.options,
                       [action.opt_name] : initState.options[action.opt_name]
                   }
               }
           }           
           return {
                ...state,
                options :{
                    ...state.options,
                    [action.opt_name] : action.opt_value
                }
           }            
       default : return state;
   }   
}
export default searchReducer;