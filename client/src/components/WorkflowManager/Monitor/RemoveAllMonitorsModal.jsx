import React, { useState, memo } from 'react'
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { useDispatch } from 'react-redux'
import Button from 'react-bootstrap/Button';
import {  FaBroom } from 'react-icons/fa'
import { clearAllMonitors } from '../../../store/actions/monitorActions';
function RemoveAllMonitorsModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();
    const [actionStatus, setActionStatus] = useState({      
      actionInProgress : false,
      actionAlert : {
          msg : 'Do you wish to unmonitor all the workflows?',
          color : 'danger'
      }
    });   
  
    const handleClose = () => {                  
        setActionStatus({
            ...actionStatus,
            actionInProgress : false,
            actionAlert : {
                msg : 'Do you wish to unmonitor all the workflows?',
                color : 'danger'
            }
        })
        setShow(false);        
    }
    const handleShow = () => 
    {   
        setShow(true);
    }

    
    const RemoveMonitors=()=>
    {       
        dispatch(clearAllMonitors())        
    }
    
        let myAlert = ''
        if(actionStatus.actionAlert.msg!=='')
        {
           myAlert =  (            
                <Alert  style={{wordBreak:'break-all'}} variant={actionStatus.actionAlert.color}>{actionStatus.actionAlert.msg}</Alert>                       
            )
        }       
        return (
            <div>                
                <Button size='sm' variant='primary' onClick={handleShow}>                                        
                            <FaBroom className='mb-1'/>
                            <span style={{whiteSpace : 'pre'}}>  Unmonitor all</span>                    
                </Button>          
                <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Unmonitor All</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}               
                        This action will clear all the workflows being monitored on this screen. This has no effect on the actual workflows.
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>RemoveMonitors()} disabled={actionStatus.actionInProgress}>{(actionStatus.actionInProgress)?'Removing...':'Unmonitor all'}</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(RemoveAllMonitorsModal)
