import React, { useState, memo } from 'react'
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaPlay } from 'react-icons/fa'
import { setViewMonitor} from '../../../store/actions/viewActions';

function ScanNowModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();
    const [actionStatus, setActionStatus] = useState({      
      actionInProgress : false,
      actionAlert : {
          msg : 'WARNING : You are about to perform a dangerous action',
          color : 'danger'
      }
    });   
  
    const handleClose = () => {                  
        setActionStatus({
            ...actionStatus,
            actionInProgress : false,
            actionAlert : {
                msg : 'WARNING : You are about to perform a dangerous action',
                color : 'danger'
            }
        })
        setShow(false)
    }

    const performScan =()=>
    {
        setActionStatus({
            ...actionStatus,
            actionInProgress : true,
            actionAlert : {
                msg : 'Initiating source system scan...',
                color : 'info'
            }
        })
        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/performSystemScan',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    source_system_id : props.selected_row.ID
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setActionStatus({
                            ...actionStatus,
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
                    setActionStatus({
                        ...actionStatus,
                        actionInProgress : false,
                        actionAlert : {
                            msg : err.toString(),
                            color : 'danger'
                        }
                    })
                });             
            });   
    }

    const handleShow = () => 
    {   
        setShow(true);
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
                    <FaPlay className='mb-1'/>
                    <span style={{whiteSpace : 'pre'}}>  Scan Now</span>                    
                </Button>
                <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Scan Source System</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}               
                        This action will force the source system to begin scanning immediately, provided a scan is not already in progress <br/>                        
                        <b>Do you wish to proceed?</b><br /><br />
                        <span className='gray_text'>NOTE : This action will not be effective if the scanner was stuck, stopped or failed</span>
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>performScan()} disabled={actionStatus.actionInProgress}>Scan Now</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(ScanNowModal)
