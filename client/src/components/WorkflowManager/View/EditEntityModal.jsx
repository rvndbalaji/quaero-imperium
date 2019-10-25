import React, { useState, memo, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import {  FaPen } from 'react-icons/fa'
import DisplayEditableColumns from './DisplayEditableColumns';
import { useDispatch } from 'react-redux'
import { setViewMonitor, setSelectedRow ,clearViewRefresh} from '../../../store/actions/viewActions';
function EditEntityModal(props) {
    
    const [show, setShow] = useState(false);        
    const dispatch = useDispatch();

    const [editVal, setEditVal] = useState({      
      actionInProgress : false,            
      actionAlert : {          
            msg : '',
            color : ''
        },
        
      //All columns of Source Entity is automatically initialized
    });   

    
    useEffect(() => 
    {   
        //Get the selected row & fetch all column names
        
        if(props.selected_row)
        {
            let filtered_cols = {}
            let keys = Object.keys(props.selected_row);
            keys.forEach(keyname => {
                if(!props.excluded_cols.includes(keyname))
                {
                    filtered_cols[keyname] = props.selected_row[keyname]
                }
            });
            
            //Exclude columns in exclude list
            setEditVal({
                actionInProgress : false,            
                actionAlert : {          
                        msg : '', 
                        color : ''
                    },
                keyValuePairs :{ 
                    ...filtered_cols
                }
            })
        }
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

    const setEntityState = (key,value)=>
    {                
        setEditVal({
            ...editVal,
            keyValuePairs : {
                ...editVal.keyValuePairs,
                [key] : value
            }            
        })   
        
    }
    const updateEntity =()=>
    {           
        setEditVal({
            ...editVal,            
            actionInProgress : true,
            actionAlert : {
                msg : 'Updating source entity...',
                color : 'info'
            }
        });        
        getIDToken().then(token=>
            {                
                let wf_details = props.wf_details            
                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/wf/setSourceEntity',{                    
                    server : wf_details.server,
                    auth_type : wf_details.auth,
                    db : wf_details.metastore, 
                    schema:'dbo', 
                    source_entity_id : props.selected_row.ID,                     
                    keyValuePairs :   {
                        ...editVal.keyValuePairs
                    }                
                    
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
                        dispatch(setSelectedRow('selectedEntity',undefined))                        
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
                        <span style={{whiteSpace : 'pre'}}>  Edit Entity</span>                    
                </Button>      
                <Modal size='lg' show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                        <Button variant='primary' onClick={updateEntity} disabled={editVal.actionInProgress}>{(editVal.actionInProgress)?'Updating...':'Update Entity'}</Button>                            
                        </Modal.Header>                       
                        <Modal.Body>
                        {myAlert}       
                        <DisplayEditableColumns keyValueCallback={setEntityState} selected_row={props.selected_row} excluded_rows={props.excluded_cols} />
                        </Modal.Body>
                    </Modal>  
            </div>
            
        )    
}

export default  memo(EditEntityModal)
