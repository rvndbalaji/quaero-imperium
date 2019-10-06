import React from 'react';
import {connect} from 'react-redux';
import {performLoginWithUser} from '../../store/actions/authActions'
import AnimatedLoadText from '../Elements/AnimatedLoadText';

export function requireAuth(Component) {

    class AuthenticatedComponent extends React.Component {
               
        componentDidMount()
        {
            this.checkAuth();
        }
        componentDidUpdate()
        {
            this.checkAuth();
        }

        checkAuth=()=>
        {              
           //Check if user is authenticated, else, redirect
           if(!(this.props.authUser && this.props.authUser.uid))
           {   
               if(this.props.tryLogin && this.props.tryLogin===true)  
               {                          
                //console.log('Re-Login')
                this.props.performLoginWithUser();
               }
               else
               {
                //console.log('Redirect')
                this.props.history.push('users/login');                              
               }
           }   
           
        }
        
        render() {            

            if(this.props.authUser && this.props.authUser.uid)
            {                
                return <Component {...this.props}/>   
            }                  
            else
            {                   
                return <AnimatedLoadText text="Just a sec..." style={{color : 'var(--primary_dark)'}}/>;
            }                       
        }
    }

    const mapStateToProps = (state => {                
        return {
            authUser: state.auth.authUser,
            tryLogin: state.auth.tryLogin        
        }
        
    });    
    
    
    const mapDispatchToProps =(dispatch)=>
    {    
        return{
            performLoginWithUser : () => {            
                dispatch(performLoginWithUser());
            }       
        }    
    }
    return connect(mapStateToProps,mapDispatchToProps)(AuthenticatedComponent);

}