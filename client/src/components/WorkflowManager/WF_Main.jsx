import React, { Component } from 'react'
import AnimatedLoadText from '../Elements/AnimatedLoadText';
import MiniDrawer from '../Elements/MiniDrawer';
import { setHostListener,fetchUserTitle, clearHostListener} from '../../store/actions/hostActions'
import { setMonitorListener,clearMonitorListener} from '../../store/actions/monitorActions'
import { clearViewRefresh } from '../../store/actions/viewActions'
import { clearServerRefresh } from '../../store/actions/serverActions'
import { connect } from 'react-redux'

class WF_Main extends Component {    
    componentDidMount()
    {
        //Dispatch the following actions
        //Register listener for monitors
         this.props.setHostListener()   
         this.props.setMonitorListener()                       
         this.props.fetchUserTitle()
    }
    componentWillUnmount()
    {
        //Stop all listeners, and refresh timers
        this.props.clearHostListener()
        this.props.clearMonitorListener()
        this.props.clearViewRefresh()
        this.props.clearServerRefresh()
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
        clearHostListener : ()=>
        {
            dispatch(clearHostListener())
        },
        clearViewRefresh : ()=>
        {
            dispatch(clearViewRefresh())
        },
        clearServerRefresh : ()=>
        {
            dispatch(clearServerRefresh())
        },
        clearMonitorListener : ()=>
        {
            dispatch(clearMonitorListener())
        },
        setMonitorListener : ()=>
        {
            dispatch(setMonitorListener())
        },
        fetchUserTitle : ()=>
        {
            dispatch(fetchUserTitle())
        }
    }
}



export default connect(mapStateToProps,mapDispatchToProps)(WF_Main)
