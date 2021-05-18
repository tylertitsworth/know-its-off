/****************************************************************************************************
 * FILENAME: editUser.js
 * DESCRIPTION: Accordian of options to change user settings or remove user
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Individual loading/expansion state variables can't be optimized because of the nature of js.
 * Accordian HTML is based on the @material-ui docs
 * Links from navbar.js (index.js/app.js)
 ****************************************************************************************************/
import React, { Component } from 'react'
import {CircleSpinner} from 'react-spinners-kit'
import axiosBaseURL from '../axios.js'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { Accordion, AccordionDetails, AccordionSummary} from '@material-ui/core/'

export default class EditUser extends Component {
    constructor(props) {
      super(props);
      this.state = {
         // current user information
         current: {
            email: "",
            password: "",
         },
         // variables that will be changed or used to confirm information
         toChange: {
            email: "",
            oldPass: "",
            pass: "",
            checkPass: "",
            deleteconfirm: ""
         },
         loading: false, // this loading is for the page itself
         error: false,
         // each loading is for a different accordian section button, top->bottom
         loading1: false, 
         loading2: false, 
         loading3: false, 
         // used to capture the state of the individual accordian sections
         expanded1: false,
         expanded2: false,
         expanded3: false
      };
   }
   // Upon loading the page, populate user settings into 'current'
   componentDidMount() {
      axiosBaseURL.get("/user/current")
      .then((result) => {
         this.setState({
            loading: false,
            current: {
               email: result.data.email,
               password: result.data.password
            }
         });
      })
      .catch((error) => {
         this.setState({loading: false, error: true});
         if(error.response){
            this.setState({error_response: error.response.status});
         }
      })
   }
   // function to handle form changes with target variables, only works with the toChange associations
   // so we can't change anything outside of that state context
   handleChange = (event) => {
        this.setState({
           toChange: {...this.state.toChange,[event.target.name]: event.target.value}
        });
   };
   // function to handle the expansion and compression of the accordian based on the id of the identifier
   handleAccordion = (id) => (event) => {
      switch(id) {
         case 1:
            var ex1 = !this.state.expanded1
            this.setState({
               expanded1: ex1
             });
            break;
         case 2:
            var ex2 = !this.state.expanded2
            this.setState({
               expanded2: ex2
             });
            break;
         case 3:
            var ex3 = !this.state.expanded3
            this.setState({
               expanded3: ex3
             });
            break;
         default: 
            break;
      }
   };
   // Email submit button, will attempt to change the email of the user to information present in the form field
   doEmail = (event) => {
      this.setState({loading1 : true});
      // check if the form field is empty, or if the email to change it the same as the current email
      if(this.state.toChange.email === undefined || this.state.toChange.email === this.state.current.email) {
         alert("Please enter valid email into field"); // error message, prevent refreshing
         this.setState({loading1: false});
         event.preventDefault();
      }
      else {
         axiosBaseURL.patch('/user/current', {email: this.state.toChange.email}) // patch the user
         .then((result) => {
            this.setState({loading1: false})
            alert("User Information Successfully Updated!"); // allow page refreshing
         })
         .catch((error) => {
            this.setState({changeLoad: false, error: true, error_response: error.response.data})
         });
      }
   }
   // Password submit button, will attempt to change user password information based on a few form fields
   doPass = (event) => {
      this.setState({loading2 : true});
      axiosBaseURL.post('/user/check/' + this.state.toChange.oldPass) // check if the 'current password' field matches 
                                                                      // since passwords are always given as hash we use an API call
                                                                      // this will reveal the password of a user who attempts to change it
      .then(response => {
         // If the password and confirm fields match AND the status response code of the password checking is valid
         if(this.state.toChange.pass === this.state.toChange.checkPass && response.status === 204) {
            axiosBaseURL.patch('/user/current', {password: this.state.toChange.pass})
            .then((result) => {
               this.setState({loading2: false})
               alert("User Information Successfully Updated!"); // allow page refreshing
            })
         }
         else { // error message otherwise, passwords have to not match in this case
            alert("Your Passwords do not match");
            this.setState({loading2: false});
            event.preventDefault(); // prevent refreshing
         }
      })
      .catch((error) => { // if the axios call fails, its because the API call returned a 401
         this.setState({loading2: false, error_response: error.response.status})
         alert("Your old password is incorrect") // error message
         event.preventDefault(); // prevent refreshing
      })
   }
   // Delete Account button, will attempt to remove an account given the password of the account is correct
   delete = (event) => {
      this.setState({loading3 : true});
      const r = window.confirm("Are you sure?"); // Extra confirmation step
      if(r === true) {
         // Instead of using /user/check we can just try to login with the given password
         axiosBaseURL.post('/login', {email: this.state.current.email, password: this.state.toChange.deleteconfirm})
         .then((result) => {
            axiosBaseURL.delete('/user/current') // delete API call if successful
            this.setState({loading3: false})
            this.props.history.push('/login'); // redirect the user to the login page
         })
         .catch((error) => { // if it fails the password must've been incorrect
                             // There is an alternative scenario where the user isn't logged in
                             // In which case they will never be able to delete the account 
                             // More error checking is needed to activate the error state flag
            this.setState({loading3: false, error_response: error.response.status});
            alert("Password incorrect");
         })
      }
      else this.setState({loading : false})
      event.preventDefault(); // always prevent refreshing
   }
   // Render the accordian with all 3 forms
   // The accordian starts collapsed and can be expanded by clicking it
   render() {
      if(this.state.error) {
         return(<div className="m-5 text-light"><h3>Error: Not Logged In</h3></div>)
      }
      if(this.state.loading){
         return (
            <div className="d-flex justify-content-center m-5">
               <CircleSpinner size={60} color="#686769" loading={this.state.loading} />
            </div>)
      }
      return(
<div className="m-5 text-light">
   <Accordion className="bg-secondary text-light" expanded={this.state.expanded1} onChange={this.handleAccordion(1)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1bh-content" id="panel1bh-header">
         Change Email
      </AccordionSummary>
      <AccordionDetails>
         <input name="email" type="email" className="form-control" value={this.state.toChange.email} onChange={this.handleChange} id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter new email address" />
         <button onClick={this.doEmail} className="btn btn-outline-info">Submit<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading1} /></button>
      </AccordionDetails>
   </Accordion>
   <Accordion className="bg-secondary text-light" expanded={this.state.expanded2} onChange={this.handleAccordion(2)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2bh-content" id="panel2bh-header">
         Change Password
      </AccordionSummary>
      <AccordionDetails>
      <div className="d-grid gap-2 d-md-flex">
         <div className="form-group container-fluid">
               <label>Current Password</label>
               <input name="oldPass" type="password" className="form-control" value={this.state.toChange.oldPass} onChange={this.handleChange} id="exampleInputPassword" aria-describedby="passwordHelp" placeholder="Current Password" />
         </div>
         <div className="form-group container-fluid">
            <label>New Password</label>
            <input name="pass" type="password" className="form-control" value={this.state.toChange.pass} onChange={this.handleChange} id="exampleInputPassword2" aria-describedby="passwordHelp" placeholder="New Password" />
         </div>
         <div className="form-group container-fluid gap-2">
            <label>Confirm Password</label>
            <input name="checkPass" type="password" className="form-control" value={this.state.toChange.checkPass} onChange={this.handleChange} id="exampleInputPassword1" aria-describedby="passwordHelp" placeholder="Confirm Password" />
         </div>
         <button onClick={this.doPass} className="btn btn-outline-info">Submit<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading2} /></button>
      </div>
      </AccordionDetails>
   </Accordion>
   <Accordion className="bg-secondary text-light" expanded={this.state.expanded3} onChange={this.handleAccordion(3)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3bh-content" id="panel3bh-header">
         Delete Account
      </AccordionSummary>
      <AccordionDetails>
      <input name="deleteconfirm" type="password" className="form-control" value={this.state.toChange.deleteconfirm} onChange={this.handleChange} id="exampleInput5" aria-describedby="emailHelp" placeholder="Enter your account password" />
         <button onClick={this.delete} className="btn btn-outline-info">Submit<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading3} /></button>
      </AccordionDetails>
   </Accordion>
</div>
       )
    }
}