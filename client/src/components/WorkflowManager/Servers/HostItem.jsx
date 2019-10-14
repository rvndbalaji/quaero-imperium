import React, { Component,memo} from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container';
import { connect } from 'react-redux'
import {getIDToken} from '../../Auth/getIDToken'
import {  FaPlay ,FaStop} from 'react-icons/fa'
import axios from 'axios'
import {getJobStats} from '../../../store/actions/serverActions'
import ProgressBar from 'react-bootstrap/ProgressBar';
class HostItem extends Component {

    state = {
        inProgress : false,
        editMode : false
    }

    restructureJobResult(jobs)
    {        
        let serverJobs = {}
        jobs.forEach(element => {
            serverJobs[element.METASTORE] = {
                ...serverJobs[element.METASTORE],
                [element.NAME] : {
                    ...[element.NAME],
                    STATUS : element.JOB_STATUS,
                    ENABLED : element.ENABLED,
                    RUNNING : element.RUNNING
                }
            }
        });
        return serverJobs
    }

   shouldComponentUpdate(nextProps)
   {        
       
        if(this.state.inProgress)
        {
           this.setState({
               editMode : false,
               inProgress : false
           })
           return false
        }
        return true
   }

    toggleJob(host_name,auth_type,job_name,act_flag)
    {
        this.setState({
            ...this.state,
            inProgress : true
        })
        getIDToken().then(token=>
            {                
                
                axios.defaults.headers.common['Authorization'] = token
                axios.post('/wf_man/toggleJob',{                    
                    server : host_name,
                    auth_type,
                    db : 'msdb', 
                    schema:'dbo', 
                    job_name,
                    act_flag
                }).then(res =>{
                    //let resp = res.data
                   
                    this.props.getJobStats()
                    
                }).catch(err =>
                {
                    this.props.getJobStats()
                });             
            });   
    }
    
    toggleEdit(e)
    {        
        this.setState({ 
            ...this.state,
            editMode : e.target.checked
        })        
    }

    render() {

        if(!this.props.jobs)
        {
            return (
                <div>
                    Loading....
                </div>
            )
        }
        else
        {
            let host = this.props.host;
            let jobs = this.props.jobs            
            jobs =  this.restructureJobResult(jobs);      
            let metastore_list = Object.keys(jobs)
            
            let MetastoreJobs = (metastore_list && metastore_list.map((metastore_name,index) =>{

                let job_names = Object.keys(jobs[metastore_name])                
                let JobList = (job_names && job_names.map((job_name,index) =>{   
                let job_status = jobs[metastore_name][job_name]['STATUS']
                let showStart = true;                
                let buttonDisabled = false;
                switch(job_status)
                {
                    case 'Unknown' :
                            showStart = true;
                            break;
                    case 'Executing'  :
                            showStart = false;
                            buttonDisabled = false
                            break;
                    case 'Waiting for thread' :
                            showStart = false;                            
                            buttonDisabled = true
                            break;
                    case 'Between retries' :
                            showStart = false;
                            buttonDisabled = true
                            break;
                    case 'Idle' :
                            showStart = true;
                            buttonDisabled = false
                            break;
                    case 'Suspended' :
                            showStart = true;
                            buttonDisabled = false
                            break;
                    case 'Performing completion actions' :
                            showStart = false;
                            buttonDisabled = true
                            break;
                    default :
                }
                let ActionButton = ''
                if(showStart)
                {
                    ActionButton = (  <Button size='sm' variant='light' className='btn btn-outline-success' disabled={buttonDisabled || this.state.inProgress || !this.state.editMode} onClick={()=>this.toggleJob(host.host,host.auth_type,job_name,1)}>
                                        <FaPlay className='mb-1'/>
                                        <span style={{whiteSpace : 'pre'}}>  Start</span>                    
                                      </Button>     
                                    )
                }
                else
                {
                    ActionButton = (  <Button size='sm' variant='light' className='btn btn-outline-danger' disabled={buttonDisabled || this.state.inProgress || !this.state.editMode} onClick={()=>this.toggleJob(host.host,host.auth_type,job_name,0)}>
                                        <FaStop className='mb-1'/>
                                            <span style={{whiteSpace : 'pre'}}>  Stop</span>                    
                                      </Button>     
                                 )
                }
                    return (
                        <Row key={job_name} className='ml-4 p-1 gray_hover'>
                            <Col>
                            <span className={(showStart)?'text-danger':''}>{job_name.replace(metastore_name,'').replace('QDMP','').trim()}</span>
                            </Col>
                            <Col>
                                <span className={((showStart)?'text-danger':'') + ' font-weight-bold'}>{job_status}</span>
                            </Col>
                            <Col>
                                {ActionButton}
                            </Col>
                        </Row>
                    )
                }))

                return (                
                    <Row key={metastore_name} className='m-4'>
                        <Col>
                            <span className='gray_text'><b>{metastore_name.replace('_metastore','')}</b></span>
                            {JobList}
                        </Col>                        
                    </Row>               
                )
            }))

            let mem = this.props.mem;
            let color = 'primary'
            if(mem<=40)
            {
                color = 'success'
            }            
            else if(mem<=80)
            {
                color = 'primary'
            }
            else if(mem<=100)
            {
                color = 'danger'
            }
            let ProgressIndicator = (mem)?(<div><small>RAM</small><ProgressBar variant={color} now={mem} label={mem.toFixed(2) + '%'}/></div>):'';
            
            let EditModeText = 'Allow me to start/stop jobs'
            if(this.state.editMode)
            {
                EditModeText = (
                    <span>Allow me to start/stop jobs<span className='text-danger font-weight-bold'> (WARNING : Dangerous action)</span></span>
                )
            }
            return (
                <Container fluid >
                    <Row>
                        <Col lg={3} sm={3} md={3}>
                            <b>{host.host}</b>
                        </Col>                                                                     
                    </Row>    
                    <Row className='mt-2 justify-content-start'>                        
                        <Col lg={4} sm={4} md={4}>
                            {ProgressIndicator} 
                        </Col>                                                
                    </Row>                   
                    <Row>
                        <Col lg='auto' sm='auto' md='auto' className='ml-auto'>
                                    <div className="custom-control custom-switch" align='ef'>
                                                <input type="checkbox" className="custom-control-input" id={'edit_mode'+host.host} style={{cursor : 'pointer'}} checked={this.state.editMode} onChange={(e)=>this.toggleEdit(e)}/>
                                                <label className="custom-control-label" htmlFor={'edit_mode'+host.host} style={{cursor : 'pointer'}} ><div>{EditModeText}</div></label>
                                    </div>   
                        </Col>
                    </Row>
                       {MetastoreJobs}                 
                </Container>
            )
        }
    }
}


const mapDispatchToProps = (dispatch)=>
{
    return  {
        getJobStats : ()=>{
            dispatch(getJobStats())
        }
    }
}
export default connect(undefined,mapDispatchToProps)(memo(HostItem))