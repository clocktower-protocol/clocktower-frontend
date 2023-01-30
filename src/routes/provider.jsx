import React, {useEffect, useState} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
import ProviderSubsTable from '../ProviderSubsTable';
/* global BigInt */

const Provider = () => {
    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    //creates empty array for table
    let emptySubscriptionArray = [];

    const [alertType, setAlertType] = useState("danger")
    const [hour, setHour] = useState("0")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState({})
    const [frequency, setFrequency] = useState(0)
    const [dueDay, setDueDay] = useState(1)
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState(0.00)
    const [subscriptionArray, setSubscriptionArray] = useState(emptySubscriptionArray)


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
            getProviderSubs()
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
            
        //variable to pass scope so that the state can be set
        let accountSubscriptions = []
    
        //calls contract 
        await clocktowersub.methods.getAccountSubscriptions(false).call({from: account})
        .then(function(result) {
        accountSubscriptions = result
            setSubscriptionArray(accountSubscriptions)
        })
    }


    const createSubscription = async () => {
        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.createSubscription(amount,token,description, token, frequency, dueDay).encodeABI(),
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

    return (
        <>
        <div className="clockMeta">
            {alertMaker()}
            <div className="clockBody">
                <div className="clockFormDiv">
                    <div>
                        <CreateSubForm
                            token = {token}
                            amount = {amount}
                            frequency = {frequency}
                            dueDay = {dueDay}
                            description = {description}

                            
                            setToken = {setToken}
                            setTokenABI = {setTokenABI}
                            setAmount = {setAmount}
                            setFrequency = {setFrequency}
                            setDueDay = {setDueDay}
                            setDescription = {setDescription}
                            setAlert = {setAlert}
                            setAlertText = {setAlertText}
                            createSubscription = {createSubscription}
                        />
                    </div>
                    <div className="clockTableDiv">
                        <ProviderSubsTable subscriptionArray={subscriptionArray}></ProviderSubsTable>
                    </div>
                </div>
            </div>
        </div>
        </>
    )

}

export default Provider