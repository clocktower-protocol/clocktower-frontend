import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 


const ProvSubscription = () => {
    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    const [subscribers, setSubscribers] = useState()

    let {id} = useParams();

    
    //gets list of subscribers from contract
    const getSubs = async () => await clocktowersub.methods.getSubscribers(id).call({from: account})
    .then(function(result) {
        setSubscribers(result)
    })
    
    

    //TODO: gets subscription history
    //await clocktowersub.getPastEvents('')
}

export default ProvSubscription