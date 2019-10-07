import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../../components/Auth/getIDToken'
import Button from 'react-bootstrap/Button';
import { FaRegComment } from 'react-icons/fa';
import Alert from 'react-bootstrap/Alert';
export default function ReviewRequestModal(props) {
    
    const [show, setShow] = useState(false);        
    const [review, setReview] = useState({
        review_email : '',
        review_body : '',
        alert : {
            msg : '',
            color : 'danger'
        }
    });   
  
    const handleClose = () => {                  
        setShow(false);
        setReview({
            alert : {
                msg : '',
                color : 'danger'
            },
            review_email : '',
            review_body : ''
        })
    }
    const handleShow = () => 
    {   
        setShow(true);
    }

    const handleChange = (e) =>
    {        
        setReview({
            ...review,
            [e.target.name] : e.target.value
        });             
    }
    
    
    const sendMail=(to,html,detailTemplate)=>
    {
        setReview({
            ...review,
            alert : {
                msg : 'Sending request...',
                color : 'info'
            }
        })
        getIDToken().then(token=>
            {
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/sendMail',{                                        
                    to : to.trim().toLowerCase(),                    
                    subject : `Review Request for Workflow`,
                    html : html.trim() + detailTemplate,
                    source : 'WV - Review Request'
                }).then(res=>{
                    let resp = res.data;                    
                    if(resp.err===1)
                    {
                        setReview({
                            ...review,
                            alert : {
                                msg : JSON.stringify(resp.data.info),
                                color : 'danger'
                            }
                        })
                    }
                    else
                    {
                      handleClose();
                    }                  
                }).catch(err=>{                                        
                    setReview({
                        ...review,
                        alert : {
                            msg : err.toString(),
                            color : 'danger'
                        }
                    })
                });
                
            });   
    }
        let myAlert = (review.alert.msg!=='')?(<Alert style={{wordBreak :'break-all'}} variant={review.alert.color}>{review.alert.msg}</Alert>):'';
         
        return (
            <div>                               
                <Button variant='primary' onClick={handleShow} disabled={props.button_disable}>                                        
                        <FaRegComment className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Request Review</span>                    
                </Button>   
                <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Request workflow review</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
                        {myAlert}
                        Request someone to review this workflow. The user will receive the workflow details and link to this page via email/notification
                            <br/><br/>
                            <Form>
                                <Form.Group>                                    
                                    <Form.Control type="email" name='review_email' onChange={(e)=>handleChange(e)}  placeholder="Reviewer's Email" value={review.review_email} />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control name='review_body' as="textarea" rows='4' onChange={(e)=>handleChange(e)}  placeholder="Description" value={review.review_body}/>                                                                                                
                                </Form.Group>                                 
                            </Form>
                        </Modal.Body>

                        <Modal.Footer>                            
                            <Button variant='secondary' onClick={handleClose}>Close</Button>                
                            <Button variant='primary' onClick={()=>sendMail(review.review_email,review.review_body,props.template)} disabled={review.review_email==='' || review.review_body===''}>Send Request</Button>
                        </Modal.Footer>
                    </Modal>  
            </div>
            
        )    
}
