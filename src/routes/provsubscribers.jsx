import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import ProvSubscribersTable from '../ProvSubscribersTable';

const ProvSubscribers = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id} = useParams();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    //creates empty array for table
    const emptyArray = [];

    const [subscribersArray, setSubscribersArray] = useState(emptyArray)

    //loads provider subscription list upon login
    useEffect(() => {
        getSubscribers()
    }, [account]);

   
    const getSubscribers = async () => {

        //checks if user is logged into account
       if(!isLoggedIn()) {
           console.log("Not Logged in")
       return
       }

       //const subscribersArray = []

       //_subscribersArray = await clocktowersub.methods.getSubscribersById(id).call({from: account})

       setSubscribersArray(await clocktowersub.methods.getSubscribersById(id).call({from: account}))
    }

    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        
        return (
            <div>
                <div className="clockTableDiv">
                    <ProvSubscribersTable 
                        subscribersArray = {subscribersArray}
                    />
                </div>
            
            </div>
        )
    }

}

export default ProvSubscribers