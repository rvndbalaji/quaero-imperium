import React, { Component } from 'react'
import Col from 'react-bootstrap/Col'
import {Link} from 'react-router-dom'

class MenuCard extends Component {
    render() {
        return (
           <Col lg={3} md={3} sm={6} xs={12} className='animated fadeInUp delay-0s mb-2'>
               <div className="main_box justify-content-center" id="box_wfman" style={{backgroundImage : this.props.bg}} align="center">
                    <Link to={this.props.link} target="_self" className='hyperlink'>
                        <div className="box_title">                            
                            {this.props.title}
                        </div>  
                        <div>                            
                            {this.props.desc}
                        </div>
                    </Link>
                </div>     
           </Col>
        )
    }
}

export default MenuCard