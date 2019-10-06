import React, {memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {FaPen } from 'react-icons/fa'
import Button from 'react-bootstrap/Button'

function ParamSelect(){
        
        return (
            <Row>
                <Col lg='auto' md='auto' sm='auto'>
                    <Button size='sm' variant='info' disabled={true}>                                        
                        <FaPen className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Edit Value</span>                    
                    </Button>                
                </Col>                
            </Row>
        )    
}
export default memo(ParamSelect)