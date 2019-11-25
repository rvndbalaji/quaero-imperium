import React, { useState } from 'react'
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
//import { Button } from '@material-ui/core';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useSelector , useDispatch } from 'react-redux'
import uuid from 'uuid/v1'
import Alert from 'react-bootstrap/Alert'
import { testHost,saveHost as saveHostAction , setAlert, cancellers, deleteHost} from '../../../store/actions/hostActions';

export default function ConfigureHosts() {

    const store = useSelector(store => store.host)
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);        
    let initHost = {
        host_id : undefined,
        host : '',
        auth_type : 0,
        server_type : 0,
        nickname : '',
        sql_un : undefined,
        sql_pw : undefined
    }
    const [modalDetails, setModalDetails] = useState({
        modal_type : 'Add',
        modal_title : 'Add Hosts',
        host_details : {...initHost}
    });    
    
    const handleClose = () => {          
        if(cancellers.cancelTest)
            cancellers.cancelTest();
        actualCloseModal();
    }
    const actualCloseModal =()=>
    {
        setShow(false);
        dispatch(setAlert(undefined))            
    }
    const handleShow = (type,host_name) => 
    {   
        let temp_host_details = (store.hosts && host_name)?store.hosts[host_name]:{...initHost};
        if(store.hosts && host_name)
        {
            temp_host_details['host_id'] = host_name
        }        
        setModalDetails({
            modal_type : type,
            modal_title : type + ' Host',
            host_details : {...temp_host_details},                           
        })        
        setShow(true);
    }
    const removeHost=()=>
    {   
        dispatch(deleteHost(modalDetails.host_details.host_id));                        
    } 
    const handleChange =(e) =>
    {        
        let key = [e.target.name.trim()] 
        let value = e.target.value.trim()
        let sql_un = modalDetails.host_details.sql_un
        let sql_pw =  modalDetails.host_details.sql_pw
        if(key[0]==='host')  
        {
            value = value.toUpperCase();
        }
        
        //For radios, use the ID to fetch the value
        if(key[0]==='server_type')
        {
            value = (e.target.id==='testoption')?0:1     
        }
        

        if(key[0]==='auth_type')
        {   
            value = (e.target.id==='winoption')?0:1   
            if(value===1)
            {
               sql_pw = sql_un = undefined                   
            }                     
        }        
        
        if(sql_un)
        {
            if(sql_un.trim()==='')
            {
                sql_un = undefined
            }
            else
            {
                sql_un = sql_un.trim()
            }
        }
       
        if(sql_pw)
        {
            if(sql_pw.trim()==='')
            {
                sql_pw = undefined
            }          
        } 
        setModalDetails({
            ...modalDetails,
            host_details : {            
                ...modalDetails.host_details,  
                sql_un,
                sql_pw,  
                [key] :  value
            }
        });
    }          
    
    const saveHost = ()=>
    {       
        if(modalDetails.modal_type!=='Edit' && modalDetails.host_details.auth_type===1 && (!modalDetails.host_details.sql_un || !modalDetails.host_details.sql_pw))
        {            
            dispatch(setAlert('Username and password required for SQL Auth','danger'))       
            return                    
        }

        if(modalDetails.host_details.host==='' || modalDetails.host_details.nickname==='')
        {
            dispatch(setAlert('Hostname and Nickname are required','danger'))       
            return                    
        }      
        
        if(modalDetails.modal_type!=='Edit')
        {
            dispatch(testHost(modalDetails.host_details));                        
        }
        else
        {
            dispatch(saveHostAction(modalDetails.host_details));                        
        }
        
    }    
    
    let host_names;
    if(store.hosts)
    {
        host_names = Object.keys(store.hosts);
    }
    let ConfiguredHostList = host_names && host_names.map((hostname,index)=>(        
            <Button  variant='secondary' onClick={()=>handleShow('Edit',hostname)}  key={uuid()} className='m-2'> 
                {store.hosts[hostname].nickname}
            </Button>                                                        
        ));
    let alert_item='';             
    if(store.alertHost)
    {         
        if(store.alertHost!=='closeModal')        
        {
            alert_item = <Alert variant={store.alertHost.color}>{store.alertHost.msg}</Alert>                       
        }
        else{
            //Close modal            
            actualCloseModal();
        }
    }  
              
    let del_btn = ''
    if(modalDetails.modal_type==='Edit')
    {
        del_btn = (<Button variant='danger' className="mr-auto" onClick={removeHost}>Delete</Button>)
    }
    let SQLLoginForm= ''
    if(modalDetails.host_details.auth_type===1)
    {
        SQLLoginForm = (
            <Form.Group style={{zoom:0.8}}>
                <Form.Group controlId="domain"> 
                            <Form.Label><b>Username (Ex : DOMAIN\username)</b></Form.Label>   <br/> 
                            <Form.Control required type="text" autoComplete="new-password" disabled={modalDetails.modal_type==='Edit'} name='sql_un'  onChange={(e)=>handleChange(e)}  defaultValue={modalDetails.host_details.sql_un} placeholder='QUAERO\username'/>                                                                
                        </Form.Group>
                        <Form.Group>
                            <Form.Label><b>Password</b></Form.Label>   <br/> 
                            <Form.Control required type="password" autoComplete="new-password" disabled={modalDetails.modal_type==='Edit'} name='sql_pw'  onChange={(e)=>handleChange(e)}  defaultValue={modalDetails.host_details.sql_pw} />                                                                                                
                        {// <span className='gray_text'>NOTE : Uses your domain username/password</span>
                        }
                </Form.Group>
            </Form.Group>           
        )
    }
    
    return (
        <div>
            <Row>
                    <Col lg="12" md="12" sm="12" xd="12" align="left">                                            
                    <b>Configure Servers</b><br />
                    Server configurations to access metastores                        
                    <br /><br />
                    <div className="expanded_sett">
                        <Button variant='primary' onClick={()=>handleShow('Add',undefined)}>
                            Add a new server
                        </Button>                        
                        <Row id="server_list" className="mt-2 mb-2" style={{marginLeft:'-1.4rem'}}>
                            <Col lg='auto' md='auto' sm='auto' xs='auto'>
                                {ConfiguredHostList || 'No hosts configured'}
                            </Col>
                        </Row>
                    </div>                    
                    </Col>
                    <span className="red_text ml-3">WARNING : Deleting a host will also remove any workflows that were marked for monitoring on that server</span>
                    
                    
            </Row>
            <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
            <Modal.Header closeButton>
                <Modal.Title>{modalDetails.modal_title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
            {alert_item}
                <Form>
                    <Form.Group>
                         <Form.Label><b>Server/Hostname (Ex. HSPSQL02T.QUAERO.COM:1433)</b></Form.Label>
                         <Form.Control type="text" className='text-uppercase' name='host' onChange={(e)=>handleChange(e)} disabled={modalDetails.modal_type==='Edit'} defaultValue={modalDetails.host_details.host} placeholder='Ex. HSPSQL02T.QUAERO.COM'/>
                    </Form.Group>
                    <Form.Group>
                         <Form.Label><b>Nickname (Ex. Acme Prod)</b></Form.Label>
                         <Form.Control type="text"  name='nickname' onChange={(e)=>handleChange(e)} defaultValue={(modalDetails.host_details)?modalDetails.host_details.nickname:null}/>
                    </Form.Group>
                    <Form.Group  controlId="serverRadio">
                        <Form.Label><b>Server Type</b></Form.Label>   <br/>    
                        <Form.Check inline type="radio" custom name='server_type' onChange={(e)=>handleChange(e)}  label="Test/Developer"   id="testoption" checked={modalDetails.host_details.server_type===0}/>
                        <Form.Check inline  type="radio"   custom  name='server_type' onChange={(e)=>handleChange(e)} label="Production"   id="prodoption" checked={modalDetails.host_details.server_type===1} />
                    </Form.Group>        
                    <Form.Group  controlId="authRadio">
                        <Form.Label><b>Authentication Type</b></Form.Label>   <br/>    
                        <Form.Check disabled={modalDetails.modal_type==='Edit'} inline type="radio"  custom  name='auth_type' onChange={(e)=>handleChange(e)} label="Windows"  id="winoption" checked={modalDetails.host_details.auth_type===0}/>
                        <Form.Check  disabled={modalDetails.modal_type==='Edit'} inline  type="radio" custom  name='auth_type' onChange={(e)=>handleChange(e)}  label="SQL"   id="sqloption" checked={modalDetails.host_details.auth_type===1}/>
                    </Form.Group>
                    {SQLLoginForm}
                </Form>
            </Modal.Body>            
            <Modal.Footer>
                {del_btn}
                <Button variant='secondary' onClick={handleClose}>Close</Button>                
                <Button variant='success' onClick={saveHost}>Test &amp; Save changes</Button>
            </Modal.Footer>
        </Modal>
        </div>
    )
}
