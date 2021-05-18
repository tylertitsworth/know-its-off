/****************************************************************************************************
 * FILENAME: logout.js
 * DESCRIPTION: File serves as a redirection path to change the user login state
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: 
 ****************************************************************************************************/
import React, {Component} from 'react'
import { Redirect } from 'react-router-dom';
import axiosBaseURL from '../axios.js'


export default class Logout extends Component {
   constructor(props) {
      super(props);
      this.state = {
         error: false,
         redirect: "/"
      };
   }
    
   render(){
        if(this.state.error){
            return(<div className="m-5 text-light"><h3>Error 404, Page Not Found</h3></div>)
        }
      axiosBaseURL.get('/logout') // Remove user login status
      .then(() => {
         this.props.history.push('/login'); // Redirect to login page
      })
      .catch(() => { // If for whatever reason this fails redirect to login anways
         return(   
            <Redirect to='/' />
         )
      })
      return(   
         <Redirect to='/' />
      )
    }
}