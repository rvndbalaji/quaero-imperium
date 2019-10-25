import React, { useState, memo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaCog } from 'react-icons/fa'
import PrecompileTable from './PrecompileTable';
function PrecompileModal(props) {
    
    const [show, setShow] = useState(false);        
    
    const [precompile, setPrecompile] = useState({      
      actionInProgress : false,      
      viewPrecompile : [],
      actionAlert : {          
        msg : '',
        color : ''
    }
    });   

    
    const handleClose = () => {                  
        setPrecompile({
            ...precompile,
            viewPrecompile : [],
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
        fetchPrecompile()                
    }

   
    const fetchPrecompile=()=>
    {
        setPrecompile({
            ...precompile,
            actionInProgress : true,
            actionAlert : {
                msg : 'Generating precompile, please wait...',
                color : 'warning'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                
                axios.defaults.headers.common['Authorization'] = token
                axios.get('/wf_man/wf/precompile',{                    
                    params : {
                        server : wf_details.server,
                        auth_type : wf_details.auth,
                        db : wf_details.metastore, 
                        schema:'dbo', 
                        workflow_instance_id : props.selected_row.WORKFLOW_INSTANCE_ID
                    }                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setPrecompile({
                            ...precompile,
                            viewPrecompile : [],
                            actionInProgress : false,
                            actionAlert : {
                                msg : resp.data.info,
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {                       
                        setPrecompile({
                            ...precompile,
                            viewPrecompile : resp.data.info,
                            actionInProgress : false,
                            actionAlert : {                                
                                msg : '',
                                color : ''
                            }
                        })
                    }
                    
                }).catch(err =>
                {
                    setPrecompile({
                        ...precompile,
                        viewPrecompile : [],
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
        if(precompile.actionAlert.msg!=='')
        {
           myAlert =  (
                <Alert style={{wordBreak:'break-all'}} variant={precompile.actionAlert.color}>{precompile.actionAlert.msg}</Alert>                       
            )
        }       
        return (
            <div>                                
                <Button  size='sm' variant='primary'  onClick={handleShow} >                                        
                        <FaCog className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Precompile</span>                    
                    </Button>        
                <Modal size='lg' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Precompile for instance {props.selected_row.WORKFLOW_INSTANCE_ID}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}       
                        <PrecompileTable inProgress={precompile.actionInProgress} data={precompile.viewPrecompile} refreshCallback={()=>fetchPrecompile} />
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                                            
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(PrecompileModal)
