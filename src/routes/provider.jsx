/* global BigInt */
import React, {useEffect, useState, useRef} from 'react'
import {Alert, Accordion} from 'react-bootstrap';
//import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
//import ProviderSubsTable from '../ProviderSubsTable';
import SubscriptionsTable from '../SubscriptionsTable';
//import { zeroAddress } from '@ethereumjs/util';
import { useContractWrite, useWaitForTransaction, usePublicClient, useAccount } from 'wagmi'
//import { useDebounce } from 'usehooks-ts'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'

//TODO: Prepare hooks, fix no login bug and cancel call being too sensitive

const Provider = () => {
    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const { address } = useAccount()

    let isMounting = useRef(true)

    //creates contract variable
   // const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
   // const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
   // const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    //creates empty array for table
    let emptySubscriptionArray = []
    let emptyDetails = []
    const [alertType, setAlertType] = useState("danger")
   // const [hour, setHour] = useState("0")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState({})
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
    //const [fee, setFee] = useState(0.1)
    //const [isTableEmpty, setIsTableEmpty] = useState(true)
    const fee = 0.1

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

    //create subscription
    /*
    const createConfig = usePrepareContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'createSubscription',
        args: [amount, token, details, frequency, dueDay]
    })
    */

    /*
    const createSubscription3 = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'createSubscription',
        args: [amount, token, details, frequency, dueDay]
    })
    */
    const createSubscription3 = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'createSubscription',
        args: [amount, token, details, frequency, dueDay]
    })
    
    const createWait = useWaitForTransaction({
        confirmations: 1,
        hash: createSubscription3.data?.hash,
    })

    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(details).length !== 0) {
            console.log("not mounting it")
            createSubscription3.write()
        } else {
            console.log("mounting...")
            isMounting.current = false
        }
    },[details])

    //cancel subscription
    const cancelSubscription2 = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'cancelSubscription',
        args: [cancelledSub]
    })

    const cancelWait = useWaitForTransaction({
        confirmations: 1,
        hash: cancelSubscription2.data?.hash,
    })

    useEffect(() => {
       // console.log(JSON.stringify(cancelledSub))
        //calls wallet
        if(!isMounting.current && Object.keys(cancelledSub).length !== 0) {
            console.log(cancelledSub)
            console.log("cancel triggered!")
            cancelSubscription2.write()
        } else {
            console.log("mounting!")
            isMounting.current = false
        }
    },[cancelledSub])
    
    //shows alert when waiting for transaction to finish
    useEffect(() => {

        if(createWait.isLoading || cancelWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(createWait.isSuccess || cancelWait.isSuccess) {

           // console.log(data.status)
            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")

            getProviderSubsWAGMI()
            
        }
    },[createWait.isLoading, createWait.isSuccess, cancelWait.isLoading, cancelWait.isSuccess])

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

    /*

     //confirms transaction by looping until it gets confirmed
     const confirmTransaction = async (txHash) => {

        //gets transaction details
        const trx = await web3.eth.getTransaction(txHash)

        let isDone = false;
        
        //trys every five seconds to see if transaction is confirmed
        isDone = setTimeout(async () => {

        // console.log(trx.blockNumber)
        if(trx.blockNumber) {
            //turns off alert and loads/reloads table
            setAlert(false)
            setAlertType("danger")
            await getProviderSubsWAGMI()
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
    */

    const getProviderSubsWAGMI = async () => {
         //checks if user is logged into account
        
         if(!isLoggedIn()) {
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
        await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [false, account]
        })
        .then(async function(result) {
            accountSubscriptions = result

           // console.log(accountSubscriptions)

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
                      //  console.log(events)
                        
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

               // console.log(detailsArray)
                
            }
            setSubscriptionArray(accountSubscriptions)
            setDetailsArray(detailsArray)
        })
    } catch(Err) {
        console.log(Err)
    }
         
    }

    /*
    const getProviderSubs = async () => {
         //checks if user is logged into account
        
        if(!isLoggedIn()) {
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
    
        //calls contract 
        await clocktowersub.methods.getAccountSubscriptions(false, account).call({from: account})
        .then(async function(result) {
            accountSubscriptions = result

            //loops through each subscription
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
                       
                        if(events.length > 0)
                        {
                            for (var j = 0; j < events.length; j++) {
                                if(time < events[j].returnValues.timestamp)
                                {
                                    time = events[j].returnValues.timestamp
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
        })
    }
    */

    /*
    const createSubscription2 = async () => {

        const details = {
            domain: domain,
            url: url,
            email: email,
            phone: phone,
            description: description
        }

        try{
        /*
        const { config } = await prepareWriteContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'createSubscription',
            chainId: 31337,
            args: [amount, token, details, frequency, dueDay]
        })
        */

        /*
        const { hash } = await writeContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'createSubscription',
            args: [amount, token, details, frequency, dueDay]
        })

        
        const {data, isLoading, isSuccess } = await waitForTransaction({
            hash,
        })
        

        } catch (e) {   
            console.log(e)
        }
        
    }

    const createSubscription = async () => {

        let feeHex = Web3.utils.toHex(Web3.utils.toWei(String(fee)))

        const details = {
            domain: domain,
            url: url,
            email: email,
            phone: phone,
            description: description
        }

        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.createSubscription(amount,token,details,frequency, dueDay).encodeABI(),
            value: feeHex
        }

        try{
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
        }catch(e){
            console.log(e)
        }
    }
    */

    /*
    const cancelSubscription = async (subscription) => {
        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.cancelSubscription(subscription).encodeABI(),
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
    */

    const isTableEmpty = (subscriptionArray) => {
        
        //console.log(subscriptionArray.length)
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
       // if(!isTableEmpty(subscriptionArray)) {
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
                                       // details = {details}

                                        setToken = {setToken}
                                        setTokenABI = {setTokenABI}
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
                                        //createSubscription = {createSubscription}
                                        //createSubscription2 = {createSubscription2}
                                       // createSubscription3 = {createSubscription3.write}
                                    />
                                </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>

                            <div>
                                {subscriptionArray.length > 0 ? <Alert align="center" variant="dark">Created Subscriptions</Alert> : ""}
                            </div>
                            <div className="provHistory">
                                {/*
                                <ProviderSubsTable 
                                    subscriptionArray={subscriptionArray}
                                    cancelSubscription = {cancelSubscription}
                                   // setIsTableEmpty = {setIsTableEmpty}
                                />
                                */ 
                            }
                                {!isTableEmpty(subscriptionArray) ?
                                <SubscriptionsTable
                                    subscriptionArray = {subscriptionArray}
                                    isAdmin = {false}
                                    role = {1}
                                   // cancelSubscription = {cancelSubscription}
                                    detailsArray = {detailsArray}
                                    setCancelledSub = {setCancelledSub}
                                />
                                : <div></div>}
                                
                            </div>
                    </div>
                </div>
            )
       // } else {
            return (
                <div className="clockMeta">
                    {alertMaker()}
                    <div className="clockBody">
                        <div className="clockFormDiv">  
                            <Accordion bgcolor="grey">
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
                                       // details = {details}
                                        
                                        setToken = {setToken}
                                        setTokenABI = {setTokenABI}
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
                                       // createSubscription = {createSubscription}
                                       // createSubscription2 = {createSubscription2}
                                     //   createSubscription3 = {createSubscription3.write}
                                    />
                                </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </div>
                </div>
            )
       // }
    }
}

export default Provider
