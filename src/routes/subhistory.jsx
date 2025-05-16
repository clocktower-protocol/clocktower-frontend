import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import { CHAIN_LOOKUP} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
import { usePublicClient, useAccount } from 'wagmi'
import { parseAbiItem } from 'viem'
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';

const SubHistory = () => {
    const [account] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptySubscriptionArray = [];
   
    const [historyArray, setHistoryArray] = useState([emptySubscriptionArray])

    let {id, t} = useParams();

    const { chainId } = useAccount()

    const GET_LATEST_SUBLOG = gql`
        query GetSubLog($subscriptionId: Bytes!, $subscriber: Bytes!) {
            subLogs(where: {internal_id: $subscriptionId, subscriber: $subscriber}, orderBy: timestamp, orderDirection: asc) {
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

        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
        const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

        /*
        const logs = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
            fromBlock: startBlock,
            toBlock: 'latest',
            args: {id: id, subscriber: account}
        })
        */

        const result = await apolloClient.query({
            query: GET_LATEST_SUBLOG,
            variables: { subscriptionId: id.toLowerCase(), subscriber: account.toLowerCase()}
        });
        const logs = result.data.subLogs;

        console.log(logs)

        setHistoryArray(logs)
    },[account, id, publicClient])

    useEffect(() => {
        //gets subscriber events
        
       getLogs()

    }, [account, getLogs]);

      //checks that user has logged in 
     
        if(historyArray.length === 0) {
            return(
                <Alert align="center" variant="info" className={styles.alerts}>Switch Back to Subscriber</Alert>
            )
        } else {
        return (
        <div>
            <div>
                {historyArray.length > 0 ? <Alert align="center" variant="dark" className={styles.alerts}>Subscription History</Alert> : <Alert align="center" variant="info">No Subscribers Yet</Alert>}
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