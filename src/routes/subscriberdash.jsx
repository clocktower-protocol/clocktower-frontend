import React, {useEffect, useState } from 'react'
import {Alert} from 'react-bootstrap';
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
import SubscriptionsTable from '../SubscriptionsTable';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
/* global BigInt */

const SubscriberDash = () => {

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const { address } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates empty array for table
    let emptySubscriptionArray = []

    const [alertType, setAlertType] = useState("warning")
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptySubscriptionArray)
    const [unsubscribedSub, setUnsubscribedSub] = useState({})
   
     //loads provider subscription list upon login
     useEffect(() => {
        getSubscriberSubsWAGMI()
    }, [account]);

    //unsubscribe hooks
    const { data, writeContract } = useWriteContract()
    /*
    const unsubscribeWrite = useWriteContract({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'unsubscribe',
        args: [unsubscribedSub]
    })
    */

    const unsubscribeWait = useWaitForTransactionReceipt({
        confirmations: 1,
        data
    })

    useEffect(() => {
        //calls wallet
        if(Object.keys(unsubscribedSub).length !== 0) {
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'unsubscribe',
                args: [unsubscribedSub]
            })
        }
    },[unsubscribedSub])

     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(unsubscribeWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(unsubscribeWait.isSuccess) {

            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")

            getSubscriberSubsWAGMI()
            
        }
    },[unsubscribeWait.isLoading, unsubscribeWait.isSuccess])

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


    const getSubscriberSubsWAGMI = async () => {
        //checks if user is logged into account

        console.log(address)
       
        if(!isLoggedIn() || account === "-1" || typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }
       
       //variable to pass scope so that the state can be set
       let accountSubscriptions = []

       await readContract(config, {
           address: CLOCKTOWERSUB_ADDRESS,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [true, account]
       })
       .then(async function(result) {
           accountSubscriptions = result

           //loops through each subscription
           for (var i = 0; i < accountSubscriptions.length; i++) {
               await publicClient.getLogs({
                   address: CLOCKTOWERSUB_ADDRESS,
                   event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
                   fromBlock: 0n,
                   toBlock: 'latest',
                   args: {id:[accountSubscriptions[i].subscription.id]}
               }) 
               .then(async function(events){
               
                    
                   //checks for latest update by getting highest timestamp
                   if(events != undefined) {
                       console.log(events)
                       
                       let time = 0
                       let index = 0
                       
                       if(events.length > 0)
                       {
                           for (var j = 0; j < events.length; j++) {
                                   if(time < events[j].args.timestamp)
                                   {
                                       time = events[j].args.timestamp
                                       index = j
                                   }
                           }
                           //adds latest details to details array
                           detailsArray[i] = events[index].args
                       }    
                       
                   }
                   
               })
               
           }
           setSubscriptionArray(accountSubscriptions)
           setDetailsArray(detailsArray)
       })
   }
   
   const isTableEmpty = () => {
        let count = 0
        subscriptionArray.forEach(subscription => {
            //this checks for unsubscribes AND cancels
            if(Number(subscription.status) === 0) {count += 1}
        })
        if(count > 0) { 
            //setIsEmpty(false)
            return false 
        } else {
           // setIsEmpty(true)
            return true
        }
    }
   
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        
        return (
                  
        <div className="clockMeta">
            {alertMaker()}
            <div className="clockBody">
                <div>
                    {subscriptionArray.length > 0 && !isTableEmpty() ? <Alert align="center" variant="dark">List of Subscriptions</Alert> : <Alert align="center" variant="info">No Subscriptions Yet</Alert>}
                </div>
                    <div className="provHistory">
                        {subscriptionArray.length > 0 && !isTableEmpty() ?
                        <SubscriptionsTable
                            subscriptionArray = {subscriptionArray}
                            detailsArray = {detailsArray}
                           // unsubscribe = {unsubscribe}
                            account = {account}
                            role = {2}
                            setUnsubscribedSub = {setUnsubscribedSub}
                        />
                        : ""}
                    </div>
            </div>
        </div>
        )}
}

export default SubscriberDash