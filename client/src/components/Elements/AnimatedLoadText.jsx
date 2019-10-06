import React, { Component } from 'react'

export default class AnimatedLoadText extends Component {
    render() {
        return (
            <div id="load_img" className="row justify-content-center">                        
                <div style={this.props.style} className="la-square-jelly-box mr-3">
                    <div></div><div></div>            
                </div>                                    
            <span id="load_txt">{this.props.text}</span>
            </div>
        )
    }
}
