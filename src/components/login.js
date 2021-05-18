/****************************************************************************************************
 * FILENAME: login.js
 * DESCRIPTION: Provide User Login through a page with a simple form
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Consider this to be the starting point in the navigation screen tree
 ****************************************************************************************************/
import React, {Component} from 'react'
import {CircleSpinner} from 'react-spinners-kit' 
import {Link} from 'react-router-dom';
import axiosBaseURL from '../axios.js'

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
	    loading: false,
	    email: "",
	    password: "",
      error: false,
      flag: false, 
	    postLoading: false, 
    };
  }
  // The Submit button function checks the credentials given in the form
  doLogin = (event) => {
	  this.setState({postLoading:true});
	  axiosBaseURL.post('/login', {email: this.state.email, password: this.state.password})
	  .then( // if the credentials were successful redirect the user to the home page
		  (result) =>{this.setState({postLoading: false, flag:false}); 
      this.props.history.push("/home"); 
    })
    .catch((error)=>{this.setState({postLoading:false, flag:true}); // if they failed set the error flag bit and prevent refreshing
    })
	  event.preventDefault();
  };
  // Function to handle form changes and set the value field in a given form identifier
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  // Render a container with an email, password form fields with proper labels. Contains a submission button and registration button that leads to signup.js
	render(){
		if(this.state.loading){
      			return (<div className="d-flex justify-content-center m-5"><CircleSpinner size={60} color="#686769" loading={this.state.loading} /></div>)
    }
    const {flag} = this.state;
		return(
<div className="mt-5 mb-5 container bg-dark border">
<div className="row justify-content-md-center text-light mt-5">
<h1>Log In to Know It's Off</h1>
</div>
<div className="row justify-content-md-center text-light mb-5">
<form>
  <div className="form-group">
    {flag && ( // This message only appears when the API post request to /login fails
      <div className="text-danger">*Email or password incorrect</div>
    )}
    <label>Email address</label>
    <input name="email" type="email" className="form-control" value={this.state.email} onChange={this.handleChange} id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
  </div>
  <div className="form-group">
    <label>Password</label>
    <input name="password" type="password" onChange={this.handleChange} value={this.state.password} className="form-control" id="exampleInputPassword1" placeholder="Password" />
  </div>
  <button onClick={this.doLogin} className="btn btn-primary">Submit<CircleSpinner size={20} color="#3BBCE5" loading={this.state.postLoading} /></button>
  <Link id="signupHelp" to="/signup" className="form-text text-muted">Register New User</Link>
</form>
</div>
</div>
		)
	}
	

}

