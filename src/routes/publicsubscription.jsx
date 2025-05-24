import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Toast, ToastContainer, Spinner} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate} from "react-router";
import {CLOCKTOWERSUB_ABI, INFINITE_APPROVAL, ZERO_ADDRESS, CHAIN_LOOKUP} from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount} from 'wagmi'
import { readContract} from 'wagmi/actions'
import { parseAbiItem, erc20Abi} from 'viem'
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';


/* global BigInt */

const PublicSubscription = () => {

    const { address, chainId } = useAccount()

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const [account] = useOutletContext();

    let {id, f, d} = useParams();

    const navigate = useNavigate()

    const [subscription, setSubscription] = useState("")
    
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [alertType, setAlertType] = useState("danger")
    const [subscribed, setIsSubscribed] = useState(false)
    const [isProvider, setIsProvider] = useState(false)
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)
    //card variables
    let emptyArray = []
    const [formattedSub, setFormattedSub] = useState(emptyArray)
    const [formattedDetails, setFormattedDetails] = useState(emptyArray)
    //alerts
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")
   
    const { data, variables, writeContract } = useWriteContract()

    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 2,
        hash: data,
    })

     // Query for DetailsLog events
    const GET_LATEST_DETAILS_LOG = gql`
        query GetLatestDetailsLog($subscriptionId: Bytes!, $first: Int!) {
            detailsLogs(where: {internal_id: $subscriptionId}, first: $first, orderBy: timestamp, orderDirection: desc) {
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


    //loads provider subscription list upon receiving parameter
    useEffect(() => {

        const getSub = async () => {

            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
            const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

            await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                //functionName: 'getSubByIndex',
                functionName: 'idSubMap',
                //args: [id, f, d]
                args: [id]
            })
            .then(async function(result) {
                const resultSub = {
                    id: result[0],
                    amount: result[1],
                    provider: result[2],
                    token: result[3],
                    cancelled: result[4], 
                    frequency: result[5], 
                    dueDay: result[6]
                }
                /*
                await publicClient.getLogs({
                    address: contractAddress,
                    event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
                    fromBlock: startBlock,
                    toBlock: 'latest',
                    args: {id:[resultSub.id]}
                }) 
                .then(async function(events){
                    //checks for latest update by getting highest timestamp
                    if(events !== undefined) {
                        
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
                            const tempDetails = [events[index].args]
                            setFormattedDetails(tempDetails)
                        }       
                    }    
                })
                */
                const result2 = await apolloClient.query({
                    query: GET_LATEST_DETAILS_LOG,
                    variables: { subscriptionId: resultSub.id.toLowerCase(), first: 1 }
                });
                const tempDetails= [result2.data.detailsLogs[0]]
                setFormattedDetails(tempDetails)

                console.log(tempDetails)

                //setSubscription(result)
                setSubscription(resultSub)
                //setToken(result.token)
                setToken(resultSub.token)
                //const tempSub = [{subscription: result, status: 0, totalSubscribers: 0}]
                const tempSub = [{subscription: resultSub, status: 0, totalSubscribers: 0}]
                setFormattedSub(tempSub)
                
            })
        }

        const isSubscribed = async () => {
            
            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

            let result = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubscribersById',
                args: [id]
            })
            let status = false
            
            result.forEach((element) => {
                if(element.subscriber === account) {
                    setIsSubscribed(true)
                    status = true
                    return
                }
            })

            if(status) {
                setAlertType("warning")
                setAlert(true)
                setAlertText("Already Subscribed")
            }
            //return false
            setIsSubscribed(status)
            
        }
     
        const isProviderSame = async () => {
            
            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

            let result = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                //functionName: 'getSubByIndex',
                functionName: 'idSubMap',
                //args: [id, f, d]
                args: [id]
            })

            const resultSub = {
                id: result[0],
                amount: result[1],
                provider: result[2],
                token: result[3],
                cancelled: result[4], 
                frequency: result[5], 
                dueDay: result[6]
            }

            //if(result.provider === account) {
            if(resultSub.provider === account) {
                setIsProvider(true)
            } else {
                setIsProvider(false)
            }
        }

        if(typeof account !== "undefined"){
            getSub()
            isSubscribed()
            isProviderSame()
        }

    }, [account, d, f, id, publicClient, setAlert, setAlertText]);
    
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


    //subscribes to contract
    const subscribe = useCallback(async () => {

        //first requires user to approve unlimited allowance
        setToastHeader("Waiting on wallet transaction...")
        setShowToast(true)

        //checks if user already has allowance

        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

        const allowanceBalance = await readContract(config, {
            address: token,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, contractAddress]
        })
        
        if(BigInt(allowanceBalance) < 100000000000000000000000n) {
            //if allowance has dropped below 100,000 site requests infinite approval again
            
            writeContract({
                address: token,
                abi: erc20Abi,
                functionName: 'approve',
                args: [contractAddress, INFINITE_APPROVAL]
            })
           
        } else {

            //subscribes
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'subscribe',
                args: [subscription]
            })
        }
    
       
    },[subscription, address, token, writeContract])

    const sendToAccount = useCallback(() => 
            navigate(`/subscriptions/subscribed`)
    ,[navigate])


     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(subscribeWait.isLoading) {
        
            setToastHeader("Transaction Pending")
        }

        if(subscribeWait.isSuccess) {

            //turns off alert
            setShowToast(false)

            //if approval is set calls subscribe function again
            if(variables.functionName === "approve"){
                subscribe()
                
            } else {
                sendToAccount()
            }
        }
    },[subscribeWait.isLoading, subscribeWait.isSuccess, sendToAccount, setAlert, setAlertText, variables, subscribe])
   
    //checks that user has logged in 
   
        return (
            <div className={styles.top_level_public}> 
                {alertMaker()}
                <ToastContainer position="top-center">
                <   Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                        <Toast.Header style={{justifyContent: "space-between"}}>
                                <Spinner animation="border" variant="info" />
                                {toastHeader}
                        </Toast.Header>
                        </Toast>
             </ToastContainer>
          
                <div style={{justifyContent:"center", display:"flex", paddingTop:"30px"}}>
                    <SubscriptionCards
                        subscriptionArray = {formattedSub}
                        detailsArray = {formattedDetails}
                        isProvider = {isProvider}
                        isLink = {true}
                        isSubscribed = {subscribed}
                        subscribe = {subscribe}
                    />
                </div>
                 
            </div>
        )
}

export default PublicSubscription