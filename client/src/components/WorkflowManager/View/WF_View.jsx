import React, { PureComponent, memo } from 'react'
import Toolbar from '@material-ui/core/Toolbar';
import { connect } from 'react-redux'
import WorkflowResult from '../Search/WorkflowResult'
import {setAlert,setViewMonitor,setRefreshInterval} from '../../../store/actions/viewActions'
import Alert from 'react-bootstrap/Alert';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ReactDOMServer from 'react-dom/server';
import ReviewRequestModal from './ReviewRequestModal';
import { FaChevronLeft } from 'react-icons/fa';
import {Link} from 'react-router-dom'
import ViewInstanceTable from './ViewInstanceTable';
import StageInfoTable from './StageInfoTable';
import DatasetsTable from './DatasetsTable';
import SourceEntityTable from './SourceEntityTable';
import SourceSystemTable from './SourceSystemTable';
import ActivateWorkflow from './ActivateWorkflow';
import WorkflowParamsTable from './WorkflowParamsTable';
import {Animated} from "react-animated-css";
import { Tooltip } from '@material-ui/core';
class WF_View extends PureComponent {
refreshTimeout;

    componentDidMount=()=>
    {
        this.props.setViewMonitor({
            server : this.props.match.params.server,
            metastore : this.props.match.params.metastore,
            wf_id : this.props.match.params.wf_id,
            auth : this.props.match.params.auth,
        })
        
    }     
    
