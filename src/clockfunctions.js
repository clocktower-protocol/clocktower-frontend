import {JWT_SERVER} from './config'
import axios from 'axios'
//import {jwtDecode} from 'jwt-decode'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export const fetchToken = async () => {
    try{
      //if empty
      if(localStorage.getItem("clockAccess") === null) {
        console.log("not set")
    
        let data = {
          "id": 4
        }
        //gets token
        await axios.post(JWT_SERVER, data, {headers: {
          'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          console.log(response.data.token);
          //stores token in local storage
          localStorage.setItem("clockAccess", response.data.token)
          console.log("token set")
        })
        .catch(function (error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
            console.log(error.config);
          })
      } else {
        /*
        //checks if token has expired
        const savedToken = localStorage.getItem("clockAccess")
        const decodedToken = jwtDecode(savedToken)
        
        console.log("current utc time  " + dayjs().utc().unix())
        console.log("token expiry  " + decodedToken.exp)
        console.log("difference  " + (decodedToken.exp - dayjs().utc().unix()))
        console.log(decodedToken)
        console.log(typeof dayjs().utc().unix())
        //gets token if out of date
        if(decodedToken.exp < dayjs().utc().unix()) {
          //gets token
          let data = {
            "id": 4
          }

          console.log("updating expired token")

          await axios.post(JWT_SERVER, data, {headers: {
            'Content-Type': 'application/json'
            }
          })
          .then(function (response) {
            console.log(response.data.token);
            //stores token in local storage
            localStorage.setItem("clockAccess", response.data.token)
            console.log("token set")
          })
          .catch(function (error) {
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
            } else if (error.request) {
              // The request was made but no response was received
              // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
              // http.ClientRequest in node.js
              console.log(error.request);
            } else {
              // Something happened in setting up the request that triggered an Error
              console.log('Error', error.message);
            }
            console.log(error.config);
          })
        }
        
        console.log("got existing token")
        */
      }
    } catch (error){
        console.error(error)
    }
  }