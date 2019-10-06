import React, { Component } from 'react'
import {Link} from 'react-router-dom'

class NotFound extends Component {
    render() {
        return (
            <div id="fnf" className="pt-3"  align="center">
                <h3>4O4</h3>
                <h3>Oops!</h3><br/><br/>
                <h2>Looks like you're lost, Quaeronaut :(</h2>
                <br/>
                <Link to="/"  style={{color:'white'}} target='_self'><h3><u>Fly me back home</u></h3></Link>                
            </div>
        )
    }
}
export default NotFound