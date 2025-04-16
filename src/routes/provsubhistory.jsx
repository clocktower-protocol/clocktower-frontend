import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import { CLOCKTOWERSUB_ADDRESS, EVENT_START_BLOCK, CHAIN_LOOKUP} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
import { usePublicClient, useAccount} from 'wagmi'
import { parseAbiItem } from 'viem'
import styles from '../css/clocktower.module.css';

const ProvSubHistory = () => {
    const [account] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const { chainId } = useAccount()

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])

    let {id, t} = useParams();


    const getLogs = useCallback(async () => {

        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

        //looks up provider from contract
            const logs = await publicClient.getLogs({
                address: contractAddress,
                event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
                fromBlock: EVENT_START_BLOCK,
                toBlock: 'latest',
                args: {id: id}
            })

            setHistoryArray(logs)
    },[id, publicClient])

    //loads once
    useEffect( () => {
        //gets subscriber events
        
        getLogs()

    }, [getLogs]);

    //if(typeof historyArray[0].args !== "undefined") {
    if(historyArray.length > 0 && typeof historyArray[0].args !== "undefined") {
    //checks that user has logged in  
        if(historyArray[0].args.provider !== account) {
                return(
                    <Alert align="center" variant="info" className={styles.alerts}>Switch Back to Provider Account</Alert>
                )
        } else {
        
            return (
            <div>
                <div>
                    {historyArray.length > 0 ? <Alert align="center" variant="dark" className={styles.alerts}>Subscription History</Alert> : <Alert align="center" variant="info" className={styles.alerts}>No Subscribers Yet</Alert>}
                </div>
                
                <div className="subTable">
                    <SubHistoryTable 
                        historyArray = {historyArray}
                        ticker = {t}
                        isProvider = {true}
                    />
                </div>
            </div>
            )
        }
    }
} 

export default ProvSubHistory