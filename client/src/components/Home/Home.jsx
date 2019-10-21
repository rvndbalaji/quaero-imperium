import React from 'react';
import Banner from '../Elements/Banner';
import Row from 'react-bootstrap/Row'
import Container from 'react-bootstrap/Container';
import MenuCard from '../Elements/MenuCard';

class Home extends React.Component
{       
    render()
    {             
        return(
            <div className="animate fadeIn">
                <Banner />
                <Container fluid>
                    <Row className='mb-4'>
                        <MenuCard 
                        title='WF Manager'
                        desc = 'Monitor your workflows across multiple servers'                        
                        bg = 'linear-gradient( 135deg, #79c6fc 10%, #0084e3 100%)'                        
                        link = 'wf_man'
                         />       
                         {
                            /*
                        <MenuCard 
                        title='Microservices'
                        desc = "Re-use other people's code for faster development"
                        bg = 'linear-gradient( 135deg, #81FBB8 10%, #28C76F 100%)'
                        link = ''
                         />     
                         <MenuCard 
                        title='Game of Skills'
                        desc = 'Improve your tech stack by learning something new'                        
                        bg = 'linear-gradient(135deg, #FEB692 10%, #EA5455 100%)'
                        link = ''
                         />     
                             */
                         }                                                
                         <MenuCard 
                        title='Documentation'
                        desc = 'Learn everything there is to know about Quaero CDP'                        
                        bg = 'linear-gradient( 135deg, #CE9FFC 10%, #7367F0 100%)'
                        link = {'https://' + window.location.hostname + '/docs/'}
                        target = '_blank'
                         />     
                    </Row>
                </Container>
                <div className='footer'>
                    © Quaero 3 LLC, {new Date().getFullYear()}
                </div>
            </div>
            
        );
    }
}


export default Home;