import React, { useState, memo } from 'react'
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import { useDispatch } from 'react-redux'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaPen } from 'react-icons/fa'
import { setViewMonitor } from '../../../store/actions/viewActions';
function ModifyStatusModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();
    const [wfStatus, setWFStatus] = useState({
      selected_status : 'FAILED',
      actionInProgress : false,
      actionAlert : {
          msg : 'WARNING : You are about to perform a dangerous action',
          color : 'danger'
      }
    });   
  
    const handleClose = () => {                  
        setWFStatus({
            ...wfStatus,
            actionInProgress : false,
            actionAlert : {
                msg : 'WARNING : You are about to perform a dangerous action',
                color : 'danger'
            }
        })
        setShow(false);        
    }
    const handleShow = () => 
    {   
        setShow(true);
    }

    const handleChange = (e) =>
    {                
        setWFStatus({            
            ...wfStatus,
            selected_status : e.target.id
        });             
    }
    
    
    const setNewStatus=()=>
    {
        setWFStatus({
            ...wfStatus,
            actionInProgress : true,
            actionAlert : {
                msg : 'Modifying status...',
                color : 'info'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/modifyStatus',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    workflow_instance_id : props.selected_row.WORKFLOW_INSTANCE_ID, 
                    workflow_status : wfStatus.selected_status
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setWFStatus({
                            ...wfStatus,
                            actionInProgress : false,
                            actionAlert : {
                                msg : resp.data.info,
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {                       
                        dispatch(setViewMonitor(wf_details));
                        handleClose();    
                    }
                    
                }).catch(err =>
                {
                    setWFStatus({
                        ...wfStatus,
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
        if(wfStatus.actionAlert.msg!=='')
        {
           myAlert =  (            
                <Alert  style={{wordBreak:'break-all'}} variant={wfStatus.actionAlert.color}>{wfStatus.actionAlert.msg}</Alert>                       
            )
        }       
        return (
            <div>                
                <Button size='sm' variant='info' onClick={handleShow} >                                        
                        <FaPen className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Modify Status</span>                    
                </Button>         
                <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Modify Instance Status</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}
                        Modify status of <b>{props.selected_row.WORKFLOW_INSTANCE_ID}</b> to <br/><br/>
                        <Form.Group  controlId="statusRadio">                            
                            <Form.Check type="radio" custom name='status_type' onChange={(e)=>handleChange(e)}  label="FAILED"   id="FAILED" checked={wfStatus.selected_status==='FAILED'}/>
                            <Form.Check type="radio" custom name='status_type' onChange={(e)=>handleChange(e)}  label="COMPLETE" id="COMPLETE"   checked={wfStatus.selected_status==='COMPLETE'} />
                            <Form.Check type="radio" custom name='status_type' onChange={(e)=>handleChange(e)}  label="COMPLETE-PENDINGCLEANUP" id="COMPLETE-PENDINGCLEANUP"   checked={wfStatus.selected_status==='COMPLETE-PENDINGCLEANUP'} />
                        </Form.Group>  
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>setNewStatus()} disabled={wfStatus.actionInProgress}>{(wfStatus.actionInProgress)?'Modifying...':'Modify Status'}</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(ModifyStatusModal)
