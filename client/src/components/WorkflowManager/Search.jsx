import React, { Component } from 'react'
import Container from 'react-bootstrap/Container';
import SearchResults from '../WorkflowManager/Search/SearchResults'
import SearchOptions from '../WorkflowManager/Search/SearchOptions'


class Search extends Component {
    
    render() {        
                
        return (
                <Container fluid className="sec_body mt-2" align="center">                    
                    <div className="body_content">                        
                        <Container fluid>                                                       
                              <SearchOptions />                     
                        </Container>
                        <SearchResults />
                    </div>                                                             
                </Container>            
        )
    }
}



export default Search
