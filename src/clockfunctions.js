import axios from 'axios'
import {jwtDecode} from 'jwt-decode'
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
        axios.post('http://138.197.26.60:3000/api/requesttoken', data, {headers: {
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
          console.log(error);
        })
      } else {
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

          axios.post('http://138.197.26.60:3000/api/requesttoken', data, {headers: {
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
            console.log(error);
          })
        }
        
        console.log("got existing token")
      }
    } catch (error){
      console.error(error)
    }
  }