import React, { PureComponent,memo } from 'react'
import {Switch, Route} from 'react-router';
import {BrowserRouter} from 'react-router-dom';
import Home from './Home/Home';
import LogIn from './Auth/Login';
import WF_Main from './WorkflowManager/WF_Main';
import WF_View from './WorkflowManager/View/WF_View';
import NotFound from './Elements/NotFound';
import {requireAuth} from './Auth/requireAuth';

class App extends PureComponent {   
  
   render()
  {            
      document.title = 'Quaero Imperium';           
    return (
      <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path='/' component={requireAuth(Home)}></Route>
          <Route exact path='/wf_man' component={requireAuth(WF_Main)}></Route>
          <Route exact path='/wf_man/view/:auth/:sql_un/:server/:metastore/:wf_id' component={requireAuth(WF_View)}></Route>
          {
          //<Route path='/users/register' component={Register}></Route>
          }
          <Route path='/users/login' component={LogIn}></Route>                    
          <Route path="*" component={NotFound} />
        </Switch>
      </div>      
      </BrowserRouter>
    );
  }
}

export default memo(App)
