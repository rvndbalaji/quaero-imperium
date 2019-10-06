import React, { PureComponent,memo } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

class PrecompileTable extends PureComponent {

    state = {
        typed_paramName : '',
        typed_paramValue : ''
    }
    getFilteredPrecompile()
    {
        let typed_paramName = this.state.typed_paramName.trim();
        let typed_paramValue = this.state.typed_paramValue.trim();
        let original_data = this.props.data;      
       
        var paramFilterItems = [];
        var valueFilterItems = [];            
        
            for(var i=0; i < original_data.length; i++)
            {
                if(typed_paramName && typed_paramName!=='' && (original_data[i].PARAM_NAME && (original_data[i].PARAM_NAME.toLowerCase()).includes(typed_paramName.toLowerCase())))
                {   
                    let cur = {                        
                        PARAM_NAME : original_data[i].PARAM_NAME,
                        PARAM_VALUE : original_data[i].PARAM_VALUE,
                        WORKFLOW_PACKAGE_NAME : original_data[i].WORKFLOW_PACKAGE_NAME,
                        WORKFLOW_PACKAGE_DESC : original_data[i].WORKFLOW_PACKAGE_DESC,
                    }
                    paramFilterItems.push(cur);
                }
                if(typed_paramValue && typed_paramValue!=='' && (original_data[i].PARAM_VALUE && (original_data[i].PARAM_VALUE.toLowerCase()).includes(typed_paramValue.toLowerCase())))
                {   
                    let cur = {                        
                        PARAM_NAME : original_data[i].PARAM_NAME,
                        PARAM_VALUE : original_data[i].PARAM_VALUE,
                        WORKFLOW_PACKAGE_NAME : original_data[i].WORKFLOW_PACKAGE_NAME,
                        WORKFLOW_PACKAGE_DESC : original_data[i].WORKFLOW_PACKAGE_DESC,
                    }
                    valueFilterItems.push(cur);
                }
            }     
            
            
        let final_items = [
            ...paramFilterItems,
            ...valueFilterItems
        ]
        if(final_items.length===0)
        {
            return original_data
        }
        return final_items
                    
    }

    handleChange(e)
    {                
        this.setState({
            [e.target.name] : e.target.value
        })
    }
    
    
    render() 
    {           
        let original_data = []      
        
        //excluded ['WORKFLOW_PACKAGE_DESC','WORKFLOW_PACKAGE_NAME']
        let init_col_list = ['PARAM_NAME','PARAM_VALUE']
                
        let finalColumns = []
        let alternate_name_map = {            
            PARAM_NAME : 'NAME',
            PARAM_VALUE : 'VALUE',
            WORKFLOW_PACKAGE_NAME : 'Package',
            WORKFLOW_PACKAGE_DESC : 'Description'       
        }

        let len = (this.props.data)?this.props.data.length:0;           
        
        if(this.props.inProgress)
        {
            return ('')
        }
        if(len<=0)
        {
            return (
                'Something went wrong while generating the params. No params were found'
            ) 
        } 
        else
        {       
            //-----------------------------------TABLE CONFIGURATION---------------------------
            //---------------------------------------------------------------------------------
           
            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            original_data = this.getFilteredPrecompile();     

             //Add unique ID to each row's UUID
             for(var rowIndex in original_data)
             {
                 original_data[rowIndex]['UUID'] = rowIndex;
             }       

            const selectRow = {
                mode: 'radio',                                
                hideSelectColumn: true,                
              };
                  
             
            //We'll remove columns with NULL rows
            //For each filtered column name, fetch that column's data and loop through to see if any
            //row has atleast one none-null value, if yes, add the column_config to finalColumns. 
            //indicating that the column has data. When such a nonNull col is found, immediately stop and skip to the next column
            //You dont need to check all the data, just the first occurence of a non-null value.
            //We check column wise and then check row-wise in top-down fashion            
            init_col_list.forEach(col_name => {

                finalColumns.push({
                    text : (alternate_name_map[col_name])?(alternate_name_map[col_name]):col_name,
                    dataField : col_name,
                    sort : true,                    
                    style: {wordBreak: 'break-all',width: '50%'},
                    headerSortingStyle
                })          

            });       
            
            const rowStyle = { 
                wordBreak: 'break-all'
            };

            return (
            
            <ToolkitProvider
                keyField="UUID"
                data={ original_data }
                columns={ finalColumns }                
                exportCSV
            >       
            {

                props => (
                    <div>                      
                        <Row className='ml-3'>     
                            <Col className='' style={{width:'50%'}}>                                                            
                                <Form.Control autoFocus type="text" name='typed_paramName' onChange={(e)=>this.handleChange(e)} placeholder='Name'/>                                
                            </Col>                                       
                            <Col className='ml-3' style={{width:'50%'}}>                                                            
                                <Form.Control type="text" name='typed_paramValue' onChange={(e)=>this.handleChange(e)} placeholder='Value'/>                                
                            </Col>                            
                        </Row>                               
                        
                        <BootstrapTable
                            
                            {...props.baseProps}
                            bootstrap4                 
                            hover                
                            condensed
                            keyField='UUID' 
                            data={ original_data }                 
                            columns={ finalColumns } 
                            colStyle = {rowStyle}
                            bordered={ false }                            
                            wrapperClasses="table-responsive m-1"                             
                            selectRow={ selectRow }
                        />                          
                       
                    </div>                      
                )       
            }
            </ToolkitProvider>    
            )   
        }
        
    }
}

export default memo(PrecompileTable)