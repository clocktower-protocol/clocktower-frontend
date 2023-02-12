import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import SubscriptionsTable from '../SubscriptionsTable';

const AdminSubscriptions = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    let {t,s} = useParams();

    //creates empty array for table
    let emptySubscriptionArray = [];

    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [titleMessage, setTitleMessage] = useState("Subscribed To:")

    //loads provider subscription list upon login
    useEffect(() => {
        getSubsByAccount(t,s)
    }, [account, t, s]);


    const getSubsByAccount = async (t, s) => {
        //checks if user is logged into account
        if(!isLoggedIn()) {
            console.log("Not Logged in")
            return
        }
            
        //variable to pass scope so that the state can be set
        let subscriptions = []
        let isSubscriber = true
        let titleMessage = "Subscribed By:"

        if(t == "provider") {
            isSubscriber = false
            titleMessage = "Created By:"
        }
    
        //calls contract 
        await clocktowersub.methods.getSubscriptionsByAccount(isSubscriber, s).call({from: account})
        .then(function(result) {
            subscriptions = result
            setTitleMessage(titleMessage)
            setSubscriptionArray(subscriptions)
        })
    }

    const isTableEmpty = (subscriptionArray) => {
        let count = 0
        subscriptionArray.forEach(subscription => {
            if(subscription.status !== 1) {count += 1}
        })
        if(count > 0) { return false } else {return true}
    }

    //checks that user has logged in 
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        return (
            <div>
                <div>
                    {subscriptionArray.length > 0 ? <Alert align="center" variant="dark">{titleMessage}&nbsp;&nbsp;&nbsp;{s}</Alert> : ""}
                </div>
                <div>
                    <SubscriptionsTable
                        subscriptionArray = {subscriptionArray}
                        isAdmin = {true}
                        role = {0}
                    />
                </div>
            </div>
        )
    }

}

export default AdminSubscriptions