/****************************************************************************************************
 * FILENAME: device.js
 * DESCRIPTION: Display device information, delete devices, and link elsewhere
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Links from home.js
 ****************************************************************************************************/
import React, {Component} from 'react';
import {Link, Redirect} from 'react-router-dom';
import {CircleSpinner} from 'react-spinners-kit';
import axiosBaseURL from '../axios.js';

export default class Devices extends Component {
	constructor(props) {
		super(props);
		this.state = {	
			myDevice: { // As a general rule, storage of device information is categorized by a state variable like myDevice
				appliance_name: "",
				device_state: 1, 
				device_battery: 100.0,
				timestamp: "",
				id: 1
			},
		error: false,
		loading: true, 
		redirect: '/home'
		}
	};
	// Upon loading the page retrieve device information and set them to the state variables allocated
	componentDidMount() {
		const handle = this.props.match.params.handle;
		var dbString = "/device/" + handle
		axiosBaseURL.get(dbString)
		.then((result) => {
			this.setState({ 
				myDevice: {
					id: result.data.id, 
					appliance_name: result.data.appliance_name, 
					device_state: result.data.device_state, 
					device_battery: result.data.device_battery, 
					timestamp: result.data.timestamp
				}
			});
			this.setState({loading: false})
		})
		.catch( (error) => {
			this.setState({error: true, loading:false});
		})
	};
	// When clicking the red 'X' in the top right corner it will attempt to delete the device
	deleteDevice = (event) => {
		// Extra Confirmation step
		const r = window.confirm("Do you really want to delete this, it will be permanent!"); 
		if(r === true){
			const handle = this.props.match.params.handle;
			var dbString = "/device/" + handle
		   	axiosBaseURL.delete(dbString) // API call to remove the device
		   	.then((result) => { // upon success
			  this.setState({ loading: false}); 
			  alert("Device Removed Successfully!");
			  this.props.history.push('/home'); // redirect the user to the homepage
		   })
		   .catch((error) => { // This only fails if the user isn't logged in 
							   // or it was removed inbetween the time the page loaded 
							   // and the delete button was pressed
			  this.setState({ error: true });
			  if(error.response){
				 console.log(error.response)
				 this.setState({error_response: error.response.data})
			  }
		   })
		   event.preventDefault();
		}
	};
	// Render a large card that displays all device information, with some buttons spread around
	// Buttons not naturally justified are floating
	render() {
		var myDate
		if (this.state.myDevice.timestamp === "N/A") myDate = this.state.myDevice.timestamp;
		else {
		   myDate = new Date(this.state.myDevice.timestamp);
		   myDate = myDate.toLocaleString();
		}
		if(this.state.loading) {
			return (
			  <div className="d-flex justify-content-center m-5">
				 <CircleSpinner size={60} color="#686769" loading={this.state.loading} />
			  </div>)
		}
		if(this.state.error) {
			if(this.state.redirect) {return <Redirect to={this.state.redirect} />}
			return(<div><h3>Error 404, Page Not Found</h3><h3>{this.state.error_response}</h3></div>)
		}
		return(
			<div className="col mt-3 text-light">
				<div className="card bg-dark">
					<div className="card-body">
							<button onClick={this.deleteDevice} className="btn btn-sm btn-danger float-right" data-toggle="tooltip" data-placement="bottom" title="Delete Device">✖<CircleSpinner size={20} color="#3BBCE5" loading={this.state.loading} /></button>
							<h5 className="card-title text-wrap">{this.state.myDevice.appliance_name}</h5>
							<p className="card-title text-wrap">Device ID: {this.state.myDevice.id}</p>
							<p className="card-text">State: {this.state.myDevice.device_state ? 'ON' : 'OFF'}</p>
							<p className="card-text">Battery: {this.state.myDevice.device_battery}%</p>
							<p className="card-text">Last Seen: {myDate}</p>
							<Link to={"/device/" + this.state.myDevice.id + "/edit"} className="btn btn-primary text-wrap" data-toggle="tooltip" data-placement="bottom" title="Change Device Details">Modify</Link>
							<Link to={"/device/" + this.state.myDevice.id + "/logs"} className="btn btn-success text-wrap float-right">Battery Logs</Link>
					</div>
				</div>
			</div>
		)
	}
}

