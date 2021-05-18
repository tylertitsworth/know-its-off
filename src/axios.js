/****************************************************************************************************
 * FILENAME: axios.js
 * DESCRIPTION: Create an importable variable that can be used to allow for API access via Axios
 * AUTHOR(S): Capstone 2020-2021 (Tyler Titsworth)
 * NOTES: Change the baseURL to match whatever a user would put as their URL to access. When using 
 * localhost, the port is dependant on what service hosts the frontend.
 ****************************************************************************************************/
import Axios from 'axios';
const axiosBaseURL = Axios.create({
    // 3000 for react-scripts (yarn start-dev)
    // 5000 for /build (yarn start)
	baseURL:'http://localhost:5000/api',
    //baseURL:'https://know-its-off.com/api/',
});
export default axiosBaseURL
