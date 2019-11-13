import React, { Component } from 'react'
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { changeOption} from '../../../store/actions/searchActions'
import Form from 'react-bootstrap/Form';
import DropDownElement from '../../Elements/DropDownElement';
import { connect } from 'react-redux'

 class SearchOptions extends Component {

    wf_where_list = ['WORKFLOW_ID','WORKFLOW_NAME','WORKFLOW_DESC','WORKFLOW_INSTANCE_ID','ACTIVE_FLG','CREATE_USER','UPDATE_USER']                                             
    wf_order_list = ['WORKFLOW_ID','WORKFLOW_NAME','WORKFLOW_DESC','WORKFLOW_INSTANCE_ID','RUN_TIME_IN_MINS','UPDATE_DT','START_DT','END_DT','ACTIVE_FLG','UPDATE_USER']       
        

    dispatchKeystroke =(e) =>
    {   
        //Dispatch a search action when user presses Enter
        if(e.key==='Enter')
        {
            this.props.changeOption('selectedSearchText',e.target.value)
        }
        
    }
    render() 
    {           
        let host_names = []                
        let host_keys = []    
        let host_nicknames = []        
        let serverDisplayText = this.props.options.selectedServer;      
        if(this.props.host_list)
        {
            host_keys = Object.keys(this.props.host_list);              
            host_keys.forEach(element => {
                let nickname = this.props.host_list[element].nickname
                host_nicknames.push(nickname)

                let name = this.props.host_list[element].host
                host_names.push(name)

                if(element===this.props.options.selectedServer)
                {
                    serverDisplayText = nickname
                }
            });            
        }
        
        if(host_names.length<1)
        {
            serverDisplayText = 'No servers configured'
        }

        let metastore_list = this.props.metastoreList;
             
        
        return (
            <Row style={{ zoom:'0.9'}}>
                <Col lg="auto" md="auto" sm="auto" xd="auto" align="left">                                            
                    <DropDownElement option_name='selectedServer' caption="Select" item_list={host_keys} item_list_altname={host_nicknames} text={serverDisplayText}  DisableCondition={(host_names.length<1)}></DropDownElement>                                    
                </Col>
                <Col lg="auto" md="auto" sm="auto" xd="auto" align="left">                                            
                    <DropDownElement replaceRegex='_metastore$' option_name='selectedMetastore' caption="using" item_list={metastore_list} text={this.props.options.selectedMetastore}  DisableCondition={(this.props.options.selectedServer==='Select server' || this.props.metastoreList.length<1)} ></DropDownElement>
                </Col>
                <Col lg="auto" md="auto" sm="auto" xd="auto" align="left">                                            
                    <DropDownElement  option_name='selectedWorkflowColumn' caption="where column"  item_list={this.wf_where_list} text={this.props.options.selectedWorkflowColumn}  DisableCondition={(this.props.options.selectedMetastore==='Select metastore')}></DropDownElement>                                    
                </Col>               

                <Col>                    
                    <div align='left'>
                        <span className="gray_text">matches pattern %%</span>
                    </div>                                   
                    <Form.Control autoFocus type="text" defaultValue=''  name='srch_text' onKeyDown={(e)=>this.dispatchKeystroke(e)} disabled={(this.props.options.selectedMetastore==='Select metastore')}/>                    
                </Col>

                <Col lg="auto" md="auto" sm="auto" xd="auto" align="left">                                            
                    <DropDownElement  option_name='selectedSortColumn' caption="order by column" item_list={this.wf_order_list} text={this.props.options.selectedSortColumn}  DisableCondition={(this.props.options.selectedMetastore==='Select metastore')}></DropDownElement>
                </Col>
                <Col lg="auto" md="auto" sm="auto" xd="auto" align="left">                                            
                    <div>
                        <span className="gray_text">asc/desc</span>
                    </div>
                    
                    <Button className = 'custom_white_button' onClick={()=>this.props.changeOption('selectedSortOrder',((this.props.options.selectedSortOrder==='asc')?'desc':'asc'))} disabled={(this.props.options.selectedMetastore==='Select metastore')}>{this.props.options.selectedSortOrder.toUpperCase()}</Button>                                    
                </Col>          
            </Row>
        )
    }
}

const mapStateToProps =(state)=>
{       
    return {
        host_list : state.host.hosts,
        metastoreList : state.search.metastoreList,
        options : state.search.options
    }
    
}

const mapDispatchToProps =(dispatch)=>
{    
    return{
        changeOption : (opt_name,opt_value) => {            
            dispatch(changeOption(opt_name,opt_value));
        }       
    }    
}

export default connect(mapStateToProps,mapDispatchToProps)(SearchOptions)