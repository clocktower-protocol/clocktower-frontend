import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import { CLOCKTOWERSUB_ADDRESS} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'

const SubHistory = () => {
    const [account, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])

    let {id, t} = useParams();

    useEffect(() => {
        //gets subscriber events
        
       getLogs()

    }, [account]);

    const getLogs = async () => {

        const logs = await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
            fromBlock: 0n,
            toBlock: 'latest',
            args: {id: id, subscriber: account}
        })

        setHistoryArray(logs)
    }

      //checks that user has logged in 
     
        if(historyArray.length === 0) {
            return(
                <Alert align="center" variant="info">Switch Back to Subscriber</Alert>
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