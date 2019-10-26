import React, { Component } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Form from 'react-bootstrap/Form'

import ProgressBar from 'react-bootstrap/ProgressBar'
import { connect } from 'react-redux'
import {setRefreshInterval} from '../../../store/actions/monitorActions'
import uuid from 'uuid/v1'
class FilterMenu extends Component {
refreshTimeout;
 
 
    refreshChanged=(e)=>
    {
        //Interval cannot be less than 7 seconds
        let interval = (e.target.value<=7)?7:(e.target.value);
        //Dispatch after one second        
        clearTimeout(this.refreshTimeout)        
        this.refreshTimeout =  setTimeout(()=>{
           this.props.setRefreshInterval(interval)                 
        },1000)
    }

   
   render() {
        let wf_order_list = ['WORKFLOW_ID','WORKFLOW_NAME','WORKFLOW_INSTANCE_STATUS','SERVER_NAME','METASTORE_NAME','WORKFLOW_INSTANCE_ID','RUN_TIME_IN_MINS','UPDATE_DT','START_DT','END_DT','ACTIVE_FLG','UPDATE_USER']       
        let ref_interval = this.props.refreshInterval;        

        let Items = wf_order_list.map((item)=>
            {               
                return(
                    <Dropdown.Item href="#" key={uuid()} onClick={()=>{this.props.orderColFunc(item)}}>{item}</Dropdown.Item>                                               
                );                                        
            });
        return (            
            <Container>                
                <Row >
                    <Col lg="auto" md="auto"  className='p-2 ml-2' style={{paddingTop:'1rem',zoom:0.85}}>
                        <div>
                            <b><span className="gray_text">FILTER</span></b>
                        </div>
                    </Col> 
                    <Col lg="auto" md="auto" className='p-2 ml-4'>
                        <Form.Group controlId="completeCheckBox" className='m-0'>
                            <Form.Check custom type="checkbox" label="COMPLETE" defaultChecked={true} onClick={(e)=>this.props.updateFilter('complete',e.target.checked)}/>
                        </Form.Group>                                 
                    </Col>
                    <Col lg="auto" md="auto" className='p-2'>
                        <Form.Group controlId="failedCheckBox" className='m-0'>
                            <Form.Check custom type="checkbox"  label="FAILED" defaultChecked={true} onClick={(e)=>this.props.updateFilter('failed',e.target.checked)}/>
                        </Form.Group>                                 
                    </Col>
                    <Col lg="auto" md="auto" className='p-2'>
                        <Form.Group controlId="executingCheckBox" className='m-0'>
                            <Form.Check  custom type="checkbox" label="RUNNING" defaultChecked={true} onClick={(e)=>this.props.updateFilter('running',e.target.checked)}/>
                        </Form.Group>                                 
                    </Col>                                                   
                    <Col lg='auto' mg='auto' className='ml-auto' >                                            
                        <Row className='justify-content-end'  style={{fontSize:'90%',zoom:0.85}}>                        
                            <Col lg="auto" md="auto"  style={{paddingTop:'0.5rem'}}>
                                <div>
                                    <b><span className="gray_text">ORDER BY</span></b>
                                </div>
                            </Col> 
                            <Col lg="auto" md="auto" className='pt-0 pr-2 pl-2 pb-0'>
                                <DropdownButton  drop='down' className='custom_dropdown' id='Orderby' title={this.props.sortOptions.order_col}>                
                                    {Items}
                                </DropdownButton>      
                            </Col> 
                            <Col lg="auto" md="auto" className='pt-0 pr-2 pl-2 pb-0'>
                                <Button className='custom_white_button' onClick={(e)=>{this.props.orderByFunc(this.props.sortOptions.order_by)}}>{this.props.sortOptions.order_by.toUpperCase()}</Button>                                    
                            </Col>
                        </Row>
                    </Col>          
                </Row>                     
                <Row className='justify-content-center' style={{zoom:0.85}} >                                                                                 
                    <Col lg="auto" md="auto">
                        <span>Refresh every </span>
                        <div className="btn-group">
                            <input type="number" className="form-control" id="ref_box"  min={7} defaultValue={ref_interval} onChange={(e)=>this.refreshChanged(e)}/>
                        </div>
                        <span> seconds</span>
                    </Col>                          
                </Row>   
                <Row className='justify-content-center mt-2 mb-1'>                    
                    <Col lg={12} md={12}>
                        <ProgressBar animated now={100} style={{height:'0.2rem',opacity : (this.props.progressVisible)?1:0}}/>                        
                    </Col>                                     
                </Row> 
                       
            </Container>            
        )
    }
}


const mapStateToProps =(state)=>
{       
    return {        
        progressVisible : state.monitor.progressVisible,
        refreshInterval : state.monitor.refreshInterval
    }    
}


const mapDispatchToProps =(dispatch)=>
{    
    return{
            setRefreshInterval : (interval) => {            
            dispatch(setRefreshInterval(interval));
        }       
    }    
}

export default connect(mapStateToProps,mapDispatchToProps)(FilterMenu);
