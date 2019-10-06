import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios'
import {getIDToken} from '../../../components/Auth/getIDToken'
import Button from 'react-bootstrap/Button';
export default function ReviewRequestModal(props) {
    
    const [show, setShow] = useState(false);        
    const [review, setReview] = useState({
        review_email : '',
        review_body : ''
    });   
  
    const handleClose = () => {                  
        setShow(false);
        setReview({
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
        getIDToken().then(token=>
            {
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/sendMail',{                    
                    from : 'Aravind Balaji aravind.balaji@quaero.com',
                    to : to.trim().toLowerCase(),
                    cc : `aravind.balaji@quaero.com`,
                    subject : `Review Request for Workflow`,
                    html : html.trim() + detailTemplate,
                    source : 'WV - Review Request'
                });                 
            });   
      
        handleClose();            
    }
    
        return (
            <div>
                <Button variant='primary'  onClick={handleShow} disabled={props.button_disable}>
                        Request Review
                </Button>
                <Modal show={show} onHide={handleClose} backdrop='static' backdropClassName='my_modal_backdrop'>
                        <Modal.Header closeButton>
                            <Modal.Title>Request workflow review</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>
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
