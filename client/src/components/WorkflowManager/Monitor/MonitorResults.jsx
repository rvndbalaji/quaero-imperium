import React, { Component } from 'react'
import { connect } from 'react-redux'
import WorkflowResult from '../Search/WorkflowResult'
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
            <div className='mt-4' align='left'>                             
                <WorkflowResult type='monitor' filterSortOptions={this.props.filterSortOptions} wf_list={this.props.monitorResults}/>
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