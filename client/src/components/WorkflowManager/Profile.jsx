import React, { Component,memo } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { connect } from 'react-redux'
import Image from 'react-bootstrap/Image';

class Profile extends Component {

    state = {        
        p_link : undefined
    }
    
    saveProfileInfo =(userObject,myphotoURL)=>
    {   
        if(!myphotoURL || myphotoURL.trim()==='')     
        {
            myphotoURL = null
        }              
        userObject.updateProfile({            
            photoURL: myphotoURL
          }).then(()=>{
            window.location.reload();
          });              
    }

    render() {
        
        let user = this.props.authUser;
        let  ProfilePicture = ''
        if(user.photoURL)
        {           
           ProfilePicture =  <Image src={user.photoURL} width="130rem" fluid roundedCircle  />
        }
        return (
            <Container fluid className="sec_body mt-2" align="center">                    
            <div className="body_content">                        
                <Container fluid>   
                    <Row className='justify-content-center mt-4'>
                        {ProfilePicture}
                    </Row>                          
                    <Row className='justify-content-center mt-2'>
                        <h2>{user.displayName}</h2>                        
                    </Row>
                    <Row className='justify-content-center'>
                        <span className='gray_text'><h6>{this.props.userTitle}</h6></span>
                    </Row>   
                    <Row className='justify-content-center'>
                        {user.email}
                    </Row>                        
                    <Row className='justify-content-start mt-4'>
                        <Form className='justify-content-start'  style={{width:'50%'}}>
                            <Form.Group>                                                                
                                <div align='left'>
                                    <small>Profile Photo URL</small>
                                    <Form.Control type="text" name='url' defaultValue={user.photoURL} size='sm' onChange={(e)=>this.setState({p_link : e.target.value})}/>
                                </div>                                
                            </Form.Group>                           
                            <Button className='float-left' size='sm' onClick={()=>this.saveProfileInfo(user,this.state.p_link)}>Save changes</Button>
                        </Form>
                    </Row>              
                </Container>
            </div>      
        </Container>          
        )
    }
}


const mapStateToProps = (state)=>
{
    return  {
        authUser : state.auth.authUser,
        userTitle : state.host.userTitle
    }
}
export default connect(mapStateToProps,undefined)(memo(Profile))

