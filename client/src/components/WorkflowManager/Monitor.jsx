import React, { Component } from 'react'
import Container from 'react-bootstrap/Container';
import FilterMenu from './Monitor/FilterMenu';
import MonitorResults from './Monitor/MonitorResults';

 class Monitor extends Component {
    

    state = {
        order_col : 'WORKFLOW_ID',
        order_by : 'asc',
        filter_exclude : {
            complete : false,
            failed : false,
            running : false
        }
    }

    handleOrderColChange=(item)=>
    {
        this.setState({
            order_col : item
        })
    }
    handleOrderByChange=(item)=>
    {
        this.setState({
            order_by : (item==='asc')?'desc':'asc'
        })
    }

    updateFilter=(filter_name,filter_value)=>
    {        
        this.setState({
            filter_exclude : {
                ...this.state.filter_exclude,
                [filter_name] : !filter_value
            }
        })
    }
    
        render() {                        
        return (
                <Container fluid className="sec_body mt-2" align="center">                    
                    <div className="body_content">                        
                        <Container fluid>                                                       
                              <FilterMenu sortOptions={this.state} orderColFunc = {this.handleOrderColChange} orderByFunc = {this.handleOrderByChange} updateFilter = {this.updateFilter}></FilterMenu>                              
                              <MonitorResults filterSortOptions={this.state}></MonitorResults>
                        </Container>                        
                    </div>                                                             
                </Container>            
        )
    }
}

export default Monitor;