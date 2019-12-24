import React, { Component } from 'react';
import './App.scss';
import RouterView from './router/RouterView'
import routes from './router/index'
import { HashRouter } from 'react-router-dom'
import MediaQuery from 'react-responsive';
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }
  
  render() {
    return (
    <MediaQuery query='(min-device-width: 736px)'>
       {(match)=>(
          <div className="App">
          <HashRouter>
            <RouterView routes={routes} />
          </HashRouter>
        </div>
       )}

      </MediaQuery >
    );
  }

}

export default App;
