import React, { Component,memo } from 'react'
import Banner from '../Elements/Banner';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import {Link} from 'react-router-dom'
import axios from 'axios'
import { Redirect} from 'react-router'
import { connect } from 'react-redux'

 class Register extends Component {

    state = {
        alert : {
            msg : '',
            color : 'danger'
        },
        full_name : '',
        email : '',
        username : '',
        password : ''
    }

    redirectIfAlreadyAuthenticated = ()=>
    {        
        if(this.props.tryLogin || (this.props.authUser && this.props.authUser.uid))
        {              
           return <Redirect to='/'></Redirect>           
        }      
        return undefined
    }
    handleChange = (e) =>
    {
        this.setState({
            ...this.state,
            [e.target.name] : e.target.value
        })
    }

    performRegister =()=>
    {
        this.setState({
            ...this.state,
            alert : {
                msg : 'Registering you...',
                color : 'info'
            }
        })
        axios.post('/users/register',{                    
           full_name : this.state.full_name,
           email : this.state.email,
           username : this.state.username,
           password : this.state.password
        }).then(res =>{
            let resp = res.data;
            if(resp.err===1)
            {                
                let err_list = []
                resp.data.info.forEach(element => {
                    err_list.push(element.msg + ' ' + element.param)
                });
                this.setState({
                    ...this.state,
                    alert : {
                        msg : err_list,
                        color : 'danger'
                    }
                })
            }
            else
            {
                this.setState({
                    ...this.state,
                    alert : {
                        msg : 'Successful',
                        color : 'success'
                    }
                })
                window.location.href = '/users/login'               
               
            }
        }).catch(err =>
        {
            this.setState({
                ...this.state,
                errors : err
            })
        });   
    }
    render() {        

        let shouldRedirect  = this.redirectIfAlreadyAuthenticated()
        if(shouldRedirect)
        {
            return shouldRedirect;
        }

        let myAlert = (this.state.alert.msg!=='')?(<Alert style={{wordBreak :'break-all'}}  variant={this.state.alert.color}>{this.state.alert.msg}</Alert>):'';
        return (
            <div>
                <Banner title="Register to Imperium"></Banner>
                <Row className="justify-content-center">
                    <Col lg={4} sm={12} md={4}>
                        {myAlert}
                        <Form>
                            <Form.Group>
                                <Form.Control required type="text" name='full_name' placeholder="Full Name" onChange={(e)=>this.handleChange(e)} />
                                <small className="text-muted">Eg. John Wick</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="text" name ='email' placeholder="Enter email" onChange={(e)=>this.handleChange(e)} />
                                <small className="text-muted">Use your domain email @quaero.com</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="text" name='username' placeholder="Domain username" onChange={(e)=>this.handleChange(e)} />
                                <small className="text-muted">Eg. balajia, krishnap</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="password" name='password' placeholder="Domain Password" onChange={(e)=>this.handleChange(e)} />
                            </Form.Group>                                                     
                            <Row className="ml-1 mr-1">
                                <Button variant="primary" onClick={()=>this.performRegister()}>
                                    Register
                                </Button>                                    
                                <Link to="login" className="btn btn-secondary ml-auto" target="_self">Login</Link>
                            </Row>                  
                        </Form>                                                
                    </Col>                    
                </Row>
            </div>                
        )
    }
}

const mapStateToProps  = (state) =>
{       
    return{        
        authUser : state.auth.authUser,
        tryLogin: state.auth.tryLogin 
    }        
}
export default connect(mapStateToProps,undefined)(memo(Register))