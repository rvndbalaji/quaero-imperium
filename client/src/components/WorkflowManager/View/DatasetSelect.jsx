import React, {memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { FaRegFileAlt,FaThList } from 'react-icons/fa'


function DatasetSelect(props){        
        return (
            <Row>
                <Col lg='auto' md='auto' sm='auto'>                    
                    <Button size='sm' variant='primary' disabled={(props.selected_row.OBJECT_TYPE==='FILE'?true:true)} style={{opacity:0}}>                                        
                            <FaRegFileAlt className='mb-1'/>
                            <span style={{whiteSpace : 'pre'}}>  File Columns</span>                    
                    </Button>    
                </Col>                
                <Col lg='auto' md='auto' sm='auto'>                    
                <Button size='sm' variant='primary' disabled={(props.selected_row.OBJECT_TYPE==='TABLE'?true:true)} style={{opacity:0}}>                                        
                            <FaThList className='mb-1'/>
                            <span style={{whiteSpace : 'pre'}}>  Table Columns</span>                    
                    </Button>    
                </Col>      
            </Row>
        )    
}
export default memo(DatasetSelect)