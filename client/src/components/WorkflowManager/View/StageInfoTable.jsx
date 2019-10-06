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
import StageSelect from './StageSelect';

class StageInfoTable extends PureComponent {

fileSizeFormatter(cell, row) {    
    
    if (row.FILE_SIZE_BYTES) {       
         let final_size = cell;
         if(final_size==null) return (
             <span>
                 {final_size}
             </span> 
            );
         let decimals = 2;
         final_size = parseInt(final_size);  
         if (final_size === 0) return ('0 B');
        
         //Calculate
         const k = 1024;
         const dm = decimals < 0 ? 0 : decimals;
         const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
         const i = Math.floor(Math.log(final_size) / Math.log(k));
         final_size = parseFloat((final_size / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];

         return (<span>
                    {final_size}
                </span> 
            );
        }          
      
    }
    
    render() 
    {           
        let original_data = []
        

        //excluded ['SOURCE_ENTITY_ID',' FTP_ID',' FLE_ID','PARENT_FTP_ID']
        let init_col_list = ['DATASET_INSTANCE_ID','FILE_NM','FTP_STATUS','FLE_STATUS','DSI_STATUS','FILE_SIZE_BYTES']
                
        let finalColumns = []
        let selectedTableStoreName = 'selectedStageInfo';        
        let prevSelRow = this.props.selectedStageInfo;                                                       
        let alternate_name_map = {
            DATASET_INSTANCE_ID: 'DSI_ID',            
            FILE_NM: 'Name',            
            FILE_SIZE_BYTES : 'SIZE'
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
      

            let pagination = paginationFactory({
                sizePerPage : 6,
                alwaysShowAllBtns : true
            })
            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            original_data = this.props.data                 
            //Count number of ingestion/stage failures
            let fail_cnt = 0;
            for(var rowIndex in original_data)
            {                
                let fail_string_regex = new RegExp('.*FAIL.*','i');
                if((original_data[rowIndex]['FTP_STATUS'] && original_data[rowIndex]['FTP_STATUS'].match(fail_string_regex)) 
                || (original_data[rowIndex]['FLE_STATUS'] && original_data[rowIndex]['FLE_STATUS'].match(fail_string_regex))
                || (original_data[rowIndex]['DSI_STATUS'] && original_data[rowIndex]['DSI_STATUS'].match(fail_string_regex)))
                {
                    fail_cnt++;
                }    
            }       

            this.props.setFailedStageCount(fail_cnt);

            let selected_row= []        
            if(prevSelRow)
            {
                selected_row.push(prevSelRow.FTP_ID)               
            }            
            
            const rowClasses = (row, rowIndex) => {
                let classes = null;
                
                let fail_string_regex = new RegExp('.*FAIL.*','i');                
                if((original_data[rowIndex]['FTP_STATUS'] && original_data[rowIndex]['FTP_STATUS'].match(fail_string_regex)) 
                || (original_data[rowIndex]['FLE_STATUS'] && original_data[rowIndex]['FLE_STATUS'].match(fail_string_regex))
                || (original_data[rowIndex]['DSI_STATUS'] && original_data[rowIndex]['DSI_STATUS'].match(fail_string_regex)))
                {
                    classes = "stage_row text-danger font-weight-bold"                                                            
                }                           
                return classes;
            };            
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
                    let format = undefined;
                    if(col_name==='FILE_SIZE_BYTES')
                    {
                        format  = this.fileSizeFormatter;
                    }                    
                    
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
                            headerSortingStyle,
                            formatter : format
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
                    <StageSelect
                     selected_row = {prevSelRow}                     
                     wf_details = {this.props.wf_details}
                     />
                )
            }
            
            return (
            
            <ToolkitProvider
                keyField="FTP_ID"
                data={ original_data }
                columns={ finalColumns }
                columnToggle
                exportCSV
            >                   
            {

                props => (
                    <div>
                        <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Stage Info</h4>
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
                            keyField='FTP_ID' 
                            data={ original_data }                 
                            columns={ finalColumns } 
                            bordered={ false }
                            colStyle = {rowStyle}
                            wrapperClasses="table-responsive m-1" 
                            pagination={ pagination}
                            selectRow={ selectRow }
                            rowClasses = {rowClasses}
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
        selectedStageInfo : state.view.selectedStageInfo,
        data : state.view.stageInfo,
    }
    
}

const mapDispatchToProps = (dispatch)=>
{    
    return {      
        setSelectedRow : (tbl_name,sel_value)=>
        {
            dispatch({type : 'SET_SELECTED_ROW', tbl_name,sel_value })
        },
        setFailedStageCount : (failed_count)=>
        {
            dispatch({type : 'SET_FAILED_STAGE_COUNT', failed_count })
        },
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(memo(StageInfoTable))