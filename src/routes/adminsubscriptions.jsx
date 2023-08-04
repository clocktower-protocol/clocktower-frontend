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
    //feeBalance array indexed to subscription array
   // const [feeBalanceArray, setFeeBalanceArray] = useState(emptySubscriptionArray)
    const [feeObjects, setFeeObjects] = useState(emptySubscriptionArray)
    const [isSubscriber, setIsSubscriber] = useState(true)

   


    //loads provider subscription list upon login
    useEffect(() => {
        if(t == "provider") {
            setIsSubscriber(false)
        }

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
    
        let feeObjects = []
        let feeBalance
        let remainingCycles

        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        const fee = await clocktowersub.methods.callerFee().call({from: account})
        const cycles = Math.round(1 / ((fee / 10000) - 1))

        //calls contract 
        //subscriptions = await clocktowersub.methods.getSubscriptionsByAccount(isSubscriber, s).call({from: account})
        subscriptions = await clocktowersub.methods.getAccountSubscriptions(isSubscriber, s).call({from: account})

         //gets fee balance and remaining cycles
        for(const element of subscriptions) {
            const balance = await clocktowersub.methods.feeBalance(element.subscription.id, s).call({from: account})
            
            //feeBalances.push(balance)

            if(balance == 0) {
                feeBalance = 0
                remainingCycles = cycles
            } else {
                feeBalance = balance

               // const subFee = element.subscription.amount / cycles

                const remainingBalancePercent = (balance / element.subscription.amount)

                remainingCycles = remainingBalancePercent * cycles
            }
            
            let feeObject = {feeBalance: feeBalance, remainingCycles: remainingCycles}
            feeObjects.push(feeObject)
        }


       // setFeeBalanceArray(feeBalances)
        setFeeObjects(feeObjects)
        setTitleMessage(titleMessage)
        setSubscriptionArray(subscriptions)
       
    }

    /*
    const isTableEmpty = (subscriptionArray) => {
        let count = 0
        subscriptionArray.forEach(subscription => {
            if(subscription.status !== 1) {count += 1}
        })
        if(count > 0) { return false } else {return true}
    }
    */

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
                <div className="subTable">
                    <SubscriptionsTable
                        subscriptionArray = {subscriptionArray}
                        isAdmin = {true}
                        role = {0}
                        feeObjects = {feeObjects}
                        bySubscriber = {isSubscriber}
                    />
                </div>
            </div>
        )
    }

}

export default AdminSubscriptions