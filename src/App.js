/****************************************************************************************************
 * FILENAME: App.js
 * DESCRIPTION: Create a react router that navigates the user throughout the application
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Don't use hooks with this layout, they just don't work with the react-router-dom library.
 * CSS is Depreciated
 ****************************************************************************************************/
import React, { Component } from 'react';
// This import defines the Router as a HashRouter, rather than a BrowserRouter
// HashRouter uses browser cache to save the current and previous page data to allow for a user to navigate between them using their browser
// A BrowserRouter uses HTML5 to cache page information, but doesn't work
// URLs will be appended with a /#/ to signify that the hash router is working
import { Switch, Route, HashRouter as Router } from 'react-router-dom';
import './App.css';
import Logs from './components/logs';
import MyNavbar from './components/navbar';
import Default from './components/default';
import Login from './components/login';
import Signup from './components/signup';
import Logout from './components/logout'
import Home from './components/home';
import EditUser from './components/editUser';
import addDevice from './components/addDevice';
import editDevice from './components/editDevice';
import Device from './components/device';
import 'bootstrap/dist/css/bootstrap.min.css';

// Define NavRoute, which will instantiate a navigation bar in router elements with the 'NavRoute' definition
const NavRoute = ({exact, path, component: Component}) => (
  <Route exact={exact} path={path} render={(props) => (
    <div>
      <MyNavbar />
      <Component {...props}/>
    </div>
  )}/>
)
class App extends Component { // This class will render the entire navigation tree, all users who navigate will be brought to the Login.js file
                              // Pages that can't be handleded will be brought to the default.js file, which presents a 404
                              // :handle methods will pass in a variable like an interface id
  render() {
    return (
      <React.Fragment>
        <Router>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/logout" component={Logout} />
            <Route exact path="/signup" component={Signup} />
            <NavRoute exact path="/home" component={Home} />
            <NavRoute exact path="/device/new" component={addDevice} />
            <NavRoute exact path="/device/:handle" component={Device} />
            <NavRoute exact path="/device/:handle/logs" component={Logs} />
            <NavRoute exact path="/device/:handle/edit" component={editDevice} />
            <NavRoute exact path="/user/edit" component={EditUser} />
            <NavRoute component={Default} />
          </Switch>
        </Router>
      </React.Fragment>
    );
  }
}

export default App;