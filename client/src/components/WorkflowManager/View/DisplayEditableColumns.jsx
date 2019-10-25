import React, { Component,memo } from 'react'
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
class DisplayEditableColumns extends Component {
    render() {
        let sel_rows = this.props.selected_row
        let excluded_fields = (this.props.excluded_rows)?this.props.excluded_rows:[]
        let field_names = (sel_rows)?Object.keys(sel_rows):[]        
        let fieldValuePair = field_names.map((field_name,index)=>
        {
            //Skip columns specified in excluded_fields array
            if(excluded_fields.includes(field_name))
            {
                return false
            }
            //Replace underscores with space so the field breaks up when its long
            let field_name_spaced = field_name.replace(/_/g,' ')            
            return (  
                <div key={field_name}>
                    <Row className='m-1'>                
                        <div className="col-md-2 p-1">
                            <span>{field_name_spaced}</span>
                        </div>
                        <div className="col-md-10">
                            <Form.Control type="text" placeholder="NULL" defaultValue={sel_rows[field_name]} onChange={(e)=>this.props.keyValueCallback(field_name,e.target.value)}/>
                        </div>                                    
                    </Row>                    
                    <hr />
                </div>                
            )
        });

        return (
            <div>
                {fieldValuePair}
            </div>          
        )
    }
}

export default memo(DisplayEditableColumns)