    refreshChanged=(e,wf_details)=>
    {
        
        //Interval cannot be less than 7 seconds
        let interval = (e.target.value<=7)?7:(e.target.value);
        //Dispatch after one second        
        clearTimeout(this.refreshTimeout)        
        this.refreshTimeout =  setTimeout(()=>{
           this.props.setRefreshInterval(interval,wf_details)                 
        },1000)
    }

  
    render() {   
        
        let wf_details = {
            server : this.props.match.params.server,
            metastore : this.props.match.params.metastore,
            wf_id : this.props.match.params.wf_id,
            auth : this.props.match.params.auth,
        }
        let MyToolbar = (
                <Toolbar variant="dense" style={{backgroundColor: 'var(--primary_dark)'}}>     
                    <Tooltip title='Go back to Workflow Manager' placement='bottom'>
                        <Link to ='/wf_man' target='_self'>
                            <Row>
                                <Col lg={1} md={1} sm={1} style={{padding : '0.4rem'}}>
                                    <FaChevronLeft size='1.5em' color = '#ffffff'/>                                                                                            
                                </Col>
                                <Col lg='auto' md='auto' sm='auto' className='ml-2'>                                
                                    <span id='wf_title'>Workflow Viewer</span>                                    
                                </Col>                                
                            </Row>
                        </Link>             
                    </Tooltip>
                </Toolbar>
        );

        let LoadStatus = ''
        if(this.props.alert)
        {
            let msg = this.props.alert.msg
            if(!msg || !msg.length)
            {
                msg = 'Something\'s fishy :\\ Please contact admin. ERR : ALERT_EMPTY'
            }
            LoadStatus = (                 
                <div> 
                    {MyToolbar}
                    <Alert variant={this.props.alert.color}>{msg}</Alert>
                </div>                                       
            )           
            return LoadStatus 
        }     
        
       
      
        let WF_Detail_Template = ReactDOMServer.renderToString( <div align='left'>
                                        <div>
                                            <br/><br/>
                                            <b>Workflow Details :</b><br/><br/>
                                            <b>Link : </b><br/><a href={window.location.href}>{window.location.href}</a><br/><br/>
                                            <b>SERVER      : </b><br/>{wf_details.server}<br/>
                                            <b>METASTORE   : </b><br/>{wf_details.metastore}<br/>
                                            <b>WORKFLOW_ID : </b><br/>{wf_details.wf_id}<br/><br/>                                            
                                        </div>
                                    </div>)
        
        let LoadProgressBar = (<ProgressBar animated now={this.props.viewRefreshProgress} style={{height:'0.2rem',opacity : (this.props.viewRefreshProgress===0)?0:1}}/>)
        if(!this.props.loadComplete)
        {
            return (
                <div>
                    {MyToolbar} 
                    <br/>
                    {LoadProgressBar}  
                </div>
            );
        }        

        let IngestionFailure = '';
        if(this.props.failedStageCount && this.props.failedStageCount!==0)
        {
            IngestionFailure = (
                <div align='left' className='mt-2'>
                    <h5><span className='text-danger font-weight-bold'>{'Ingestion failed for ' + this.props.failedStageCount + ' file(s)'}</span></h5>
                </div>                
            )            
        }        

        let BlockStatus = '';                
        if(this.props.BlockStatus)
        {            
            let blockRows = this.props.BlockStatus;
            let block_reasons = []        
            
            if(blockRows.length>0)
                {                              
                    for(var i=0; i<blockRows.length; i++)
                    {
                        block_reasons.push(blockRows[i].BLOCKED_REASON)
                    }                         
                    BlockStatus =  <span className='text-danger'>{block_reasons.join(', ')}</span>                                        
                }              
                else
                {
                    //If there the workflow is not blocked and not executing, it implies
                    //that the workflow is waiting to be dispatched
                    BlockStatus =  <span className='font-weight-bold'><i>Awaiting Dispatch</i></span>
                }           
        }
        
        
        return (            
            <div align='center'>
                {MyToolbar}   
                <br />             
                <Animated animationIn="fadeIn" animationInDuration={500} isVisible={true}>
                    <div style={{zoom : 0.9, width:'90%'}} align='center' className='mb-5'>                    
                        <Row className='justify-content-start'  style={{zoom:0.9,marginRight:'-1.5rem',marginLeft : '0.5rem'}}>                                                            
                            <Col lg="auto" md="auto">                                                         
                                    {IngestionFailure}                            
                            </Col>      
                            <Col lg="auto" md="auto" className='ml-auto'>
                                <span>Refresh every </span>
                                <div className="btn-group">
                                    <input type="number" className="form-control" id="ref_box"  min={7} defaultValue={this.props.refreshInterval} onChange={(e)=>this.refreshChanged(e,wf_details)}/>
                                </div>
                                <span> seconds</span>
                            </Col>        
                        </Row>
                        <Row className='justify-content-center mt-2 mb-1 ml-1' >                    
                            <Col lg={12} md={12}>
                                {LoadProgressBar}
                            </Col>                                     
                        </Row>                                         
                        <WorkflowResult type='view' wf_list={this.props.workflowResult}/>                                                
                        <Row className='justify-content-start ml-2'  style={{zoom:0.9,marginRight :'-1.8rem'}}>
                            <Col lg='auto' md='auto' sm='auto'>
                            <b>                                          
                                {BlockStatus}
                            </b>                        
                            </Col>
                            <Col lg='auto' md='auto' sm='auto' className='ml-auto'>
                                <ReviewRequestModal                                                         
                                template = {WF_Detail_Template}                   
                                />
                            </Col>
                            <Col lg='auto' md='auto' sm='auto'>
                                <ActivateWorkflow  wf_details={wf_details} act_flag={(this.props.workflowResult && this.props.workflowResult[0].WF_ACTIVE_FLG===1)} disabled={(this.props.viewRefreshProgress===100)} postDispatchMethod={()=>this.props.setViewMonitor(wf_details)}/>
                            </Col>
                        </Row>    

                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <ViewInstanceTable wf_details={wf_details}/>
                            </Col>
                        </Row>       

                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <StageInfoTable wf_details={wf_details}/>
                            </Col>
                        </Row>     
                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <DatasetsTable/>
                            </Col>
                        </Row>                       
                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <SourceEntityTable/>
                            </Col>
                        </Row>    
                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <SourceSystemTable/>
                            </Col>
                        </Row>   
                        <Row className='justify-content-center'>
                            <Col lg={12} md={12} sm={12}>
                                <WorkflowParamsTable/>
                            </Col>
                        </Row>                    
                        
                     </div>     
                </Animated>
            </div>
        )
    }
}

const mapStateToProps  = (state) =>
{       
    return{
        workflowResult : state.view.latestInstance,                
        alert : state.view.alertView,
        refreshInterval : state.view.refreshInterval,
        viewRefreshProgress : state.view.viewRefreshProgress,
        loadComplete : state.view.loadComplete,
        failedStageCount : state.view.failedStageCount,
        BlockStatus : state.view.blockinfo
    }        
}
const mapDispatchToProps = (dispatch)=>
{
    return {      
        setViewMonitor : (wf_details)=>
        {
            dispatch(setViewMonitor(wf_details))
        },
        setRefreshInterval : (interval,wf_details) => 
        {            
            dispatch(setRefreshInterval(interval,wf_details));
        },
        setAlert : (msg,color) => 
        {            
            dispatch(setAlert(msg,color));
        }  
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(memo(WF_View))