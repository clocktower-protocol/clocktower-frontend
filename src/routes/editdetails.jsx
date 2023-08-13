import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams, useNavigate} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config";
import EditDetailsForm from '../EditDetailsForm';

const EditDetails = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    let {id} = useParams();

    const navigate = useNavigate()

    const [details, setDetails] = useState({})
    const [alertType, setAlertType] = useState("danger")
    const [description, setDescription] = useState("")
    const [domain, setDomain] = useState("")
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
   

    const fee = 0.1

    //loads once
    
    useEffect(() => {
        //gets subscriber events
        /*
        clocktowersub.getPastEvents('SubscriberLog', {
            filter: {id:[id]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            //setHistoryArray(events)
        })
        */
       /*
        let tempDetails = {}
        await clocktowersub.getPastEvents('DetailsLog', {
            filter: {id:[id]},
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
                   tempDetails = events[index].returnValues
                }    
            }
        })

        setDetails(tempDetails)
        */
        getDetails()
    }, [account]);

    const sendToProvDash = useCallback(() => 
    navigate('/provider', {replace: true})
    ,[navigate])
    

    const getDetails = async () => {
        let tempDetails = {}
        await clocktowersub.getPastEvents('DetailsLog', {
            filter: {id:[id]},
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
                        console.log(events[j].returnValues.timestamp)
                    }
                   //adds latest details to details array
                   tempDetails = events[index].returnValues
                }    
            }
        })

        setDetails(tempDetails)
        setDescription(tempDetails.description)
        setDomain(tempDetails.domain)
        setEmail(tempDetails.email)
        setUrl(tempDetails.url)
        setPhone(tempDetails.phone)
    }

    const editDetails = async () => {
    

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
            data: clocktowersub.methods.editDetails(details,id).encodeABI(),
            //value: feeHex
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

       // sendToProvDash()


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
            //await getProviderSubs()
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

    //checks that user has logged in 
    if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        return (
        <div>
             {alertMaker()}
            <div>
                {details.description !== undefined ? <Alert align="center" variant="dark">Edit Details</Alert> : <Alert align="center" variant="info">Unrecognized Subscription</Alert>}
            </div>
            
            <div className="subTable">
                <EditDetailsForm
                    details = {details}
                    description = {description}
                    domain = {domain}
                    email = {email}
                    url = {url}
                    phone = {phone}

                    editDetails = {editDetails}
                    setDescription = {setDescription}
                    setDomain = {setDomain}
                    setEmail = {setEmail}
                    setUrl = {setUrl}
                    setPhone = {setPhone}
                />
            </div>
        </div>
        )
    }
}

export default EditDetails 