import React, { PureComponent,memo } from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { FaTh } from 'react-icons/fa';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import InstanceSelect from './InstanceSelect';
import { setSelectedRow } from '../../../store/actions/viewActions';
class ViewInstanceTable extends PureComponent {

    render() 
    {           
        let original_data = []
        //excluded ['UUID','WORKFLOW_ID','WORKFLOW_NAME','SERVER_NAME','METASTORE_NAME','OOZIE_JOB_URL','WF_ACTIVE_FLG',''WORKFLOW_TYPE','EVENT_GROUP_ID']
        let init_col_list = ['WORKFLOW_INSTANCE_ID','RUN_TIME_IN_MINS','WORKFLOW_INSTANCE_STATUS','FILE_NM','START_DT','END_DT','NUM_RECORDS_INSERTED','NUM_RECORDS_UPDATED','NUM_RECORDS_DELETED','INPUT_DATASET_INSTANCE','OUTPUT_DATASET_INSTANCE','DSI_IN_STATUS','DSI_OUT_STATUS']
                
        let finalColumns = []
        let selectedTableStoreName = 'selectedViewInstance';        
        let prevSelRow = this.props.selectedViewInstance;                                                       
        let alternate_name_map = {
            WORKFLOW_INSTANCE_ID : 'INSTANCE_ID',
            WORKFLOW_INSTANCE_STATUS : 'STATUS',
            WORKFLOW_TYPE : 'WF_TYPE',
            INPUT_DATASET_INSTANCE : 'IN_DSI',
            OUTPUT_DATASET_INSTANCE : 'OUT_DSI',
            NUM_RECORDS_INSERTED : 'ROWS_INS',
            NUM_RECORDS_UPDATED : 'ROWS_UPD',
            NUM_RECORDS_DELETED : 'ROWS_DEL',
            RUN_TIME_IN_MINS : 'MINS',
            DSI_IN_STATUS : 'IN_STATUS',
            DSI_OUT_STATUS : 'OUT_STATUS',
            EVENT_GROUP_ID : 'EVENT_GID',

        }

        let len = (this.props.data)?this.props.data.length:0;    
        const rowStyle = { 
            whiteSpace: 'pre-wrap'
        };

        if(len<=0)
        {
            return (
                <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Workflow Instances</h4>
                <span style={{color:'black'}}><i>This workflow has no instances. This is probably because it never ran</i></span>
                </div>                
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

            let pagination = paginationFactory({
                sizePerPage : 6,
                alwaysShowAllBtns : true
            })
            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            original_data = this.props.data     
            //Add unique ID to each row's UUID
            for(var rowIndex in original_data)
            {
                original_data[rowIndex]['UUID'] = original_data[rowIndex]['WORKFLOW_INSTANCE_ID'] + '' + original_data[rowIndex]['INPUT_DATASET_INSTANCE']+ '' + original_data[rowIndex]['OUTPUT_DATASET_INSTANCE'] + rowIndex                
            }       

            let selected_row= []        
            if(prevSelRow)
            {
                selected_row.push(prevSelRow.UUID)               
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
                    <InstanceSelect
                        selected_row = {prevSelRow}
                        wf_details = {this.props.wf_details}
                     />
                )
            }
            
            return (
            
            <ToolkitProvider
                keyField="UUID"
                data={ original_data }
                columns={ finalColumns }
                columnToggle
                exportCSV
            >       
            {

                props => (
                    <div className='mt-4'>
                        <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Workflow Instances</h4>
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
                            keyField='UUID' 
                            data={ original_data }                 
                            columns={ finalColumns } 
                            bordered={ false }
                            colStyle = {rowStyle}
                            wrapperClasses="table-responsive m-1" 
                            pagination={ pagination}
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
      selectedViewInstance : state.view.selectedViewInstance,
      data : state.view.allInstances,
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

export default connect(mapStateToProps,mapDispatchToProps)(memo(ViewInstanceTable))