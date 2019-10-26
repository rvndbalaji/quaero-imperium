import React, { Component,memo } from 'react'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { connect } from 'react-redux'
import Col from 'react-bootstrap/Col';


class WhatsNew extends Component {
    
    render() {       
     
        return (
            <Container fluid className="sec_body mt-2" align="center">             

            <Row>
                <h5>What's New?</h5>
            </Row>
            <Row>
                <Col className='text-left'>
                    1. Clear all monitors button  <br/>
                    2. Edit workflow params &amp; source entities <br/>
                    3. View &amp; edit dispatch conditions (and view dispatch window) <br/>                    
                </Col>    
            </Row>

            <Row className='mt-4'>
                <h5>Upcoming major features!</h5>
            </Row>
            <Row>
                <Col className='text-left'>
                    1. Ability to start/stop using service account <br/>
                    2. Get notified when a job is started/stopped <br/>
                    3. Suggest usernames when sending workflow request review <br/>                                        
                    4. Set default servers &amp; metastores                
                </Col>                
            </Row>

            <Row className='mt-4'>
                <h5>Upcoming minor changes...</h5>
            </Row>
            <Row>
                <Col className='text-left'>                   
                   1. Bulk Status Change - Modify the status of multiple workflow instances at once <br/>
                   2. Set timezones and display all time and date in the preferred zone   <br/> 
                   3. Ability to perform source system scan immediately &amp; display the timer until next scan   <br/>
                   4. Ability to modify and bulk-edit DSI Status   <br/>
                   5. Toggle multiple SQL Server jobs at once   <br/>
                </Col>                
            </Row>

            </Container>          
            
        )
    }
}

export default connect(undefined,undefined)(memo(WhatsNew))

