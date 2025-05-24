import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router";
import {Alert} from 'react-bootstrap';
import {CLOCKTOWERSUB_ABI, CHAIN_LOOKUP} from "../config"; 
import SubscriptionsTable from '../components/SubscriptionsTable';
import {usePublicClient, useAccount} from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';

const AdminSubscriptions = () => {

    const [account] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    let {t,s} = useParams();

    const { chainId } = useAccount()

    //creates empty array for table
    let emptySubscriptionArray = [];

    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptySubscriptionArray)
    const [titleMessage, setTitleMessage] = useState("Subscribed To:")
    const [feeObjects, setFeeObjects] = useState(emptySubscriptionArray)
    const [isSubscriber, setIsSubscriber] = useState(true)

     // Query for DetailsLog events
    const GET_LATEST_DETAILS_PROVIDER_LOG = gql`
        query GetLatestDetailsLog($userAddress: Bytes!, $first: Int!) {
            detailsLogs(where: {provider: $userAddress}, first: $first, orderBy: timestamp, orderDirection: desc) {
                internal_id
                provider
                timestamp
                url
                description
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `;

    const GET_LATEST_DETAILS_SUBSCRIBER_LOG = gql`
    query GetLatestDetailsLog($userAddress: Bytes!, $first: Int!) {
        detailsLogs(where: {subscriber: $userAddress}, first: $first, orderBy: timestamp, orderDirection: desc) {
            internal_id
            provider
            timestamp
            url
            description
            blockNumber
            blockTimestamp
            transactionHash
        }
    }
    `;


    const getSubsByAccount = useCallback(async (t, s) => {
        //checks if user is logged into account
        if(typeof account === "undefined") {
            console.log("Not Logged in")
            return
        }
            
        //variable to pass scope so that the state can be set
        let subscriptions = []
        let isSubscriber = true
        let titleMessage = "Subscribed By:"

        if(t === "provider") {
            isSubscriber = false
            titleMessage = "Created By:"
        }
    
        let feeObjects = []
        let feeBalance
        let remainingCycles

        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
        const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

        //const cycles = Math.round(1 / ((fee / 10000) - 1))
        //await fetchToken()
        let fee =  await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        })

         //converts fee to number 
         let numFee = Number(fee)

         //const cycles = 100n / ((fee % 10000n) / 100n)
         const cycles = 100 / ((numFee % 10000) / 100)
        
    
        //calls contract 
        subscriptions =  await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [isSubscriber, s]
        })

         //gets fee balance and remaining cycles
        for (var i = 0; i < subscriptions.length; i++) {
            let balance =  await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'feeBalance',
                args: [subscriptions[i].subscription.id, s]
            })

            const subIndex = i

            balance = Number(balance)

            if(balance === 0) {
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
          
            /*
            let filter = {provider: subscriptions[i].subscription.provider}
            //changes filter based on if its provider or subscriber
            if(isSubscriber) {
             filter = {subscriber: subscriptions[i].subscription.subscriber }
            }
            */
            

            /*            
            await publicClient.getLogs({
                address: contractAddress,
                event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
                fromBlock: startBlock,
                toBlock: 'latest',
                args: filter
            }) 
            .then(async function(events){
                //checks for latest update by getting highest timestamp
                if(events !== undefined) {
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
                       detailsArray[subIndex] = events[index].args
                    }    
                }
            })
            */
            
            if(!isSubscriber) {
                const result = await apolloClient.query({
                    query: GET_LATEST_DETAILS_PROVIDER_LOG,
                    variables: { userAddress: subscriptions[i].subscription.provider, first: 1 }
                });
                detailsArray[subIndex] = result.data.detailsLogs[0]

            } else {
                const result = await apolloClient.query({
                    query: GET_LATEST_DETAILS_SUBSCRIBER_LOG,
                    variables: { userAddress: subscriptions[i].subscription.subscriber, first: 1 }
                });
                detailsArray[subIndex] = result.data.detailsLogs[0]
            }
            
}

       
        setFeeObjects(feeObjects)
        setTitleMessage(titleMessage)
        setSubscriptionArray(subscriptions)
        setDetailsArray(detailsArray)
       
    },[account, detailsArray, publicClient])

    //loads provider subscription list upon login
    useEffect(() => {
        if(t === "provider") {
            setIsSubscriber(false)
        }

        getSubsByAccount(t,s)
    }, [account, t, s, getSubsByAccount]);


    //checks that user has logged in 
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

export default AdminSubscriptions