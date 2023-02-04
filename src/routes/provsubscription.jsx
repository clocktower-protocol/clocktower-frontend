import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import ProvSubDetailTable from '../ProvSubDetailTable';


const ProvSubscription = () => {
    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])
    const [subscribers, setSubscribers] = useState([emptySubscriptionArray])

    let {id} = useParams();

    //loads once
    useEffect(() => {
        //gets subscriber events
        
        clocktowersub.getPastEvents('SubscriberLog', {
           // filter: {id:[id]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            setHistoryArray(events)
        })
        

        /*
        clocktowersub.events.SubscriberLog({
           // filter: {id: [id]},
            fromBlock: 0
        }, function(error, events){ 
            console.log(events)
            console.log("here")
            setHistoryArray(events)
        })
        */
        /*
        clocktowersub.events.allEvents({}, function(error, events){ 
            console.log(events)
           // setHistoryArray(events)
        })
        */

    }, []);

    //console.log(historyArray.length)
    
    //gets list of subscribers from contract
    const getSubs = async () => await clocktowersub.methods.getSubscribers(id).call({from: account})
    .then(function(result) {
        setSubscribers(result)
    })

    /*
      <div>
                <ProvSubDetailTable 
                    historyArray = {historyArray}
                />
            </div>
    */

    //checks that user has logged in 
    if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        return (
        <div>
            <div>
                {historyArray.length > 0 ? <Alert align="center" variant="dark">Subscription History</Alert> : ""}
            </div>
            <div className="clockTableDiv">
                <ProvSubDetailTable 
                    historyArray = {historyArray}
                />
            </div>
         
        </div>
        )
    }

} 

export default ProvSubscription