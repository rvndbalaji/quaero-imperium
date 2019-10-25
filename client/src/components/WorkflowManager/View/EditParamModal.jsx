import React, { useState, memo, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaPen } from 'react-icons/fa'
import DisplayEditableColumns from './DisplayEditableColumns';
import { useDispatch } from 'react-redux'
import { setViewMonitor, setSelectedRow,clearViewRefresh } from '../../../store/actions/viewActions';
function EditParamModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();

    const [editVal, setEditVal] = useState({      
      actionInProgress : false,            
      actionAlert : {          
            msg : '',
            color : ''
        },
        PARAM_NAME : undefined,
        PARAM_VALUE : undefined,
    });   

    useEffect(() => {        
        setEditVal({
            actionInProgress : false,            
            actionAlert : {          
                  msg : '', 
                  color : ''
              },
              PARAM_NAME : props.selected_row.PARAM_NAME,
              PARAM_VALUE : props.selected_row.PARAM_VALUE,
        })
      }, [props])
    
    const handleClose = () => {                  
        setEditVal({
            ...editVal,            
            actionInProgress : false,
            actionAlert : {
                msg : '',
                color : ''
            }
        })
        dispatch(setViewMonitor(props.wf_details));        
        setShow(false);        
    }
    const handleShow = () => 
    {   
        dispatch(clearViewRefresh())        
        setShow(true);
        //Generate the edit view                
    }   

    const setParamState = (key,value)=>
    {        
        setEditVal({
            ...editVal,
            [key] : value
        })
    }
    const updateParam =()=>
    {   
        setEditVal({
            ...editVal,            
            actionInProgress : true,
            actionAlert : {
                msg : 'Updating workflow parameters...',
                color : 'info'
            }
        });        
        getIDToken().then(token=>
            {                
                let wf_details = props.wf_details            
                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/setWorkflowParams',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    workflow_package_param_id : props.selected_row.WORKFLOW_PACKAGE_PARAM_ID, 
                    workflow_param_name : editVal.PARAM_NAME,
                    workflow_param_value : editVal.PARAM_VALUE
                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setEditVal({
                            ...editVal,
                            actionInProgress : false,
                            actionAlert : {
                                msg : resp.data.info,
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {                                               
                        dispatch(setSelectedRow('selectedParam',undefined))                        
                        dispatch(setViewMonitor(wf_details));                                                                                                
                    }
                    
                }).catch(err =>
                {
                    setEditVal({
                        ...editVal,
                        actionInProgress : false,
                        actionAlert : {
                            msg : err.toString(),
                            color : 'danger'
                        }
                    })
                });             
            });   
    }

        let myAlert = ''
        if(editVal.actionAlert.msg!=='')
        {
           myAlert =  (
                <Alert style={{wordBreak:'break-all'}}  variant={editVal.actionAlert.color}>{editVal.actionAlert.msg}</Alert>                       
            )
        }         
        
        return (
            <div>                                
                <Button size='sm' variant='primary' onClick={()=>{handleShow()}}>                                        
                        <FaPen className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Edit Param</span>                    
                </Button>      
                <Modal size='lg' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Parameter</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}       
                        <DisplayEditableColumns keyValueCallback={setParamState} selected_row={props.selected_row} excluded_rows={['WORKFLOW_PACKAGE_PARAM_ID','WORKFLOW_PACKAGE_NAME','WORKFLOW_PACKAGE_DESC']} />
                        </Modal.Body>

                        <Modal.Footer>                                                        
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                                            
                            <Button variant='primary' onClick={updateParam} disabled={editVal.actionInProgress}>{(editVal.actionInProgress)?'Updating...':'Update'}</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(EditParamModal)
