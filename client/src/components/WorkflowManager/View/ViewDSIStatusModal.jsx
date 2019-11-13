import React, { useState, memo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaRegListAlt } from 'react-icons/fa'

import ViewDSIStatusTable from './ViewDSIStatusTable';
function ViewDSIStatusModal(props) {
    
    const [show, setShow] = useState(false);        
    
    const [vwDSI, setVwDSI] = useState({      
      actionInProgress : false,      
      viewDSI : [],
      actionAlert : {          
        msg : 'Fetching DSIs, please wait...',
        color : 'warning'
    }
    });   

    
    const handleClose = () => {                  
        setVwDSI({
            ...vwDSI,
            viewDSI : [],
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
        fetchDSIs()                
    }

    const modifyInstanceStatus = (isAllSelected,toStatus,selectedDSIs)=>
    {
        console.log(isAllSelected)
        console.log(selectedDSIs)
        console.log(toStatus)
    }
   
    const fetchDSIs=()=>
    {
        setVwDSI({
            ...vwDSI,
            actionInProgress : true,
            actionAlert : {
                msg : 'Fetching DSIs, please wait...',
                color : 'warning'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.get('/wf_man/wf/getDatasetInstances',{                    
                    params : {
                        server : wf_details.server,
                        auth_type : wf_details.auth,
                        sql_un : wf_details.sql_un,
                        db : wf_details.metastore, 
                        schema:'dbo', 
                        dataset_id : props.selected_row.DATASET_ID
                    }                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setVwDSI({
                            ...vwDSI,
                            viewDSI : [],
                            actionInProgress : false,
                            actionAlert : {
                                msg : resp.data.info,
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {                       
                        setVwDSI({
                            ...vwDSI,
                            viewDSI : resp.data.info,
                            actionInProgress : false,
                            actionAlert : {                                
                                msg : '',
                                color : ''
                            }
                        })
                    }
                    
                }).catch(err =>
                {
                    setVwDSI({
                        ...vwDSI,
                        viewDSI : [],
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
        if(vwDSI.actionAlert.msg!=='')
        {
           myAlert =  (
                <Alert style={{wordBreak:'break-all'}}  variant={vwDSI.actionAlert.color}>{vwDSI.actionAlert.msg}</Alert>                       
            )
        }       
        return (
            <div>                                
                <Button size='sm' variant='primary' onClick={handleShow}>                                        
                            <FaRegListAlt className='mb-1'/>
                            <span style={{whiteSpace : 'pre'}}>  View Instances</span>                    
                </Button>         
                <Modal size='lg' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Instances for {props.selected_row.TYPE} Dataset</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}       
                        <ViewDSIStatusTable wf_details={props.wf_details} inProgress={vwDSI.actionInProgress} data={vwDSI.viewDSI} modifyStatusCallback={modifyInstanceStatus} />
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                                            
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(ViewDSIStatusModal)
