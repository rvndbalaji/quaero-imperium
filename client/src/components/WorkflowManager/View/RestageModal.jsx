import React, { useState, memo } from 'react'
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import { useDispatch } from 'react-redux'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaUndoAlt } from 'react-icons/fa'
import { setViewMonitor } from '../../../store/actions/viewActions';
function RestageModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();
    const [restage, setRestage] = useState({      
      actionInProgress : false,
      actionAlert : {
          msg : 'WARNING : You are about to perform a dangerous action',
          color : 'danger'
      }
    });   
  
    const handleClose = () => {                  
        setRestage({
            ...restage,
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

    
    const setNewStatus=()=>
    {
        setRestage({
            ...restage,
            actionInProgress : true,
            actionAlert : {
                msg : 'Removing tracking information...',
                color : 'info'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/restage',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    sql_un : wf_details.sql_un,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    ftp_id : props.selected_row.FTP_ID                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setRestage({
                            ...restage,
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
                    setRestage({
                        ...restage,
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
        if(restage.actionAlert.msg!=='')
        {
           myAlert =  (            
                <Alert  style={{wordBreak:'break-all'}} variant={restage.actionAlert.color}>{restage.actionAlert.msg}</Alert>                       
            )
        }               
        return (
            <div>                
                <Button size='sm' variant='primary' onClick={handleShow} >                                        
                        <FaUndoAlt className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Re-stage File</span>                    
                </Button>    
                
                <Modal size='md' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Re-stage File</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                {myAlert}
                                Restaging removes file tracking information, downloads the file and ingests it again. 
                                This may cause duplication of data in the staging table<br />
                                Are you sure you wish to re-stage the file?<br />
                                <b>{props.selected_row.FILE_NM}</b>
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>setNewStatus()} disabled={restage.actionInProgress}>{(restage.actionInProgress)?'Restaging......':'Restage File'}</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(RestageModal)
