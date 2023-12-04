import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
//import Web3 from 'web3'
import { CLOCKTOWERSUB_ADDRESS} from "../config"; 
import SubHistoryTable from '../SubHistoryTable';
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'

const SubHistory = () => {
    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    /*
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    */

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])
    //const [subscribers, setSubscribers] = useState([emptySubscriptionArray])

    let {id, s, t} = useParams();

    useEffect(() => {
        //gets subscriber events
        
        /*
        clocktowersub.getPastEvents('SubscriberLog', {
            filter: {id:[id], subscriber:[s]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            setHistoryArray(events)
        })
        */
       getLogs()

    }, []);

    const getLogs = async () => {

        const logs = await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event SubscriberLog(bytes32 indexed id, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 indexed subevent)'),
            fromBlock: 0n,
            toBlock: 'latest',
            args: {id: id, subscriber:s}
        })

        //console.log(logs)

        setHistoryArray(logs)
    }

      //checks that user has logged in 
      if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        return (
        <div>
            <div>
                {historyArray.length > 0 ? <Alert align="center" variant="dark">Subscription History</Alert> : <Alert align="center" variant="info">No Subscribers Yet</Alert>}
            </div>
            <div className="subTable">
                <SubHistoryTable 
                    historyArray = {historyArray}
                    ticker = {t}
                />
            </div>
         
        </div>
        )
    }

}

export default SubHistory