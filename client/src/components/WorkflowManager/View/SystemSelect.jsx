import React, {memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {FaPlay } from 'react-icons/fa'
import Button from 'react-bootstrap/Button'

function SystemSelect(){
        
        return (
            <Row>
                <Col lg='auto' md='auto' sm='auto'>
                    <Button size='sm' variant='info' disabled={true} style={{opacity:0}}>                                        
                        <FaPlay className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Scan Now</span>                    
                    </Button>                
                </Col>                
            </Row>
        )    
}
export default memo(SystemSelect)