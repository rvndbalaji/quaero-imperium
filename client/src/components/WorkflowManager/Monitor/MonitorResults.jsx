import React, { Component } from 'react'
import Col from 'react-bootstrap/Col'
import { connect } from 'react-redux'
import WorkflowResult from '../Search/WorkflowResult'
import RemoveAllMonitorsModal from './RemoveAllMonitorsModal'
class MonitorResults extends Component {

    render() {        
        if(!this.props.monitorResults || this.props.monitorResults.length<1)
        {
            if(!this.props.progressVisible)
            {
                return (                        
                    <div className='mt-5'> 
                        No workflows are being monitored<br/><br/>
                        Workflows marked in the Search section appear here.
                    </div>
                )
            }
            else
            {
                return (                        
                    <div className='mt-5'> 
                       Refreshing monitored workflows....
                    </div>
                )
            }
        }
        else{           
            
            return (                           
                
            <div>
                <Col lg="auto" md="auto" className='text-right' style={{zoom:0.85,marginRight:'-3.5rem'}}>
                    <RemoveAllMonitorsModal />
                </Col>         
                <div className='text-left'>
                    <WorkflowResult type='monitor' filterSortOptions={this.props.filterSortOptions} wf_list={this.props.monitorResults}/>
                </div>                                           
            </div>)
               
        }
        
    }
}


const mapStateToProps =(state)=>
{       
    return {        
        monitorResults : state.monitor.monitorResults,
        progressVisible : state.monitor.progressVisible
    }
    
}

export default connect(mapStateToProps)(MonitorResults)