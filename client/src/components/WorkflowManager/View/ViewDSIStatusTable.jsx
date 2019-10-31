import React, { PureComponent,memo } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {  } from 'react-bootstrap-table2-toolkit';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css'
import Button from 'react-bootstrap/Button';

class ViewDSIStatusTable extends PureComponent {
    
    
    state = {
        typed_text : '',
        selected_rows : [],
        all_selected : false
    }

    getFilteredDSIs()
    {
        let typed_text = this.state.typed_text.trim();
        let original_dsi = this.props.data;
        if(typed_text==='')
        {
            return original_dsi;
        }
        else
        {   
            var filtered_dsi = [];
            var def = {
                INSTANCE_ID : 0,
                STATUS : "The fields do not contain the text '" + typed_text + "'",
                OBJECT_URI : '-'
            }
                 
            for(var i=0; i < original_dsi.length; i++)
            {
                if((original_dsi[i].INSTANCE_ID && original_dsi[i].INSTANCE_ID.toLowerCase().includes(typed_text.toLowerCase())) ||
                   (original_dsi[i].STATUS && original_dsi[i].STATUS.toLowerCase().includes(typed_text.toLowerCase())) || 
                   (original_dsi[i].OBJECT_URI && original_dsi[i].OBJECT_URI.toLowerCase().includes(typed_text.toLowerCase())))
                {   
                    var cur = {
                        INSTANCE_ID : original_dsi[i].INSTANCE_ID,
                        STATUS : original_dsi[i].STATUS,
                        OBJECT_URI : original_dsi[i].OBJECT_URI
                    }
                    filtered_dsi.push(cur);
                }
            }
            if(filtered_dsi.length===0)
            {
                filtered_dsi.push(def);
            }
            return filtered_dsi;
       }
    }

    handleChange(e)
    {                
        this.setState({
            ...this.state,
            typed_text : e.target.value
        })
    }

    render() 
    {           
        let original_data = []      
        //excluded = []                 
        let init_col_list = ['INSTANCE_ID','STATUS','OBJECT_URI']
                
        let finalColumns = []                
        let alternate_name_map = {            
        
        }

        let len = (this.props.data)?this.props.data.length:0;             
        const rowStyle = { 
            whiteSpace: 'pre-wrap'
        };
        if(this.props.inProgress)
        {
            return ('')
        }
        if(len<=0)
        {
            return (
                'No DSIs available for this Dataset'
            ) 
        } 
        else
        {       
            //-----------------------------------TABLE CONFIGURATION---------------------------
            //---------------------------------------------------------------------------------
            
            
          
            const headerSortingStyle = { backgroundColor: 'var(--primary_light)' };
            
            //---------------------------------------------------------------------------------

            
            
            original_data = this.getFilteredDSIs();                               

            const selectRow = {
                mode: 'checkbox',
                clickToSelect: true,
                selected : this.state.selected_rows,
                //hideSelectColumn: true,
                bgColor: '#d0d0d0',
                selectColumnStyle:() => {
                   return {
                       padding : '0.5rem'
                   }             
                  },
                  headerColumnStyle: (status) => {                    
                    return {
                        padding : '0.5rem'
                    };
                  },
                onSelect: (row, isSelect, rowIndex, e) => {
                    if(isSelect)
                    {         
                        this.setState({
                            ...this.state,
                            selected_rows : [...this.state.selected_rows,row.INSTANCE_ID],
                            all_selected : false
                        })                                          
                    }
                    else
                    {                        
                        let current_rows = this.state.selected_rows;
                        let new_rows = []
                        current_rows.forEach(inst_id => {
                            if(inst_id!==row.INSTANCE_ID)
                            {
                                new_rows.push(inst_id)
                            }
                        });
                        this.setState({
                            ...this.state,
                            selected_rows : [...new_rows],
                            all_selected : false
                        })                        
                    }
                  },
                  onSelectAll: (isSelect, rows, e) => {

                    let all_rows = []
                    rows.forEach(ind_row => {
                        all_rows.push(ind_row.INSTANCE_ID)
                    });                    
                    
                    if(isSelect)
                    {
                        this.setState({
                            ...this.state,
                            selected_rows : all_rows,
                            all_selected : true
                        })
                    }
                    else
                    {
                        this.setState({
                            ...this.state,
                            selected_rows : [],
                            all_selected : false
                        })
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
                RowOptions = (                                          
                    <Row className='ml-3 mb-2'>                                                     
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>
                                <span style={{whiteSpace : 'pre'}}>READY</span>                    
                            </Button>
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>ERROR</span>                    
                            </Button>                        
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>EMPTY</span>                    
                            </Button>
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>PENDING</span>                    
                            </Button>                        
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>EXPIRED</span>                    
                            </Button>                        
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>PENDING-DELETE</span>                    
                            </Button>
                        </div>
                        <div className='col-lg-auto col-md-auto col-sm-auto'>
                            <Button size='sm' variant='primary' disabled={this.state.selected_rows.length<=0} style={{zoom:0.9}} onClick={()=>this.props.modifyStatusCallback(this.state.all_selected,2,this.state.selected_rows)}>                                                                    
                                <span style={{whiteSpace : 'pre'}}>DELETED</span>                    
                            </Button>                        
                        </div>
                    </Row>                   
                  )
            
            
            return (
            
            <ToolkitProvider
                keyField="INSTANCE_ID"
                data={ original_data }
                columns={ finalColumns }                                
            >       
            {

                props => (
                    <div>                                              
                        {RowOptions}                        
                        <Row className='ml-3 justify-content-start'>     
                            <Form.Control autoFocus type="text" name='log_srch' onChange={(e)=>this.handleChange(e)} placeholder='Search DSI, Status or Object URI'/>                                
                        </Row>                               
                        
                        
                        <BootstrapTable
                            
                            {...props.baseProps}
                            bootstrap4                 
                            hover                   
                            condensed     
                            keyField='INSTANCE_ID' 
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

export default (memo(ViewDSIStatusTable))