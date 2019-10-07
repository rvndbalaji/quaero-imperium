import React, { Component,memo } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import store from '../../store/redux_store'
class Profile extends Component {

    render() {

        let user = store.getState().auth.authUser        
        return (
            <Container fluid className="sec_body mt-2" align="center">                    
            <div className="body_content">                        
                <Container fluid>                           
                    <Row className='justify-content-center mt-4'>
                        <h2>{user.displayName}</h2>                        
                    </Row>
                    <Row className='justify-content-center'>
                        <span className='gray_text'><h6>Associate Data Engineer</h6></span>
                    </Row>   
                    <Row className='justify-content-center'>
                        {user.email}
                    </Row>                    
                </Container>
            </div>      
        </Container>          
        )
    }
}

export default memo(Profile)

