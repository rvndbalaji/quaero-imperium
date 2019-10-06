import React from 'react';
import Image from 'react-bootstrap/Image';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import {Link} from 'react-router-dom'
import quaero_logo from '../../images/q_logo_full.png'
import { connect } from 'react-redux'
import { performLogOut } from '../../store/actions/authActions';
class Banner extends React.Component
{
    LogOut = ()=>
    {
        this.props.performLogOut();
    }

    render()
    {
        var title = this.props.title;
        if(!this.props.title)
        {
            title = 'Quaero Imperium';
        }

        let LogOutButton = '';
        if(this.props.authUser)
        {
            LogOutButton= (<div className="col-auto align-content-right">
               <button type="button" className="btn btn-primary" onClick={this.LogOut}>Log Out</button>
              </div>);
        }
        return(
            <Jumbotron fluid>   
                <Container>
                <div className="jumbo_text section">
                    <Link to="/" target='_self' className="hyperlink">
                        <div className="animated fadeInDown">                            
                            <Image src={quaero_logo} width="150rem" fluid  />
                            <h1 id="title">{title}</h1>
                        </div>
                    </Link>
                    <span id="my_subtitle" className="animated fadeInDown delay-1s">"I seek control"</span><br />          
                    <div className="row justify-content-end" id="small_menu">                        
                        {LogOutButton}
                    </div>
                </div>
                </Container>
            </Jumbotron>
        );
    }
}

const mapStateToProps = (state)=>
{
    return  {
        authUser : state.auth.authUser
    }
}

const mapDispatchToProps = (dispatch)=>
{
    return  {
        performLogOut : ()=>{
            dispatch(performLogOut())
        }
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(Banner);