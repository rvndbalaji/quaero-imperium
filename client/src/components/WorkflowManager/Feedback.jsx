import React, { Component } from 'react'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import {getIDToken} from '../../components/Auth/getIDToken'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
class Feedback extends Component {

    state = {
        subject : '',
        html : '',        
    }

    handleChange = (e) =>
    {        
        this.setState({
            [e.target.name] : e.target.value
        });             
    }
    sendMail=(issue,html)=>
    {
        getIDToken().then(token=>
            {
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/sendMail',{                                        
                    to : 'aravind.balaji@quaero.com',
                    subject : `Imperium Support : ` +  issue.trim(),
                    html : `<h3>` + issue + `</h3>` + html.trim(),
                    source : 'WM - Feedback'
                });                 
            });   
        this.setState({
            subject : '',
            html : ''
        })            
    }
   
    render() {
        return (
            <div>
                <Row className='justify-content-center p-3'>                
                    <h4>Imperium Support</h4>                
                </Row>
                <Row className='justify-content-center'>                
                    Your feedback helps development and improves your experience.                     
                </Row>
                <Row className='justify-content-center'>                
                    <span>You can also raise a JIRA ticket on <a href='https://quaero.atlassian.net/browse/IMP' target='_blank' rel="noopener noreferrer"> Imperium Board</a>. We'll get back to you as soon as possible. </span> 
                </Row>                               
                <Row className='justify-content-center p-3'>                
                    <Form>
                            <Form.Group>
                                <Form.Control required type="text" name='subject' placeholder="Subject/Issue" value={this.state.subject} onChange={(e)=>this.handleChange(e)}/>                                                                                                
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required as="textarea" rows='8' style={{width:'50rem'}} name='html' value={this.state.html}  placeholder="Description" onChange={(e)=>this.handleChange(e)}/>                                                                                                
                            </Form.Group>                                                          
                            <Row className="ml-1 mr-1 justify-content-end">
                                <Button variant="primary" type="button" onClick={()=>this.sendMail(this.state.subject,this.state.html)} disabled={this.state.html==='' || this.state.subject===''}>
                                    SEND
                                </Button>                                                                    
                            </Row>                  
                    </Form>       
                </Row>
            </div>
        )
    }
}
export default Feedback