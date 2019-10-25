import React, { useState, memo } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaTerminal } from 'react-icons/fa'
import Row from 'react-bootstrap/Row';

function EvaluateDispatchCondition(props) {
    
    const [show, setShow] = useState(false);        
    
    const [evalDisp, setEvalDisp] = useState({      
      actionInProgress : false,      
      viewDSI : [],
      actionAlert : {          
        msg : '',
        color : ''
    }
    });   

    
    const handleClose = () => {                  
        setEvalDisp({
            ...evalDisp,
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
        evalDispatch()                
    }

   
    const evalDispatch=()=>
    {
        setEvalDisp({
            ...evalDisp,
            actionInProgress : true,
            actionAlert : {
                msg : 'Evaluating dispatch condition, please wait...',
                color : 'warning'
            }
        })

        getIDToken().then(token=>
            {
                
                let wf_details = props.wf_details                       
                axios.defaults.headers.common['Authorization'] = token
                axios.get('/wf_man/wf/evalDispCond',{                    
                    params : {
                        server : wf_details.server,
                        auth_type : wf_details.auth,
                        db : wf_details.metastore, 
                        schema:'dbo', 
                        workflow_id : wf_details.wf_id
                    }                    
                }).then(res =>{
                    let resp = res.data
                    if(resp.err===1)
                    {   
                        setEvalDisp({
                            ...evalDisp,
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
                        setEvalDisp({
                            ...evalDisp,
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
                    setEvalDisp({
                        ...evalDisp,
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
        if(evalDisp.actionAlert.msg!=='')
        {
           myAlert =  (
                <Alert style={{wordBreak:'break-all'}} variant={evalDisp.actionAlert.color}>{evalDisp.actionAlert.msg}</Alert>                       
            )
        }       

        let DSI_DISPLAY = ''
        let KEY=''
        if(evalDisp.viewDSI && evalDisp.viewDSI.length!==0)
        {            
            DSI_DISPLAY = evalDisp.viewDSI.map((dsi,index)=>{                                
                KEY = Object.keys(dsi)[0]                
                return (                
                <Row key={index} className='p-2 m-2'>
                    <span>{dsi[KEY]}</span>
                </Row>                
            )});
        }
        else if(evalDisp.viewDSI.length===0 && !evalDisp.actionInProgress)
        {
            DSI_DISPLAY = 'No Dataset Instances'
        }
        DSI_DISPLAY = (
            <div>
                <span className='font-weight-bold'>{KEY}</span>
                {DSI_DISPLAY}
            </div>
        )

        return (
            <div>                                
                <Button size='sm' variant='primary' onClick={handleShow}>
                    <FaTerminal className='mb-1' size='1rem'/>
                    <span style={{whiteSpace : 'pre'}}> Evaluate</span>                    
                </Button>          
                <Modal size='sm' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Evaluate Dispatch Condition</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        {myAlert}                              
                        {DSI_DISPLAY}
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                                            
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(EvaluateDispatchCondition)
