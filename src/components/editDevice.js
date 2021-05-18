/****************************************************************************************************
 * FILENAME: editDevice.js
 * DESCRIPTION: Change the name or device ID of a given device
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Links from device.js
 ****************************************************************************************************/
import React, {Component} from 'react';
import {CircleSpinner} from 'react-spinners-kit' ;
import axiosBaseURL from '../axios.js';
import { Redirect } from 'react-router-dom';

var dbString // expand scope of API URL
export default class editDevice extends Component {
   constructor(props) {
     super(props);
     this.state = {
         myDevice: {
            appliance_name: "",
            id: 0,
         },
         newDevice: {
            appliance_name: "",
            id: 0,
         },
         allDevices: [], // array to store query of all devices within database
                         // this is not good with scale
	      loading: true,
	      error: false,
         idCheck: false,
      }
   };
   // Upon loading the page get information about the specific device
   componentDidMount() {
      const handle = this.props.match.params.handle;
		dbString = "/device/" + handle
		axiosBaseURL.get(dbString)
		.then((result) => {
			this.setState({ 
				myDevice: {
					id: result.data.id, 
					appliance_name: result.data.appliance_name
            },
            newDevice: {
					id: result.data.id, 
					appliance_name: result.data.appliance_name
            },
            loading: false
			});
      })
      .catch( (error) => {
         this.setState({loading: false, error: true});
         if(error.response){
            this.setState({error_response: error.response.data});
            if(error.response.data === "not authorized"){ this.setState({redirect: dbString}) }
            else if (error.response.data){console.log(error.response)}
         }
      })
   }
   // Submit button will attempt to change both the device id and appliance name
   // Information stored in the myDevice state variable will be changed by the form fields.
   // Appliance name fields aren't unique, so we don't test for any special validity, the 
   // API will do that for us
   updateDevice = (event) => {
      this.setState({loading:true});
      axiosBaseURL.get("/allDevices") // API call to get all devices into array
      .then((result) => {
         this.setState({
            allDevices: result.data
         })
         var i = 0 // what is this c?
         for(i in this.state.allDevices) { // loop through all devices
            // Both values need to be typecasted because javascript is %&$*@!# terrible
            if(String(this.state.allDevices[i].id) === String(this.state.newDevice.id && String(this.state.allDevices[i].id !== String(this.state.myDevice.id)))) { // compare ids
               this.setState({idCheck:true});  // if they match set to prevent patching
            }
         }
         if(this.state.idCheck) { 
            this.setState({loading:false}) // error message
            alert("Please enter a valid Device ID!");
         }
         else {
            axiosBaseURL.patch(dbString, this.state.newDevice) // API call to patch the device with new, overwritten information
            .then((result) => { // upon success
               this.setState({loading: false});
                  alert("Device Updated Successfully!");
                  this.props.history.push('/home'); // redirect the user back to the home page after success
            })
            .catch((error)=>{ // If the previous check fails for a matching device id fails it will still fail here
                              // because the patch API call will fail
               this.setState({loading:false})
               alert("Please enter a valid Device ID!");
            })
         }
         event.preventDefault(); // always prevent refreshing
      })
      .catch( (error) => {
         this.setState({loading: false, error: true});
         if(error.response){
            this.setState({error_response: error.response.data});
            if(error.response.data === "not authorized"){ this.setState({redirect: dbString}) }
            else if (error.response.data){console.log(error.response)}
         }
      })
   };
   // Handler function to let the form fields change the information stored in myDevice
   handleChangeDevice = (event) => { 
      this.setState({
         newDevice : {...this.state.newDevice, [event.target.name]: event.target.value}
      });
   };
   // Render simple form fields with a submit button
	render(){
		if(this.state.error) {
         if(this.state.redirect) {return <Redirect to={this.state.redirect} />}
         return(<div className="m-5 text-light"><h3>Error 404, Page Not Found</h3></div>) 
      }
		if(this.state.loading){
         return (
            <div className="d-flex justify-content-center m-5">
               <CircleSpinner size={60} color="#686769" loading={this.state.loading} />
            </div>)
		}
		return(
<div className="m-5 text-light">
<h3>Edit Device</h3>
<form>
   <div className="form-group">
      <label>Appliance Name</label>
      <input className="form-control text-dark" name="appliance_name" id="inputApplianceName" aria-describedby="nameHelp" onChange={this.handleChangeDevice} value={this.state.newDevice.appliance_name} />
      <label>Device ID</label>
      <input className="form-control text-dark" name="id" id="inputDeviceId" aria-describedby="nameHelp" onChange={this.handleChangeDevice} value={this.state.newDevice.id} />
   </div>

   <button onClick={this.updateDevice} className="btn btn-success">Update<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading} /></button>
</form>
</div>
		)
	}
}

