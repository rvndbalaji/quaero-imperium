import React from 'react'
import Container from 'react-bootstrap/Container';
import ConfigureHosts from './Settings/ConfigureHosts'
export default function Settings() {   
    
    return (              
        <Container fluid className="sec_body mt-2" align="center">                    
        <div className="body_content">                        
            <Container fluid>                           
            <ConfigureHosts />
                <hr/>
            </Container>
        </div>      
    </Container>            
    )
}
