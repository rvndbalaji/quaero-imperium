import React, { PureComponent, memo } from 'react'
import uuid from 'uuid/v1'
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Alert from 'react-bootstrap/Alert';
import {Link} from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import { connect } from 'react-redux'
import {toggleWorkflowMonitor as mon_toggle} from '../../../store/actions/monitorActions'
import {toggleWorkflowMonitor as view_toggle} from '../../../store/actions/viewActions'
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import Button from 'react-bootstrap/Button';

class WorkflowResult extends PureComponent {

    computeWorkflowColors =(instance_status)=>
    {
        let wf_color = {
            dark : '#2196F3',
            light : '#d1eaff'
        };
        if(['FAILED','FAILED-CLEANUPFAILED'].indexOf(instance_status) >=0)        
        {
            wf_color.dark = '#E57373'
            wf_color.light = '#ffe0e3'            
        }
        else if(['COMPLETE','COMPLETE-CLEANUPFAILED','COMPLETE-PENDINGCLEANUP','COMPLETE-PENDINGINSPECTION'].indexOf(instance_status) >=0)
        {
            wf_color.dark = '#4CAF50'
            wf_color.light = '#CEEDD1'            
        }  
        else if('DID NOT RUN'===instance_status)  
        {
            wf_color.dark = '#282828'
            wf_color.light = '#e0e0e0'
        }
        return wf_color;
    }


    toggleMonitor=(e,wf_details)=>
    {       
        if(this.props.type==='view')        
        {
            this.props.view_toggle(e.target.checked)        
        }
        else
        {
            this.props.mon_toggle(e.target.checked,wf_details)        
        }
        
    }
    
