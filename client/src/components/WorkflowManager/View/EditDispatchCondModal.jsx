import React, { useState, memo } from 'react'
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import { useDispatch } from 'react-redux'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaEdit } from 'react-icons/fa'
import { setViewMonitor } from '../../../store/actions/viewActions';
import Form from 'react-bootstrap/Form';

function EditDispatchCondModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();
    const [disp_cond, setDispCond] = useState({      
      actionInProgress : false,
      actionAlert : {
          msg : 'Enter the new dispatch condition',
          color : 'primary'
      },
      dispatch_condition_text :  React.createRef()
    });   

    const handleClose = () => {                  
        setDispCond({
            ...disp_cond,            
            actionInProgress : false,
            actionAlert : {
                msg : 'Enter the new dispatch condition',
                color : 'primary'
            }
        })
        setShow(false);        
    }
    const handleShow = () => 
    {   
        setShow(true);
    }
 
    
    const setDispatchCondition=()=>
    {
       let val = (disp_cond.dispatch_condition_text && disp_cond.dispatch_condition_text.current)?disp_cond.dispatch_condition_text.current.value:undefined
       if(!val || val.trim()==='')
       {
           val = undefined;
       }       
        setDispCond({
            ...disp_cond,
            actionInProgress : true,
            actionAlert : {
                msg : 'Updating Dispatch Condition...',
                color : 'info'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details;                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/setDispCond',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    dispatch_condition : val,
                    workflow_id : wf_details.wf_id

                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setDispCond({
                            ...disp_cond,
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
                    setDispCond({
                        ...disp_cond,
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
        if(disp_cond.actionAlert.msg!=='')
        {
           myAlert =  (            
                <Alert variant={disp_cond.actionAlert.color}>{disp_cond.actionAlert.msg}</Alert>                       
            )
        }         
        
        return (
            
            <div>                
                <Button size='sm' variant='primary' onClick={handleShow} >
                    <FaEdit className='mb-1' size='1rem'/>
                    <span style={{whiteSpace : 'pre'}}> Update</span>                    
                </Button>         
                
                <Modal size='md' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Update Dispatch Condition</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                {myAlert}
                                <Form.Group className='mt-2'>
                                            <Form.Control style={{fontFamily:'monospace'}} required as="textarea" rows='5' ref={disp_cond.dispatch_condition_text} name='disp_cond' defaultValue={props.wf_result && props.wf_result[0].DISPATCH_CONDITION}  placeholder="No Dispatch Condition (NULL)"/>                                                                                                
                                </Form.Group>                                   
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>setDispatchCondition()} disabled={disp_cond.actionInProgress}>{(disp_cond.actionInProgress)?'Updating...':'Update'}</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(EditDispatchCondModal)
