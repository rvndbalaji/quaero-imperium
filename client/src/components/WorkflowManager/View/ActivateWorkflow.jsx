import React, { useState , useEffect, memo } from 'react'
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
function ActivateWorkflow(props) {        
    const [btn, setButton] = useState({
        performingAction : false        
    });     

    useEffect(() => {
        setButton({
            performingAction : false
        })
    }, [props])
   
    const activateDeactivateWorkflow=(active_state)=>
    {    
        setButton({                        
            performingAction : true        
        })
        let wf_details = props.wf_details;        
        getIDToken().then(token=>
        {
            axios.defaults.headers.common['Authorization'] = token
            axios.post('/wf_man/wf/act_deact',{                    
                server : wf_details.server,
                auth_type: wf_details.auth,
                sql_un : wf_details.sql_un,
                db : wf_details.metastore,
                schema:'dbo', 
                workflow_id : wf_details.wf_id,
                act_flag : active_state,
                encrypt : wf_details.encrypt
            }).then(res =>{                                
                props.postDispatchMethod();      
                //setButton({                                
                    //performingAction : false,                                        
                //})                   
            });                 
        });   
    }    
    let ActDeactButton ='';        

    if(props.act_flag)
    {                   
       ActDeactButton = (
            <Button variant='danger' disabled={props.disabled || btn.performingAction}  onClick={(e)=>activateDeactivateWorkflow(false)}>
                Deactivate Workflow
            </Button>
        );     
    }
    else
    {
        ActDeactButton = (
            <Button  variant='success' disabled={props.disabled || btn.performingAction} onClick={(e)=>activateDeactivateWorkflow(true)}>
                Activate Workflow
            </Button>
        );                   
    }            
    return (
        <div>
            {ActDeactButton}
        </div>
    )
}
export default memo(ActivateWorkflow)