import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import SubscriptionsTable from '../SubscriptionsTable';
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import AdminHistoryTable from '../AdminHistoryTable';

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
    const [detailsArray, setDetailsArray] = useState(emptySubscriptionArray)
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
        let counter

        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        const fee = await clocktowersub.methods.callerFee().call({from: account})
        const cycles = Math.round(1 / ((fee / 10000) - 1))

        //calls contract 
        //subscriptions = await clocktowersub.methods.getSubscriptionsByAccount(isSubscriber, s).call({from: account})
        subscriptions = await clocktowersub.methods.getAccountSubscriptions(isSubscriber, s).call({from: account})

         //gets fee balance and remaining cycles
        //for(const element of subscriptions) {
            for (var i = 0; i < subscriptions.length; i++) {
            const balance = await clocktowersub.methods.feeBalance(subscriptions[i].subscription.id, s).call({from: account})
            
            //feeBalances.push(balance)

            if(balance == 0) {
                feeBalance = 0
                remainingCycles = cycles
            } else {
                feeBalance = balance

               // const subFee = element.subscription.amount / cycles

                const remainingBalancePercent = (balance / subscriptions[i].subscription.amount)

                remainingCycles = remainingBalancePercent * cycles
            }
            
            let feeObject = {feeBalance: feeBalance, remainingCycles: remainingCycles}
            feeObjects.push(feeObject)

            //get description from logs
            await clocktowersub.getPastEvents('DetailsLog', {
                filter: {id:[subscriptions[i].subscription.id]},
                fromBlock: 0,
                toBlock: 'latest'
            }, function(error, events){ 
                //checks for latest update by getting highest timestamp
                if(events != undefined) {
                    let time = 0
                    let index = 0
                   
                    if(events.length > 0)
                    {
                        for (var j = 0; j < events.length; j++) {
                            if(time < events[j].timestamp)
                            {
                                time = events[j].timestamp
                                index = j
                            }
                        }
                       //adds latest details to details array
                       detailsArray[i] = events[index].returnValues
                    }    
                }
            })
        }


       // setFeeBalanceArray(feeBalances)
        setFeeObjects(feeObjects)
        setTitleMessage(titleMessage)
        setSubscriptionArray(subscriptions)
        setDetailsArray(detailsArray)
       
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
                        detailsArray = {detailsArray}
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