import React, { PureComponent,memo } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { FaTh, FaUndo } from 'react-icons/fa';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'

class ErrorLogTable extends PureComponent {

    state = {
        typed_text : ''
    }
    getFilteredLogs()
    {
        let typed_text = this.state.typed_text.trim();
        let original_logs = this.props.data;
        if(typed_text==='')
        {
            return original_logs;
        }
        else
        {   
            var filtered_log = [];
            var def = {
                EVENT_ID : 0,
                EVENT_MSG : "The logs do not contain the text '" + typed_text + "'",
                DATE : '-'
            }
                 
            for(var i=0; i < original_logs.length; i++)
            {
                if((original_logs[i].EVENT_MSG.toLowerCase()).includes(typed_text.toLowerCase()))
                {   
                    var cur = {
                        EVENT_ID : original_logs[i].EVENT_ID,
                        EVENT_MSG : original_logs[i].EVENT_MSG,
                        DATE : original_logs[i].DATE
                    }
                    filtered_log.push(cur);
                }
            }
            if(filtered_log.length===0)
            {
                filtered_log.push(def);
            }
            return filtered_log;
       }
    }

    handleChange(e)
    {                
        this.setState({
            typed_text : e.target.value
        })
    }
    
    
    render() 
    {           
        let original_data = []      
        
        
      //  let init_col_list = ['DATE','EVENT_MSG']
                
        let finalColumns = []
        let alternate_name_map = {            
           EVENT_ID : 'ID',
           EVENT_MSG : 'MESSAGE',
           DATE : 'TIME'           
        }

        let len = (this.props.data)?this.props.data.length:0;           
        
        if(this.props.inProgress)
        {
            return ('')
        }
        if(len<=0)
        {
            return (
                'No logs were found for this instance. Logs of old workflow instances are automatically cleared'
            ) 
        } 
        else
        {       
            //-----------------------------------TABLE CONFIGURATION---------------------------
            //---------------------------------------------------------------------------------
            
            
            //const { ToggleList } = ColumnToggle;            
            const MyExportCSV = (props) => {
                const handleClick = () => {
                  props.onExport();
                };
                return (
                    <Button size='sm' className='custom_white_button' onClick={ handleClick }>                                        
                        <FaTh className='mb-1' size='1rem'/>
                        <span style={{whiteSpace : 'pre'}}>  Export CSV</span>                    
                    </Button>    
                );
              };

            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            original_data = this.getFilteredLogs();     

            const selectRow = {
                mode: 'radio',                                
                hideSelectColumn: true,                
              };
              const rowStyle = { 
                wordBreak: 'break-all'
            };
             
            //We'll remove columns with NULL rows
            //For each filtered column name, fetch that column's data and loop through to see if any
            //row has atleast one none-null value, if yes, add the column_config to finalColumns. 
            //indicating that the column has data. When such a nonNull col is found, immediately stop and skip to the next column
            //You dont need to check all the data, just the first occurence of a non-null value.
            //We check column wise and then check row-wise in top-down fashion            
            
                
                finalColumns.push({
                    text : (alternate_name_map['DATE'])?(alternate_name_map['DATE']):'DATE',
                    dataField : 'DATE',
                    sort : true,                    
                    headerSortingStyle
                });
            
                finalColumns.push({
                    text : (alternate_name_map['EVENT_MSG'])?(alternate_name_map['EVENT_MSG']):'EVENT_MSG',
                    dataField : 'EVENT_MSG',
                    sort : true,
                    style: {wordBreak: 'break-all'},
                    headerSortingStyle
                });
            
            
            return (
            
            <ToolkitProvider
                keyField="EVENT_ID"
                data={ original_data }
                columns={ finalColumns }                
                exportCSV
            >       
            {

                props => (
                    <div>                      
                        <Row className='ml-3'>     
                            <Col className='mr-4'>                                                            
                                <Button size='sm' variant='primary' onClick={ this.props.refreshCallback() }>                                        
                                    <FaUndo className='mb-1' size='1rem'/>
                                    <span style={{whiteSpace : 'pre'}}>  Refresh</span>                    
                                </Button>   
                            </Col>                                                                                     
                            <Col className='mr-4' style={{width:'73%'}}>                                                            
                                <Form.Control autoFocus type="text" name='log_srch' onChange={(e)=>this.handleChange(e)} placeholder='Search Logs'/>                                
                            </Col>
                            <Col>                                                            
                                <MyExportCSV { ...props.csvProps } />
                            </Col>
                        </Row>                               
                        
                        <BootstrapTable
                            
                            {...props.baseProps}
                            bootstrap4                 
                            hover                   
                            condensed     
                            keyField='EVENT_ID' 
                            data={ original_data }                 
                            columns={ finalColumns } 
                            bordered={ false }         
                            colStyle = {rowStyle}                   
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

export default memo(ErrorLogTable)