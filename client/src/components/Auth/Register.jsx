import React, { Component } from 'react'
import Banner from '../Elements/Banner';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import {Link} from 'react-router-dom'

 class Register extends Component {
    render() {
        return (
            <div>
                <Banner title="Register to Imperium"></Banner>
                <Row className="justify-content-center">
                    <Col lg={4} sm={12} md={4}>
                        <Alert variant='danger'/>                        
                        <Form action="users/register" method='post'>
                            <Form.Group>
                                <Form.Control required type="text" placeholder="Full Name" />                                                                
                                <small className="text-muted">Eg. John Wick</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="text" placeholder="Enter email" />                                                                
                                <small className="text-muted">Use your domain email @quaero.com</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="text" placeholder="Domain username" />                                                                
                                <small className="text-muted">Eg. balajia, krishnap</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="password" placeholder="Domain Password" />                                                                                                
                            </Form.Group>                                                     
                            <Row className="ml-1 mr-1">
                                <Button variant="primary" type="submit">
                                    Register
                                </Button>                                    
                                <Link to="login" class="btn btn-secondary ml-auto" target="_self">Login</Link>
                            </Row>                  
                        </Form>                                                
                    </Col>                    
                </Row>
            </div>                
        )
    }
}
export default Register
