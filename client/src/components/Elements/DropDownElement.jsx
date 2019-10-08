import React, { Component } from 'react'
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { connect } from 'react-redux'
import { changeOption} from '../../store/actions/searchActions'
 class DropDownElement extends Component {
   
   handleItemSelect=(opt_name,opt_value)=>
   {
       //When an item is selected, update global state
       this.props.changeOption(opt_name,opt_value);            
   }  
  
   applyRegexIfExists =(reg_exp,originalText)=>{
       let finalText = originalText;
        if(reg_exp)
        {
            finalText =  originalText.replace(reg_exp,'');
        }
        return finalText;   
   }

   render() {                  
    
    var reg_exp = (this.props.replaceRegex)?new RegExp(this.props.replaceRegex,'i'):undefined;
    
    let itemList = this.props.item_list     
    
    let Items = itemList && itemList.map((item)=>
    {               
        let visible_name = this.applyRegexIfExists(reg_exp,item);             
     
        if(itemList.length===1)
        {
            //If theres only one element, select the first item in the list-->-----------V
            return(            
                <Dropdown.Item href='#'  key={this.props.option_name + '_' + item} onClick={()=>this.handleItemSelect(this.props.option_name,item)}>{visible_name}</Dropdown.Item>                                               
                );
        }
        else{
            return(
                <Dropdown.Item href='#' key={this.props.option_name + '_' + item} onClick={()=>{this.handleItemSelect(this.props.option_name,item)}}>{visible_name}</Dropdown.Item>                                               
                );
        }
                
    });
    
    let CaptionDiv = ''
    if(this.props.caption)
    {
            CaptionDiv =(<div>
                            <span className="gray_text">{this.props.caption}</span>
                        </div>);
    }

    
    
        return (  
            <div>
                {CaptionDiv}                                
                <DropdownButton className='custom_dropdown'  id={this.props.option_name} title={this.applyRegexIfExists(reg_exp,this.props.text)} disabled={this.props.DisableCondition}>                
                    {Items}
                </DropdownButton>                   
            </div>
        )
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

export default connect(undefined,mapDispatchToProps)(DropDownElement)
