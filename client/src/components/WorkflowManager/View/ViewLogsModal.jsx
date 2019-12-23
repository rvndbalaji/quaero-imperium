import React, { useState, memo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaRegListAlt } from 'react-icons/fa'

import ErrorLogTable from './ErrorLogTable';
function ViewLogsModal(props) {
    
    const [show, setShow] = useState(false);        
    
    const [vwLogs, setVwLogs] = useState({      
      actionInProgress : false,      
      viewLogs : [],
      actionAlert : {          
        msg : '',
        color : ''
    }
    });   

    
    const handleClose = () => {                  
        setVwLogs({
            ...vwLogs,
            viewLogs : [],
            actionInProgress : false,
            actionAlert : {
                msg : '',
                color : ''
            }
        })
        setShow(false);        
    }
    const handleShow = () => 
    {   
        setShow(true);
        //Fetch the logs immediately after modal is shown
        fetchLogs()                
    }

   
    const fetchLogs=()=>
    {
        setVwLogs({
            ...vwLogs,
            actionInProgress : true,
            actionAlert : {
                msg : 'Fetching logs, please wait...',
                color : 'warning'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.get('/wf_man/wf/error_log',{                    
                    params : {
                        server : wf_details.server,
                        auth_type : wf_details.auth,
                        sql_un : wf_details.sql_un,
                        db : wf_details.metastore, 
                        encrypt : wf_details.encrypt,
                        schema:'dbo', 
                        event_group_id : props.selected_row.EVENT_GROUP_ID
                    }                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setVwLogs({
                            ...vwLogs,
                            viewLogs : [],
                            actionInProgress : false,
                            actionAlert : {
                                msg : resp.data.info,
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {                       
                        setVwLogs({
                            ...vwLogs,
                            viewLogs : resp.data.info,
                            actionInProgress : false,
                            actionAlert : {                                
                                msg : '',
                                color : ''
                            }
                        })
                    }
                    
                }).catch(err =>
                {
                    setVwLogs({
                        ...vwLogs,
                        viewLogs : [],
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
        if(vwLogs.actionAlert.msg!=='')
        {
           myAlert =  (
                <Alert style={{wordBreak:'break-all'}}  variant={vwLogs.actionAlert.color}>{vwLogs.actionAlert.msg}</Alert>                       
            )
        }       
        return (
            <div>                                
                <Button  size='sm' variant='primary'  onClick={handleShow} >                                        
                        <FaRegListAlt className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  View Logs</span>                    
                    </Button>        
                <Modal size='lg' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Error Logs for {props.selected_row.EVENT_GROUP_ID}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}       
                        <ErrorLogTable inProgress={vwLogs.actionInProgress} data={vwLogs.viewLogs} refreshCallback={()=>fetchLogs} />
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                                            
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(ViewLogsModal)
