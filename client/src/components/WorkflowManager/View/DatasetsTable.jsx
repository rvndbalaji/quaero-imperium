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
import ViewDSIStatusModal from './ViewDSIStatusModal';
class DatasetsTable extends PureComponent {

    render() 
    {           
        let original_data = []        

               
        let init_col_list = ['TYPE','DATASET_ID','DATASET_NAME','DATASET_DESC','OBJECT_NAME','OBJECT_TYPE','OBJECT_SCHEMA','HOST_ID','EXPIRATION_CONDITION','PRIMARY_KEY_COLUMNS','DATA_COLUMNS','PARTITION_COLUMNS','ACTIVE_FLG']
                
        let finalColumns = []
        let selectedTableStoreName = 'selectedDataset';        
        let prevSelRow = this.props.selectedDataset;                                                       
        let alternate_name_map = {            
            DATASET_NAME : 'NAME',
            DATASET_DESC : 'DESC',
            OBJECT_TYPE : 'OBJ_TYPE',
            OBJECT_SCHEMA : 'OBJ_SCHEMA',
            OBJECT_NAME : 'OBJ_NAME',
            PRIMARY_KEY_COLUMNS : 'PRIMARY_COLS',
            DATA_COLUMNS : 'DATA_COLS',
            PARTITION_COLUMNS : 'PARTITION_COLS',
            ACTIVE_FLG : 'ACTIVE'
        }

        let len = (this.props.data)?this.props.data.length:0;    
        const rowStyle = { 
            whiteSpace: 'pre-wrap'
        };

        if(len<=0)
        {
            return (
                <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Datasets</h4>
                <span><i>This workflow has no input/output datasets</i></span>
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
            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            original_data = this.props.data     
            
            let selected_row= []      
            //Check if any row was selected, if yes display the row options
            let RowOptions = '';  
            if(prevSelRow)
            {
                selected_row.push(prevSelRow.DATASET_ID)                               
                RowOptions = (
                    <ViewDSIStatusModal selected_row={prevSelRow} wf_details={this.props.wf_details} />
                )
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
            
            
            return (
            
            <ToolkitProvider
                keyField="DATASET_ID"
                data={ original_data }
                columns={ finalColumns }
                columnToggle
                exportCSV
            >       
            {

                props => (
                    <div className='mt-4'>
                        <div align='left'  style={{color : 'var(--secondary_dark)',marginLeft : '0.4rem'}}> 
                            <h4>Datasets</h4>
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
                            keyField='DATASET_ID' 
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
        selectedDataset : state.view.selectedDataset,
        data : state.view.datasets,
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

export default connect(mapStateToProps,mapDispatchToProps)(memo(DatasetsTable))