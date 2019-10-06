import React, {memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import RestageModal from './RestageModal'

function StageSelect(props){
        
        return (
            <Row>
                <Col lg='auto' md='auto' sm='auto'>                    
                        <RestageModal selected_row = {props.selected_row} wf_details={props.wf_details}/>                    
                </Col>                
            </Row>
        )    
}
export default memo(StageSelect)