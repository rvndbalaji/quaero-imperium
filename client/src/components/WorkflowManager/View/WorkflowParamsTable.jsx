import React, { PureComponent,memo } from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { FaTh } from 'react-icons/fa';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import EditParamModal from './EditParamModal';
import { setSelectedRow } from '../../../store/actions/viewActions';
class WorkflowParamsTable extends PureComponent {

    render() 
    {           
        let original_data = []      
        //excluded = ['WORKFLOW_PACKAGE_PARAM_ID']                 
        let init_col_list = ['PARAM_NAME','PARAM_VALUE','WORKFLOW_PACKAGE_NAME','WORKFLOW_PACKAGE_DESC']
                
        let finalColumns = []
        let selectedTableStoreName = 'selectedParam';        
        let prevSelRow = this.props.selectedParam;                                                       
        let alternate_name_map = {            
            PARAM_NAME : 'NAME',
            PARAM_VALUE : 'VALUE',
            WORKFLOW_PACKAGE_NAME : 'PACKAGE',
            WORKFLOW_PACKAGE_DESC : 'DESC'
        }

        let len = (this.props.data)?this.props.data.length:0;    
        const rowStyle = { 
            whiteSpace: 'pre-wrap'
        };

        if(len<=0)
        {
            return (
               ''              
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

            
            original_data = this.props.data     
            let selected_row= []        
            if(prevSelRow)
            {
                selected_row.push(prevSelRow.WORKFLOW_PACKAGE_PARAM_ID)               
            }                        

            const selectRow = {
                mode: 'radio',
                clickToSelect: true,
                selected : selected_row,
                hideSelectColumn: true,
                bgColor: '#d0d0d0',
                onSelect: (row, isSelect, rowIndex, e) => {
                    if(isSelect)
                    {                        
                        this.props.setSelectedRow(selectedTableStoreName,row)
                    }
                    else
                    {                        
                        this.props.setSelectedRow(selectedTableStoreName,undefined)
                    }
                  }               
              };
                  
             
            //We'll remove columns with NULL rows
            //For each filtered column name, fetch that column's data and loop through to see if any
            //row has atleast one none-null value, if yes, add the column_config to finalColumns. 
            //indicating that the column has data. When such a nonNull col is found, immediately stop and skip to the next column
            //You dont need to check all the data, just the first occurence of a non-null value.
            //We check column wise and then check row-wise in top-down fashion            
            init_col_list.forEach(col_name => {

                for(var rowIndex in original_data)
                {
                    let val = original_data[rowIndex][col_name]
                    if(val)
                    {                        
                        //We found a value in this column,
                        //This column will be displayed, so 
                        //add the column's configuration
                        finalColumns.push({
                            text : (alternate_name_map[col_name])?(alternate_name_map[col_name]):col_name,
                            dataField : col_name,
                            sort : true,
                            style: {whiteSpace : 'nowrap' },
                            headerSortingStyle
                        })           
                        break;
                    }                
                } 

            });       
            //Check if any row was selected, if yes display the row options
            let RowOptions = '';
        
            if(prevSelRow)
            {   
                RowOptions = (
                    <EditParamModal wf_details={this.props.wf_details} selected_row={prevSelRow} />
                )
            }
            
            return (
            
            <ToolkitProvider
                keyField="WORKFLOW_PACKAGE_PARAM_ID"
                data={ original_data }
                columns={ finalColumns }
                columnToggle
                exportCSV
            >       
            {

                props => (
                    <div className='mt-4'>
                        <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Workflow Parameters</h4>
                        </div>
                        <Row className='justify-content-start ml-2 mb-1 mr-2'>       
                            {RowOptions}                                                                                   
                            <Col className='ml-auto'>                                
                                <MyExportCSV { ...props.csvProps } />
                            </Col>
                        </Row>
                               {//  <ToggleList { ...props.columnToggleProps } />
                        } 
                        <BootstrapTable
                            
                            {...props.baseProps}
                            bootstrap4                 
                            hover                        
                            keyField='WORKFLOW_PACKAGE_PARAM_ID' 
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


const mapStateToProps =(state)=>
{    
    return {
        selectedParam : state.view.selectedParam,
        data : state.view.workflowParams,
    }
    
}

const mapDispatchToProps = (dispatch)=>
{    
    return {      
        setSelectedRow : (tbl_name,sel_value)=>
        {
            dispatch(setSelectedRow(tbl_name,sel_value))
        }
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(memo(WorkflowParamsTable))