import React, { Component,memo } from 'react'
import Banner from '../Elements/Banner';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { connect } from 'react-redux'
import { performLoginWithCreds } from '../../store/actions/authActions'
import { Redirect} from 'react-router'
import Footer from '../Elements/Footer'
 class LogIn extends Component {    

    state = {
        username : undefined,
        password : undefined        
    } 
    
    
    requestLogin = (e)=>
    {
        e.preventDefault();                
        this.props.performLoginWithCreds(this.state);        
    }

    handleChange = (e) =>
    {
        this.setState({
            [e.target.name] : e.target.value,            
        })        
    }
    redirectIfAlreadyAuthenticated = ()=>
    {        
        if(this.props.tryLogin || (this.props.authUser && this.props.authUser.uid))
        {   
           return <Redirect to='/'></Redirect>
        }        
        return undefined
    }
    render() {                 
        
        let shouldRedirect  = this.redirectIfAlreadyAuthenticated()
        if(shouldRedirect)
        {
            return shouldRedirect;
        }
        let alert_item='';     
        //console.log(this.props)           
        if(this.props.alert)
        {
            alert_item = <Alert variant={this.props.alert.color}>{this.props.alert.msg}</Alert>                       
        }
        
        return (
            <div>
                <Banner></Banner>
                <Row className="justify-content-center">
                    <Col lg={4} sm={12} md={4}>                                                
                        {alert_item}
                        <Row className="justify-content-center"><h4>Login</h4></Row>
                        <Form onSubmit={this.requestLogin}>
                            <Form.Group>
                                <Form.Control required type="text" name='username' placeholder="Domain username" onChange={this.handleChange}/>                                                                
                                <small className="text-muted">Eg. balajia, krishnap</small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Control required type="password" name='password' placeholder="Password" onChange={this.handleChange} />                                                                                                
                            </Form.Group>
                            {/*
                            <Form.Group controlId="formBasicCheckbox">
                                <Form.Check  custom type="checkbox" label="Remember password" />
                            </Form.Group>                                 
                            */}
                            <Row className="ml-1 mr-1">
                                <Button variant="primary" type="submit" >
                                    Log In
                                </Button>                                                                    
                                {
                                //<Link to="register" className="btn btn-secondary ml-auto" target="_self">Register</Link>
                                }
                            </Row>                  
                        </Form>                                                
                    </Col>                    
                </Row>
                <Footer />
            </div>                
        )
    }
}

const mapStateToProps  = (state) =>
{       
        return{
        alert : state.auth.alertAuth,
        authUser : state.auth.authUser,
        tryLogin: state.auth.tryLogin 
    }        
}

const mapDispatchToProps =(dispatch)=>
{    
    return{
        performLoginWithCreds : (login_creds) => {            
            dispatch(performLoginWithCreds(login_creds));
        }       
    }    
}
export default connect(mapStateToProps,mapDispatchToProps)(memo(LogIn))
