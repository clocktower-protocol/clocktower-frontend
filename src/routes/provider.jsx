import React, {useEffect, useState} from 'react'
import {Alert, Accordion} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
//import ProviderSubsTable from '../ProviderSubsTable';
import SubscriptionsTable from '../SubscriptionsTable';

import EthCrypto from 'eth-crypto';
import { fromString } from 'uint8arrays/from-string'

const Provider = () => {
    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

   // console.log(account)

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
   // const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    //creates empty array for table
    let emptySubscriptionArray = []
    let emptyDetails = []
    const [alertType, setAlertType] = useState("danger")
   // const [hour, setHour] = useState("0")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState({})
    const [frequency, setFrequency] = useState(0)
    const [dueDay, setDueDay] = useState(1)
    const [description, setDescription] = useState("")
    const [domain, setDomain] = useState("")
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [amount, setAmount] = useState(0.00)
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)
    const [detailsArray, setDetailsArray] = useState(emptyDetails)
    //const [fee, setFee] = useState(0.1)
    //const [isTableEmpty, setIsTableEmpty] = useState(true)
    const fee = 0.1
    
    //loads provider subscription list upon login
    useEffect(() => {
        getProviderSubs()
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

        let isDone = false;
        
        //trys every five seconds to see if transaction is confirmed
        isDone = setTimeout(async () => {

        // console.log(trx.blockNumber)
        if(trx.blockNumber) {
            //turns off alert and loads/reloads table
            setAlert(false)
            setAlertType("danger")
            await getProviderSubs()
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

    const createSubscription = async () => {

        let feeHex = Web3.utils.toHex(Web3.utils.toWei(String(fee)))

        /*
        const accountArray = fromString(String(account));

        const encryptedURL = await EthCrypto.encryptWithPublicKey(
            accountArray, 
            JSON.stringify(url) 
        );
        const encryptedURLString = EthCrypto.cipher.stringify(encryptedURL);
        */

        console.log(encryptedURLString)

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
        if(!isTableEmpty(subscriptionArray)) {
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
                                        setTokenABI = {setTokenABI}
                                        setAmount = {setAmount}
                                        setFrequency = {setFrequency}
                                        setDueDay = {setDueDay}
                                        setDescription = {setDescription}
                                        setDomain = {setDomain}
                                        setEmail = {setEmail}
                                        setUrl = {setUrl}
                                        setPhone = {setPhone}
                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                        createSubscription = {createSubscription}
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
                                */ }
            
                                <SubscriptionsTable
                                    subscriptionArray = {subscriptionArray}
                                    isAdmin = {false}
                                    role = {1}
                                    cancelSubscription = {cancelSubscription}
                                    detailsArray = {detailsArray}
                                />
            
                                
                            </div>
                    </div>
                </div>
            )
        } else {
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
                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                        createSubscription = {createSubscription}
                                    />
                                </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default Provider
