import React, { Component,memo } from 'react'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import {getIDToken} from '../Auth/getIDToken'
import Row from 'react-bootstrap/Row'
import Form from 'react-bootstrap/Form'
import DropDownElement from '../Elements/DropDownElement'
import { connect } from 'react-redux'

class Support extends Component {

    state = {
        subject : '',
        html : '',        
        sel_type : 'Select type'
    }
   

    handleChange = (e) =>
    {        
        this.setState({
            ...this.state,
            [e.target.name] : e.target.value
        });             
    }

    selectIssueType = (name,value)=>
    {                
        this.setState({
            ...this.state,
            sel_type : value
        });       
    }
    sendMail=(type,issue,html)=>
    {   
        getIDToken().then(token=>
            {
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/sendMail',{                                        
                    to : 'List-Q-Imperium@quaero.com',                    
                    subject : `Imperium ` + type + ` : ` +  issue.trim(),
                    html : `<h3>` + issue + `</h3>` + html.trim(),
                    source : 'WM - Support'
                });                 
            });   
        this.setState({
            ...this.state,
            subject : '',
            html : ''
        })            
    }
   
    render() {
        let feed_types = ['Bug/Issue','Feature Request','Ops Support']
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
                                <DropDownElement option_name='selectedType' item_list={feed_types} text={this.state.sel_type} customSelectAction={this.selectIssueType}></DropDownElement>                                    
                            </Form.Group>                                
                            <Form.Group>
                                <Form.Control required type="text" name='subject' placeholder="Subject/Issue" value={this.state.subject} onChange={(e)=>this.handleChange(e)}/>                                                                                                
                            </Form.Group>                            
                            <Form.Group>
                                <Form.Control required as="textarea" rows='8' style={{width:'50rem'}} name='html' value={this.state.html}  placeholder="Description" onChange={(e)=>this.handleChange(e)}/>                                                                                                
                            </Form.Group>                                                          
                            <Row className="ml-1 mr-1 justify-content-end">
                                <Button variant="primary" type="button" onClick={()=>this.sendMail(this.state.sel_type,this.state.subject,this.state.html)} disabled={this.state.html==='' || this.state.subject==='' || this.state.sel_type==='Select type'}>
                                    SEND
                                </Button>                                                                    
                            </Row>                  
                    </Form>       
                </Row>
            </div>
        )
    }
}


const mapStateToProps = (state)=>
{
    return  {
        authUser : state.auth.authUser        
    }
}
export default connect(mapStateToProps,undefined)(memo(Support))