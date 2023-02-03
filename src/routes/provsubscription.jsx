import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import ProvSubDetailTable from '../ProvSubDetailTable';


const ProvSubscription = () => {
    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates empty array for table
    let emptySubscribeArray = [];
    
    const [subscribes, setSubscribes] = useState(emptySubscribeArray)

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    const [subscribers, setSubscribers] = useState()
    const [historyArray, setHistoryArray] = useState()

    let {id} = useParams();

    //loads once
    useEffect(() => {
        //gets subscriber events
        clocktowersub.getPastEvents('SubscriberLog', {
            filter: {id:[id]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            setHistoryArray(events)
         })
    }, [account]);

    
    //gets list of subscribers from contract
    const getSubs = async () => await clocktowersub.methods.getSubscribers(id).call({from: account})
    .then(function(result) {
        setSubscribers(result)
    })

    //checks that user has logged in 
    if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        return (
            <ProvSubDetailTable 
                historyArray = {historyArray}
            />
        )
    }

} 

export default ProvSubscription