import React, {useEffect, useState} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
import ProviderSubsTable from '../ProviderSubsTable';
import SubsTable from '../SubsTable';
/* global BigInt */

const SubscriberDash = () => {

    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates empty array for table
    let emptySubscriptionArray = []

    const [alertType, setAlertType] = useState("danger")
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

     //loads provider subscription list upon login
     useEffect(() => {
        getSubscriberSubs()
    }, [account]);

    //Creates alert
    const alertMaker = () => {
        if(alert) {
            return (
                <div className="alertDiv">
                <Alert variant={alertType} align="center" onClose={() => setAlert(false)} dismissible>{alertText}</Alert>
                </div>
            )
        }
    }

     //confirms transaction by looping until it gets confirmed
     const confirmTransaction = async (txHash) => {

        //gets transaction details
        const trx = await web3.eth.getTransaction(txHash)

        //console.log(txHash)

        let isDone = false;
        
        //trys every five seconds to see if transaction is confirmed
        isDone = setTimeout(async () => {

        // console.log(trx.blockNumber)
        if(trx.blockNumber) {
            //turns off alert and loads/reloads table
            setAlert(false)
            setAlertType("danger")
            await getSubscriberSubs()
            return true
        }

        //return await this.confirmTransaction(txHash)
        await confirmTransaction(txHash)
        return false
        },5*1000)

        
        if(isDone) {
        return true
        } 
    }

    const getSubscriberSubs = async () => {
        //checks if user is logged into account
       if(!isLoggedIn()) {
           console.log("Not Logged in")
           return
       }
           
       //variable to pass scope so that the state can be set
       let accountSubscriptions = []
   
       //calls contract 
       await clocktowersub.methods.getAccountSubscriptions(true).call({from: account})
       .then(function(result) {
           accountSubscriptions = result
           setSubscriptionArray(accountSubscriptions)
       })
   }

   return (
            
    <div className="clockMeta">
        {alertMaker()}
        <div className="clockBody">
            <div>
                {subscriptionArray.length > 0 ? <Alert align="center" variant="dark">List of Subscriptions</Alert> : ""}
            </div>
                <div className="provHistory">
                    <SubsTable 
                        subscriptionArray={subscriptionArray}
                        // setIsTableEmpty = {setIsTableEmpty}
                    />
                </div>
            </div>
    </div>

   )

}

export default SubscriberDash