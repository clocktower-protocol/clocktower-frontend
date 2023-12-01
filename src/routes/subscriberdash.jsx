import React, {useEffect, useState, useCallback} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
//import SubsTable from '../SubsTable';
import SubscriptionsTable from '../SubscriptionsTable';
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
/* global BigInt */

const SubscriberDash = () => {

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates empty array for table
    let emptySubscriptionArray = []

    const [alertType, setAlertType] = useState("warning")
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptySubscriptionArray)
    //const [isEmpty, setIsEmpty] = useState(false)
     //feeBalance array indexed to subscription array
    //const [feeBalanceArray, setFeeBalanceArray] = useState(emptySubscriptionArray)

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

    const getProviderSubsWAGMI = async () => {
        //checks if user is logged into account
       
        if(!isLoggedIn()) {
           console.log("Not Logged in")
           return
       }
       
       //variable to pass scope so that the state can be set
       let accountSubscriptions = []

       await readContract({
           address: CLOCKTOWERSUB_ADDRESS,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, account]
       })
       .then(async function(result) {
           accountSubscriptions = result

           console.log(accountSubscriptions)

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

               console.log(detailsArray)
               
           }
           setSubscriptionArray(accountSubscriptions)
           setDetailsArray(detailsArray)
       })
   }

    const getSubscriberSubs = async () => {
        //checks if user is logged into account
       if(!isLoggedIn()) {
           console.log("Not Logged in")
           return
       }
           
       //variable to pass scope so that the state can be set
       let accountSubscriptions = []
       //let feeBalances = []
   
       //calls contract 
       accountSubscriptions = await clocktowersub.methods.getAccountSubscriptions(true, account).call({from: account})

       //gets details array
       for (var i = 0; i < accountSubscriptions.length; i++) {
            //finds the latest details log
            //get description from logs
            await clocktowersub.getPastEvents('DetailsLog', {
                filter: {id:[accountSubscriptions[i].subscription.id]},
                fromBlock: 0,
                toBlock: 'latest'
            }, function(error, events){ 
                //checks for latest update by getting highest timestamp
                if(events != undefined) {
                    let time = 0
                    let index = 0
                
                    if(events.length > 0) {
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

       setSubscriptionArray(accountSubscriptions)
       setDetailsArray(detailsArray)

       /*
       //gets fee balance
       for(const element of accountSubscriptions) {
            feeBalances.push(await clocktowersub.methods.feeBalance(element.subscription.id, account))
       }

       setFeeBalanceArray(feeBalances)
       */
       /*
       .then(function(result) {
           accountSubscriptions = result
           setSubscriptionArray(accountSubscriptions)
       })
       */
   }

   const unsubscribe = async (subscription) => {
        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.unsubscribe(subscription).encodeABI(),
        // value: feeHex
        }

        const txhash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        setAlertType("warning")
        setAlert(true)
        setAlertText("Transaction Pending...")

        //TODO: need to update to emit method
        await confirmTransaction(txhash)
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
                            unsubscribe = {unsubscribe}
                            account = {account}
                            role = {2}
                        />
                        : ""}
                    </div>
            </div>
        </div>
        )}
}

export default SubscriberDash