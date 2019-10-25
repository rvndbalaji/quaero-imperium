import React, { PureComponent,memo } from 'react'
import { connect } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { FaTh } from 'react-icons/fa';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import { setSelectedRow } from '../../../store/actions/viewActions';
import EditEntityModal from './EditEntityModal';
class SourceEntityTable extends PureComponent {

    render() 
    {           
        let original_data = []      
        //excluded = ['CREATE_USER','CREATE_DT','UPDATE_USER','UPDATE_DT']                 
        let init_col_list = ['ID','ENTITY_NM','ENTITY_DESC','COLUMN_DELIMITER','ROW_DELIMITER','TEXT_QUALIFIER','SOURCE_FILE_MASK','INCLUDE_HEADER','NUM_HEADER_ROWS','FILE_FORMAT','FREQUENCY','FREQUENCY_DAYS','STAGE_STRATEGY','STAGE_TABLE_NM','NEXT_EXTRACT_VALUE','STAGE_PACKAGE_PATH','FILE_FORMAT_ID','CONTROL_FILE_FLG','CONTROL_FILE_EXT','CONTROL_FILE_DELIMITER','CONTROL_FILE_MASK','ALLOW_STRING_TRUNCATION','PRE_PROCESS_FUNCTION','DATABASE_HOST','DATABASE_NM','DATABASE_USERNAME','DATABASE_PASSWORD','REQUIRED_FLG','REQUIRED_DATE_DIFF','DOWNLOAD_ONLY_FLG','UNZIP_FILE_FLG','UNZIP_FILE_PASSWORD','STATUS','ACTIVE_FLG','STD_CONFIG_ID','MATCH_CONFIG_ID','DELETE_SOURCE_FILE_FLG','PARENT_SOURCE_ENTITY_ID','SOURCE_UOW_ID_FUNCT','SOURCE_LINEAGE_DT_FUNCT','HEADER_EXCLUDE_EXPRESSION','ROW_DELIM_ESCAPE_CHAR','COLUMN_DELIM_ESCAPE_CHAR','SYSTEM_ID','DATASET_ID']
                
        let finalColumns = []
        let selectedTableStoreName = 'selectedEntity';        
        let prevSelRow = this.props.selectedEntity;                                                       
        let alternate_name_map = {            
            FREQUENCY : 'FREQ',
            INCLUDE_HEADER : 'INCL_HEADER',
            ENTITY_NM : 'NAME',
            ENTITY_DESC : 'DESC',
            FREQUENCY_DAYS : 'FREQ_DAYS',
            NUM_HEADER_ROWS : 'HEADER_ROWS',
            COLUMN_DELIMITER : 'COL_DELIM',
            ROW_DELIMITER : 'ROW_DELIM',
            UNZIP_FILE_FLG : 'UNZIP_FLG'
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
                selected_row.push(prevSelRow.ID)               
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
        
             if(prevSelRow /*|| original_data.length===1*/)
             {
                 RowOptions = (
                    <EditEntityModal  wf_details={this.props.wf_details} selected_row={prevSelRow} excluded_cols={['ID','SYSTEM_ID','DATASET_ID','FILE_FORMAT']}/>
                 )
             }
            
            return (
            
            <ToolkitProvider
                keyField="ID"
                data={ original_data }
                columns={ finalColumns }
                columnToggle
                exportCSV
            >       
            {

                props => (
                    <div className='mt-4'>
                        <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Source Entities</h4>
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
                            keyField='ID' 
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
        selectedEntity : state.view.selectedEntity,
        data : state.view.entityResult,
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

export default connect(mapStateToProps,mapDispatchToProps)(memo(SourceEntityTable))