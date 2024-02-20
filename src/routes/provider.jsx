/* global BigInt */
import React, {useEffect, useState, useRef} from 'react'
import {Alert, Accordion} from 'react-bootstrap';
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
import SubscriptionsTable from '../SubscriptionsTable';
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'

const Provider = () => {
    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const { address, connector: activeConnector } = useAccount()

    let isMounting = useRef(true)


    //creates empty array for table
    let emptySubscriptionArray = []
    let emptyDetails = []
    const [alertType, setAlertType] = useState("danger")
    const [token, setToken] = useState(ZERO_ADDRESS)
    //const [tokenABI, setTokenABI] = useState({})
    const [frequency, setFrequency] = useState(0)
    const [dueDay, setDueDay] = useState(0)
    const [description, setDescription] = useState("")
    const [domain, setDomain] = useState("")
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [amount, setAmount] = useState(0.00)
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptyDetails)
    const [details, setDetails] = useState({})
    const [cancelledSub, setCancelledSub] = useState({})
   // const fee = 0.1

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //sets mounting bool to not mounting after initial load
    useEffect(() => {
        isMounting.current = true
        console.log("HERE")
    },[])
    
    //loads provider subscription list upon login
    useEffect(() => {

        getProviderSubsWAGMI()
       
    }, [account]);

    /*
    const createSubscription3 = useWriteContract({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'createSubscription',
        args: [amount, token, details, frequency, dueDay]
    })
    */
    const { data, writeContract } = useWriteContract()
    
    const wait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data
    })

    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(details).length !== 0) {
            console.log("not mounting it")
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'createSubscription',
                args: [amount, token, details, frequency, dueDay]
            })
        } else {
            console.log("mounting...")
            isMounting.current = false
        }
    },[details])

    //cancel subscription
    /*
    const cancelSubscription2 = useWriteContract({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'cancelSubscription',
        args: [cancelledSub]
    })
    

    const cancelWait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: cancelSubscription2.data?.hash,
    })
    */

    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(cancelledSub).length !== 0) {
            console.log(cancelledSub)
            console.log("cancel triggered!")
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'cancelSubscription',
                args: [cancelledSub]
            })
        } else {
            console.log("mounting!")
            isMounting.current = false
        }
    },[cancelledSub])
    
    //shows alert when waiting for transaction to finish
    useEffect(() => {

        if(wait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(wait.isSuccess) {

            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")

            getProviderSubsWAGMI()
            
        }
    },[wait.isLoading, wait.isSuccess])

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

    
    const getProviderSubsWAGMI = async () => {
         //checks if user is logged into account
        
         if(!isLoggedIn() || typeof address === "undefined") {
            console.log("Not Logged in")
            return
        }
        
        //checks dns record
        try {
        var response = await fetch('https://dns.google/resolve?name=ct.clocktower.finance&type=TXT');
        
            
            var json = await response.json();
            if(json.Answer[0].data !== undefined){
                console.log(json.Answer[0].data);
            }
        }
         catch(Err) {
            console.log(Err)
        }

        //variable to pass scope so that the state can be set
        let accountSubscriptions = []

        try{
        await readContract(config, {
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [false, account]
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
    } catch(Err) {
        console.log(Err)
    }
         
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
            
                <div className="clockMeta">
                    {alertMaker()}
                    <div className="clockBody">
                        <div className="clockFormDiv">  
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                <Accordion.Header>Create Subscription</Accordion.Header>
                                <Accordion.Body>
                                    <CreateSubForm
                                        token = {token}
                                        amount = {amount}
                                        frequency = {frequency}
                                        dueDay = {dueDay}
                                        description = {description}
                                        domain = {domain}
                                        email = {email}
                                        url = {url}
                                        phone = {phone}

                                        setToken = {setToken}
                                        //setTokenABI = {setTokenABI}
                                        setAmount = {setAmount}
                                        setFrequency = {setFrequency}
                                        setDueDay = {setDueDay}
                                        setDescription = {setDescription}
                                        setDomain = {setDomain}
                                        setEmail = {setEmail}
                                        setUrl = {setUrl}
                                        setPhone = {setPhone}
                                        setDetails = {setDetails}
                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                    />
                                </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>

                            <div>
                                {subscriptionArray.length > 0 ? <Alert align="center" variant="dark">Created Subscriptions</Alert> : ""}
                            </div>
                            <div className="provHistory">
                                {!isTableEmpty(subscriptionArray) ?
                                <SubscriptionsTable
                                    subscriptionArray = {subscriptionArray}
                                    isAdmin = {false}
                                    role = {1}
                                    detailsArray = {detailsArray}
                                    setCancelledSub = {setCancelledSub}
                                />
                                : <div></div>}
                                
                            </div>
                    </div>
                </div>
            )
    }
}

export default Provider
