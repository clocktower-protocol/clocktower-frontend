import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import SubscriptionsTable from '../SubscriptionsTable';
import {usePublicClient} from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'

const AdminSubscriptions = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    let {t,s} = useParams();

    //creates empty array for table
    let emptySubscriptionArray = [];

    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptySubscriptionArray)
    const [titleMessage, setTitleMessage] = useState("Subscribed To:")
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

        //const cycles = Math.round(1 / ((fee / 10000) - 1))
        await fetchToken()
        let fee =  await readContract(config, {
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        })
        
        const cycles = 100n / ((fee % 10000n) / 100n)
        console.log(cycles)


        //calls contract 
        subscriptions =  await readContract(config, {
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [isSubscriber, s]
        })

         //gets fee balance and remaining cycles
        for (var i = 0; i < subscriptions.length; i++) {
            let balance =  await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'feeBalance',
                args: [subscriptions[i].subscription.id, s]
            })

            balance = Number(balance)

            if(balance == 0) {
                feeBalance = 0
                remainingCycles = Number(cycles)
            } else {
                feeBalance = balance

                const remainingBalancePercent = (balance / Number(subscriptions[i].subscription.amount))

                remainingCycles = remainingBalancePercent * String(cycles)
            }
            
            let feeObject = {feeBalance: feeBalance, remainingCycles: remainingCycles}
            feeObjects.push(feeObject)

            //get description from logs
          
            let filter = {provider: subscriptions[i].subscription.provider}
            //changes filter based on if its provider or subscriber
            if(isSubscriber) {
             filter = {subscriber: subscriptions[i].subscription.subscriber }
            }
            
            await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: filter
            }) 
            .then(async function(events){
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
                       detailsArray[i] = events[index].args
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