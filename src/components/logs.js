/****************************************************************************************************
 * FILENAME: logs.js
 * DESCRIPTION: Display Battery logs that a device has and allow for users to download a CSV of the 
 * battery data.
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Links from device.js
 ****************************************************************************************************/
import React, {Component} from 'react';
import { Redirect} from 'react-router-dom';
import {CircleSpinner} from 'react-spinners-kit';
import axiosBaseURL from '../axios.js';
import CsvDownload from 'react-json-to-csv';

export default class batteryLogs extends Component {
	constructor(props) {
		super(props);
		this.state = {	
			battery: [
                {device_battery: 100.0, timestamp_time: ""}
            ],
		error: false,
		loading: true
		}
	};
	componentDidMount() {
		const handle = this.props.match.params.handle;
		var dbString = "/batteryLogs/" + handle
		axiosBaseURL.get(dbString) // retrieve battery logs data using the API
		.then((result) => {
			this.setState({ 
				battery: result.data
			});
			this.setState({loading: false})
		})
	};
	render() {
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
			<React.Fragment>
				{this.state.battery.map((battery) => ( // Map each element in the battery array as an individual card object
													   // These card objects have an individual device battery and timestamp time
					<div className="col mt-3 text-light">
					<div className="card bg-dark">
						<div className="card-body">
								<p className="card-text">Battery: {battery.device_battery}%</p>
								<p className="card-text">Last Seen: {new Date(battery.timestamp_time).toLocaleString()}</p>
						</div>
					</div>
					</div>
				// CSVDownload is a button object that allows for data to be converted to said format
				// Do not mess with spacing, it's perfect
				))}
				<CsvDownload style={{display: "flex", margin: "1em"}} className="btn btn-info float-right footer affix" data={this.state.battery}>Download CSV</CsvDownload>
			</React.Fragment>
		)
	}
}
