import React, { Component } from 'react'
import AnimatedLoadText from '../Elements/AnimatedLoadText';
import MiniDrawer from '../Elements/MiniDrawer';
import { setHostListener} from '../../store/actions/hostActions'
import { setMonitorListener} from '../../store/actions/monitorActions'
import { connect } from 'react-redux'

class WF_Main extends Component {    
    componentDidMount()
    {
        //Dispatch the following actions
        //Register listener for monitors
         this.props.setHostListener()   
         this.props.setMonitorListener()                       
       
    }
    render() {                
        if(this.props.isLoading)
        {
            return (<AnimatedLoadText text="Getting ready..."  style={{color : 'var(--primary_dark)'}}/>);
        }
        else {  
            return <MiniDrawer></MiniDrawer>                
        }
    }
}

const mapStateToProps  = (state) =>
{       
    return{
        isLoading : state.host.isLoading
    }        
}
const mapDispatchToProps = (dispatch)=>
{
    return {
        setHostListener : ()=>
        {
            dispatch(setHostListener())
        },
        setMonitorListener : ()=>
        {
            dispatch(setMonitorListener())
        }
    }
}



export default connect(mapStateToProps,mapDispatchToProps)(WF_Main)
