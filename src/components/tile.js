/****************************************************************************************************
 * FILENAME: tile.js
 * DESCRIPTION: Provided device information in home.js, display a single tile with that device's 
 * information.
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: 
 ****************************************************************************************************/
import React, {Component} from 'react';
import Card from 'react-bootstrap/Card'
import {Link} from 'react-router-dom';
import {CircleSpinner} from 'react-spinners-kit';

export default class Tile extends Component {
   // These state components rely on item property assignments declared in ./grid/GridApp
   // Those assignments are always passed from an array generated in ./home.js
   state={
      device_id: this.props.device_id,
      appliance_name: this.props.appliance_name,
      device_state: this.props.state,
      // Notice the battery is missing from this implementation, to see the battery one must travel to device.js
      timestamp: this.props.timestamp, 
      statusText: "OFF",
      background: "light",
      loading: true,
   }
   // On page load, determine device state and change the background and status text accordingly
   componentDidMount() {
      if(this.props.state === 1){
         this.setState({
            background: "success", // This state object is used to determine a bootstrap entity, so success is just a color
            statusText: "ON"
         })
      }
      else if(this.props.state === 2){ // This state describes a device that hasn't had a state written to it yet, 
                                       //which means the addDevice.js file was the last to write to this object
         this.setState({
            background: "warning", 
            statusText: "UNINITIALIZED"
         })
      }
      else if(this.props.state === 0){
         this.setState({background: "danger"})
      }
      this.setState({loading: false})
   }

   render(){
      var myDate
      if (this.state.timestamp === "N/A") myDate = this.state.timestamp;
      else {
         myDate = new Date(this.state.timestamp);
         myDate = myDate.toLocaleString();
      }
      if(this.state.loading) {
         return (
            <div className="d-flex justify-content-center m-5">
               <CircleSpinner size={60} color="#686769" loading={this.state.loading} />
            </div>)
      } // Render a card object, bootstrap styles this object
        // The Detail Link leads to editDevice.js
      return(
         <Card bg={this.state.background} className="tile text-center col">
            <Card.Header>
               <Card.Title className="card-title-device">{this.state.appliance_name} : <b>{this.state.device_id}</b></Card.Title>
            </Card.Header>
            <Card.Body>
               <Card.Title className="card-title-status">{this.state.statusText}</Card.Title>
               <Card.Text className="card-text-device_state">{this.state.state}</Card.Text>
               <Card.Text className="card-text-timestamp">Last Seen: {myDate}</Card.Text>
               <Link className="card-button btn btn-primary text-wrap" to={"/device/"+this.state.device_id}>Details</Link>
            </Card.Body>
         </Card>
      )
   }
}
