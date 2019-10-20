import React, { Component } from 'react'
import Col from 'react-bootstrap/Col'
import {Link} from 'react-router-dom'

class MenuCard extends Component {
    render() {

        let Content = (
            <div>
                <div className="box_title">                            
                    {this.props.title}
                </div>  
                <div>                            
                    {this.props.desc}
                </div>
            </div>
        )

        let Linker = (
            <Link to={this.props.link}  target={this.props.target || '_self'} className='hyperlink'>
                {Content}
            </Link>
        )
        if(this.props.target && this.props.target==='_blank')
        {
            Linker = (
                <Link to={this.props.link} onClick={(event) => {event.preventDefault(); window.open(this.props.link)}} target='_blank' className='hyperlink'>
                    {Content}
                </Link>
            )
        }

        
      
        return (
           <Col lg={3} md={3} sm={6} xs={12} className='animated fadeInUp delay-0s mb-2'>
               <div className="main_box justify-content-center" id="box_wfman" style={{backgroundImage : this.props.bg}} align="center">
                   {Linker}
                </div>     
           </Col>
        )
    }
}

export default MenuCard