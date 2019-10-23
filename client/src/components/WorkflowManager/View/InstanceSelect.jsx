import React, {memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { FaExternalLinkSquareAlt, FaLayerGroup } from 'react-icons/fa'
import Button from 'react-bootstrap/Button'
import ModifyStatusModal from './ModifyStatusModal'
import ViewLogsModal from './ViewLogsModal'
import PrecompileModal from './PrecompileModal'

function InstanceSelect(props){    
        return (
            <Row>
                <Col lg='auto' md='auto' sm='auto'>
                        <ModifyStatusModal selected_row = {props.selected_row} wf_details={props.wf_details}/>
                </Col>                
                <Col lg='auto' md='auto' sm='auto'>                    
                    <ViewLogsModal selected_row = {props.selected_row} wf_details={props.wf_details}/>
                </Col>                
                <Col lg='auto' md='auto' sm='auto'>                    
                    <PrecompileModal selected_row = {props.selected_row} wf_details={props.wf_details}/>
                </Col>               
                <Col lg='auto' md='auto' sm='auto'>                                           
                        <Button  size='sm'  variant='info' disabled={!props.selected_row.OOZIE_JOB_URL} onClick={()=>window.open((props.selected_row.OOZIE_JOB_URL.substring(props.selected_row.OOZIE_JOB_URL.indexOf('http'),props.selected_row.OOZIE_JOB_URL.length)))}>
                            <FaExternalLinkSquareAlt className='mb-1'/>
                            <span style={{whiteSpace : 'pre'}}>  Visit Oozie URL</span>                    
                        </Button>                                    
                </Col>                
                <Col lg='auto' md='auto' sm='auto'>
                    <Button  size='sm' variant='info' disabled={true} style={{opacity:0}}>
                        <FaLayerGroup className='mb-1'/>
                        <span style={{whiteSpace : 'pre'}}>  Bulk Status Change</span>                    
                    </Button>                
                </Col>                
              
            </Row>
        )    
}
export default memo(InstanceSelect)