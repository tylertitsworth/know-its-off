/****************************************************************************************************
 * FILENAME: signup.js
 * DESCRIPTION: Provide User Registration through a page with a simple form
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Links from login.js
 ****************************************************************************************************/
import React, {Component} from 'react'
import {CircleSpinner} from 'react-spinners-kit' 
import axiosBaseURL from '../axios.js'

export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      email: "",
      password: "",
      error: false,
      postLoading: false
    };
  }
  // The Submit button function attempts to post a new user with the given form email and password to the API
  // If the axios function call is success, redirect the user to login.js
  // If the axios function call fails tell the user and prevent the page from refreshing
  doSignup = (event) => {
	  this.setState({postLoading:true});
	    axiosBaseURL.post('/user', {email: this.state.email, password: this.state.password})
	    .then((result) =>{this.setState({postLoading: false}); 
        this.props.history.push("/login"); 
      })
      .catch((error)=>{this.setState({postLoading:false});
        alert("Invalid email and password");
      })
    event.preventDefault();
  };
  // Page handler function will allow a form field to change its assigned value parameter
  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  // Render form content
	render(){
		if(this.state.loading){
      return (<div className="d-flex justify-content-center m-5"><CircleSpinner size={60} color="#686769" loading={this.state.loading} /></div>)
		}
		return( // Create a container that houses the form, the header is just the title
            // Each field changes a state field using the handleChange function, their form control format is determined by the 'type' identifier
            // The submit button executes the API call
<div className="mt-5 mb-5 container bg-dark border">
<div className="row justify-content-md-center mt-5">
<h1>Sign up to Know It's Off</h1>
</div>
<div className="row justify-content-md-center mb-5">
<form>
  <div className="form-group">
    <label>Email address</label>
    <input name="email" type="email" className="form-control" value={this.state.email} onChange={this.handleChange} id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" />
  </div>
  <div className="form-group">
    <label>Password</label>
    <input name="password" type="password" onChange={this.handleChange} value={this.state.password} className="form-control" id="exampleInputPassword1" placeholder="Password" />
  </div>
  <div className="form-group">
    <label>Confirm Password</label>
    <input name="passwordConf" type="password" onChange={this.handleChange} value={this.state.passwordConf} className="form-control" id="exampleInputPassword2" placeholder="Password" />
  </div>
  <button onClick={this.doSignup} className="btn btn-primary">Submit<CircleSpinner size={20} color="#3BBCE5" loading={this.state.postLoading} /></button>
</form>
</div>
</div>
		)
	}
	

}