    render() {
        let wf_list = this.props.wf_list;      
        
        //If filterSortOptions were passed down    
        if(this.props.type==='monitor' && this.props.filterSortOptions)
        {
            if(this.props.filterSortOptions.order_by==='asc')
            {
                wf_list.sort((a, b) => (a[this.props.filterSortOptions.order_col] < b[this.props.filterSortOptions.order_col]) ? 1 : -1)                
            }
            else
            {
                wf_list.sort((a, b) => (a[this.props.filterSortOptions.order_col] > b[this.props.filterSortOptions.order_col]) ? 1 : -1)                
            }
        }

        //If filters are applied, remove those elements
        let WorkflowList = wf_list && wf_list.filter((workflow)=>
        {                        
            if(workflow.type==='err') return true;            
            let wf_status =  (workflow.WORKFLOW_INSTANCE_STATUS)?workflow.WORKFLOW_INSTANCE_STATUS.toLowerCase():'DID NOT RUN';
            let filter_options = (this.props.filterSortOptions)?this.props.filterSortOptions.filter_exclude:undefined;
            if(filter_options && filter_options.complete && wf_status.includes('complete')) return false;
            if(filter_options && filter_options.failed && wf_status.includes('failed')) return false;
            if(filter_options && filter_options.running && !wf_status.includes('complete') && !wf_status.includes('failed')) return false;            
            
            return true; //Don't skip this workflow
        }).map((workflow,index)=>
        {            
            //Check if an error object was received or if a workflow was received
            if(workflow.type && workflow.type==='err')
            {
                return (
                    <Alert variant='danger' key={uuid()}>{workflow.msg || 'Something went wrong : WF_RES'}</Alert>                       
                )
            }          

            
            let reg_mon = this.props.registeredMonitors
            
            let workflowBeingMonitored = false;            

            //Check if the current workflow is a monitored workflow. If workflow ID is present inside a the [server_name, metastore_name, wf_id] triplet of registeredMonitors then its monitored
            if(reg_mon && reg_mon[workflow.SERVER_NAME] && reg_mon[workflow.SERVER_NAME][workflow.METASTORE_NAME] && reg_mon[workflow.SERVER_NAME][workflow.METASTORE_NAME]['wf_id'])
            {  
                for(var ind in reg_mon[workflow.SERVER_NAME][workflow.METASTORE_NAME]['wf_id'])
                {                           
                    if(reg_mon[workflow.SERVER_NAME][workflow.METASTORE_NAME]['wf_id'][ind]===Number(workflow.WORKFLOW_ID))
                    {
                        workflowBeingMonitored = true;
                        break;
                    }
                }
            }            

            workflow.WORKFLOW_INSTANCE_STATUS = (workflow.WORKFLOW_INSTANCE_STATUS)?workflow.WORKFLOW_INSTANCE_STATUS:'DID NOT RUN'
            let wf_color = this.computeWorkflowColors(workflow.WORKFLOW_INSTANCE_STATUS)            

            let ServerDetails = (
                <Row>
                    <Col lg='auto' md='auto'><span className='gray_text'>SERVER </span>
                        {workflow.SERVER_NAME}
                    </Col>
                    <Col lg='auto' md='auto'><span className='gray_text'>METASTORE </span>
                        {workflow.METASTORE_NAME}
                    </Col>                                      
                </Row>
            );
            let UpdateDetails = (
                <Row>
                    <Col lg='auto' md='auto' ><span className='gray_text'>UPDATED BY </span>
                        {workflow.UPDATE_USER}
                    </Col>
                    <Col  lg='auto' md='auto'><span className='gray_text'>UPDATED ON </span>
                        {workflow.UPDATE_DT}
                    </Col>     
                </Row>
            );
            
            let ViewWorkflowButton = (<Col lg='auto' md='auto'>                            
                                    <Link to={'/wf_man/view/0/' + workflow.SERVER_NAME + '/' + workflow.METASTORE_NAME + '/' + workflow.WORKFLOW_ID} target='_blank'>
                                        <Button variant='primary' size='sm'>                                        
                                            <FaExternalLinkSquareAlt className='mb-1'/>
                                            <span style={{whiteSpace : 'pre'}}> View</span>                    
                                        </Button>    
                                    </Link>
                                    </Col>);
            if(this.props.type && this.props.type==='monitor')
            {
                UpdateDetails = ''
            }
            else if(this.props.type && this.props.type==='search')
            {
                ServerDetails = ''
            }
            
            if(this.props.type && this.props.type==='view')
            {
                ViewWorkflowButton = ''
                UpdateDetails = ''
            }
            
            return(          
            <div key={workflow.SERVER_NAME + '' + workflow.METASTORE_NAME + '' + workflow.WORKFLOW_ID}>
                    <Container fluid className="res_item"  style={{backgroundColor : wf_color.light,borderLeft: wf_color.dark + ' solid 4px'}}>
                        <Row className='justify-content-start'>
                            <Col lg='auto' md='auto'>
                                {workflow.WORKFLOW_ID}
                            </Col>
                            <Col  lg={5} md={5} style={{fontWeight : 'bold'}}>
                                {workflow.WORKFLOW_NAME}
                            </Col>
                            <Col  lg='auto' md='auto' style={{fontWeight : 'bold'}}>                                
                                {workflow.WORKFLOW_INSTANCE_STATUS}
                            </Col>                                                        
                            <Col lg='auto' md='auto' className='ml-auto justify-content-left'>                            
                                <div className="custom-control custom-switch" align='ef'>
                                    <input type="checkbox" className="custom-control-input" id={'monitor_' + index} style={{cursor : 'pointer'}} defaultChecked={workflowBeingMonitored} onClick={(e)=>this.toggleMonitor(e,{server_name :  workflow.SERVER_NAME, metastore_name : workflow.METASTORE_NAME, wf_id : workflow.WORKFLOW_ID})}/>
                                    <label className="custom-control-label" htmlFor={'monitor_' + index} style={{cursor : 'pointer'}} ><div>{((workflowBeingMonitored)?'Monitoring':'Monitor     ').replace(/ /g,'\u00a0')}</div></label>
                                </div>                              
                            </Col>
                            {ViewWorkflowButton}
                        </Row>
                        <br />
                        <Row  style={{opacity:1}}>
                            <Col  lg='auto' md='auto'><span className='gray_text'>DURATION </span>
                                {workflow.RUN_TIME_IN_MINS +' mins' }
                            </Col>
                            <Col lg='auto' md='auto'><span className='gray_text'>STARTED </span>
                                {workflow.START_DT} 
                            </Col>
                            <Col lg='auto' md='auto'><span className='gray_text'>ENDED </span>
                                {workflow.END_DT} 
                            </Col>              
                            <Col lg='auto' md='auto'>
                                {UpdateDetails}
                            </Col>    
                            <Col lg='auto' md='auto'>
                                {ServerDetails}                                          
                            </Col>   
                            <Col lg='auto' md='auto'><span className='gray_text'>INSTANCE </span>
                                {workflow.WORKFLOW_INSTANCE_ID} 
                            </Col>                                                                                                                                                                                                                                
                        </Row>                              
                    </Container>
            </div>);            
        });
        
        return (
            <div className=''>                
                {WorkflowList}
            </div>
        )
    }
}

const mapStateToProps =(state)=>
{       
    return {
       registeredMonitors : state.monitor.registeredMonitors
    }
    
}

const mapDispatchToProps =(dispatch)=>
{    
    return{
        mon_toggle : (toggleState,wf_details) => {            
            dispatch(mon_toggle(toggleState,wf_details));
        },
        view_toggle : (toggleState,wf_details) => {            
            dispatch(view_toggle(toggleState));
        }       
    }    
}
export default connect(mapStateToProps,mapDispatchToProps)(memo(WorkflowResult))