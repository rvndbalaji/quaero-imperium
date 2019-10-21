import React, { Component } from 'react'
import { connect } from 'react-redux'
import Alert from 'react-bootstrap/Alert'
import WorkflowResult from './WorkflowResult'
import {Animated} from "react-animated-css";
class SearchResults extends Component {

  
    render() {
        if(this.props.alert)
        {
            let msg = this.props.alert.msg
            if(!msg || !msg.length)
            {
                msg = 'Something\'s fishy :\\ Please contact admin. ERR : ALERT_EMPTY'
            }
            return ( 
                <Animated animationIn="fadeIn" animationInDuration={500} isVisible={true}>
                    <div className='mt-5'> 
                        <Alert variant={this.props.alert.color}>{msg}</Alert>
                    </div>                                       
                </Animated>
            )            
        }        
        let InfoText = 'Search for workflows and filter them from above'                
        if(!this.props.host_list || Object.keys(this.props.host_list).length===0)
        {
            InfoText = 'No hosts have been configured. Add a host in Settings'        
        }        
        if(!this.props.workflowResults)
        {
            return (                        
                <div className='mt-5'> 
                    {InfoText}
                </div>
            )
        }
     
        else{           
            let timeTaken = ((this.props.timeTaken)/1000).toFixed(2);
            let len = this.props.workflowResults.length;
            let limit_reached = (len===100)?(<i><br /><span className='gray_text ml-3'>Enter a specific search pattern for more results</span></i>):''
            return (                
            <div className='mt-4' align='left'> 
                <span className='gray_text ml-3'><b>{len} workflows found | {timeTaken} sec</b></span>
                {limit_reached}                                    
                <Animated animationIn="fadeIn" animationInDuration={500} isVisible={true}>
                    <WorkflowResult type='search' wf_list={this.props.workflowResults}/>   
                </Animated>                 
                    
            </div>)
               
        }
        
    }
}


const mapStateToProps =(state)=>
{       
    return {
        host_list : state.host.hosts,
        alert : state.search.alertSearch,
        workflowResults : state.search.workflowResults,
        timeTaken : state.search.timeTaken
    }
    
}

export default connect(mapStateToProps)(SearchResults)