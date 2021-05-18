/****************************************************************************************************
 * FILENAME: addDevice.js
 * DESCRIPTION: Create a new device object assigned to the current user
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Links from navbar (index.js/App.js)
 ****************************************************************************************************/
 import React, {Component} from 'react'
 import {CircleSpinner} from 'react-spinners-kit' 
 import axiosBaseURL from '../axios.js'
 import Tile from "./tile.js";
 
 export default class addDevice extends Component {
   constructor(props) {
     super(props);
     this.state = {
       myDevice: {
          id: "0",
          appliance_name: "My Appliance",
          device_state: 0, 
          device_battery: 100.0,
       },
       allDevices: [],
       error: false,
       redirect: null, 
       revealDetails: false, 
       loading: false, 
     };
   }
    // Submission button will attempt to create a new device
    postData = (event) => {
       this.setState({loading:true});
       axiosBaseURL.get("/allDevices") // API call to get all devices 
       .then((result) => {
          this.setState({
             allDevices: result.data
          })
       })
       var i = 0 // what is this c?
       let idVerify = true;
       for(i in this.state.allDevices) // loop through all devices and compare IDs to the one given
          if(String(this.state.myDevice.id) === String(this.state.allDevices[i].id)){ // verify the ID with string typecasting because javascript is %&#*#!^ terrible
             idVerify = false;
          }
       if(idVerify && String(this.state.myDevice.id) !== "0"){ // Make sure the ID isn't already in use, or 0
                                                            // an ID will be 0 if it's text or a non-integer
          axiosBaseURL.post('/device', this.state.myDevice) // API call to create the new device
          .then((result) => {                               // This API call handles state and battery declaration
             this.setState({ myDevice: {...this.state.myDevice, id: result.data.id}, revealDetails:true })
             alert("Device Creation Successful!");
             this.props.history.push('/home'); // redirect the user to the homepage to view their device
          })                                   // but not before they get a sneak previous of what their device looks like
          .catch((error) => {
             this.setState({loading: false })
             alert("Please enter a valid Device ID!"); // error message if invalid device ID
          })
       }
       else {
         this.setState({loading: false })
         alert("Please enter a valid Device ID!"); // error message if invalid device ID
       }
       event.preventDefault(); // never refresh
    };
    // Handle form changes that write to the state
    handleChangeDevice = (event) => {
       this.setState({
          myDevice : {...this.state.myDevice, [event.target.name]: event.target.value}
       });
    };
    // Render a simple form that takes the Appliance name and Device ID with a submission button
    render(){
       if(this.state.error){ 
          return(<div className="m-5 text-light"><h3>Error 404, Page Not Found</h3></div>) 
       }
       const {revealDetails} = this.state;
       return(
 <div className="m-5 text-light">
 <h3>New Device</h3>
 <form>
    <div className="form-group">
       <label>Appliance Name</label>
       <input className="form-control text-dark" name="appliance_name" id="inputApplianceName" aria-describedby="nameHelp" onChange={this.handleChangeDevice} value={this.state.myDevice.appliance_name} />
       <label>Device ID</label>
       <input className="form-control text-dark" name="id" id="inputId" aria-describedby="nameHelp" onChange={this.handleChangeDevice} value={this.state.myDevice.id} min="1" step="1" type="number" />
    </div>
 
    <button onClick={this.postData} className="btn btn-success">Add this device<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading} /></button>
 </form>
 {revealDetails && ( // publish a tile of the current state of the device once created
    <Tile key={this.state.myDevice.id} device_id={this.state.myDevice.id} device_battery={this.state.myDevice.device_battery} appliance_name={this.state.myDevice.appliance_name} state={this.state.myDevice.device_state} timestamp={this.state.myDevice.timestamp}></Tile>
 )}
 </div>
       )
    }
 }
 