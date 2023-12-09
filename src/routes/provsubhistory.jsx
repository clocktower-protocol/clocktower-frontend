import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
//import Web3 from 'web3'
import { CLOCKTOWERSUB_ADDRESS} from "../config"; 
//import ProvSubDetailTable from '../ProvSubDetailTable';
import SubHistoryTable from '../SubHistoryTable';
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
//import {ethers} from 'ethers'

const ProvSubHistory = () => {
    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    /*
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    */

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])
    //const [subscribers, setSubscribers] = useState([emptySubscriptionArray])

    let {id, t} = useParams();

    //loads once
    useEffect( () => {
        //gets subscriber events
        
        /*
        clocktowersub.getPastEvents('SubscriberLog', {
            filter: {id:[id]},
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

        //looks up provider from contract
        /*
        await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [false, account]
        })
        .then(async function(result) {
        */
        
            const logs = await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event SubscriberLog(bytes32 indexed id, address indexed subscriber, address provider, uint40 timestamp, uint256 amount, address token, uint8 indexed subevent)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {id: id}
            })

            //console.log(logs)

            setHistoryArray(logs)
      //  })
        
        /*
        const iface = new ethers.Interface(CLOCKTOWERSUB_ABI);
        console.log(iface.format('full'));
        */
    }

    //console.log(historyArray.length)
    
    /*
    //gets list of subscribers from contract
    const getSubs = async () => await clocktowersub.methods.getSubscribers(id).call({from: account})
    .then(function(result) {
        setSubscribers(result)
    })
    */
    console.log(historyArray[0].args)
    if(typeof historyArray[0].args !== "undefined") {
    //checks that user has logged in 
    if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        
        if(historyArray[0].args.provider != account) {
                return(
                    <Alert align="center" variant="info">Switch Back to Provider Account</Alert>
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
    }

} 

export default ProvSubHistory