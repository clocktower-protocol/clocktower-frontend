import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
//import { CHAIN_LOOKUP} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
import { usePublicClient, useAccount} from 'wagmi'
//import { parseAbiItem } from 'viem'
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';

const ProvSubHistory = () => {
    const [account] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const { chainId } = useAccount()

    //creates empty array for table
    let emptySubscriptionArray = [];

    const lowerAccount = account.toLowerCase()
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])

    let {id, t} = useParams();

    const GET_SUBLOGS = gql`
        query GetSubLog($subscriptionId: Bytes!) {
            subLogs(where: {internal_id: $subscriptionId}, orderBy: timestamp, orderDirection: desc) {
                internal_id
                provider
                subscriber
                timestamp
                amount
                token
                subScriptEvent
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `;


    const getLogs = useCallback(async () => {

        
        const result = await apolloClient.query({
                            query: GET_SUBLOGS,
                            variables: { subscriptionId: id.toLowerCase()}
                    });
        const logs = result.data.subLogs;
        //console.log(logs)

        setHistoryArray(logs)
    },[id, publicClient])

    //loads once
    useEffect( () => {
        //gets subscriber events
        
        getLogs()

    }, [getLogs]);

    //if(typeof historyArray[0].args !== "undefined") {
    if(historyArray.length > 0 && typeof historyArray[0] !== "undefined") {
    //checks that user has logged in  
        if(historyArray[0].provider !== lowerAccount) {
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