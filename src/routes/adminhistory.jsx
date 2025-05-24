import {React, useState, useCallback, useEffect} from 'react';
import {Alert} from 'react-bootstrap';
import { useParams, useOutletContext } from "react-router"
import { ADMIN_ACCOUNT, CHAIN_LOOKUP} from "../config"; 
import { usePublicClient, useAccount } from 'wagmi'
import { parseAbiItem } from 'viem'
import AdminHistoryTable from '../components/AdminHistoryTable';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';

const AdminHistory = () => {

    const [account] = useOutletContext();

    let {a, isp} = useParams();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const { chainId } = useAccount()


    //creates empty array for table
    let emptyArray = []


    const [history, setHistory] = useState([emptyArray])
    const [title, setTitle] = useState([""])

     //graphql queries
    const PROVIDER_HISTORY_QUERY = gql`
        query ProviderHistoryLog($providerAddress: Bytes!) {
            subLogs(where: {provider: $providerAddress}, orderBy: timestamp, orderDirection: desc) {
                id
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
    `

    const SUBSCRIBER_HISTORY_QUERY = gql`
        query SubscriberHistoryLog($subscriberAddress: Bytes!) {
            subLogs(where: {subscriber: $subscriberAddress}, orderBy: timestamp, orderDirection: desc) {
                id
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
    `

    const getLogs = useCallback(async () => {

        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
        const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

        let logs = []

        if(isp === "true"){
            
            /*
            logs = await publicClient.getLogs({
                address: contractAddress,
                event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
                fromBlock: startBlock,
                toBlock: 'latest',
                args: {provider: a}
            })
            console.log(logs)
            */
            
            const result = await apolloClient.query({
                query: PROVIDER_HISTORY_QUERY,
                variables: { providerAddress: a }
            });

            logs = result.data.subLogs
            


            setTitle("Provider: ")    
        } else {
            /*
            logs = await publicClient.getLogs({
                address: contractAddress,
                event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
                fromBlock: startBlock,
                toBlock: 'latest',
                args: {subscriber: a}
            })
            */
            const result2 = await apolloClient.query({
                query: SUBSCRIBER_HISTORY_QUERY,
                variables: { subscriberAddress: a }
            });

            console.log(result2)

            logs = result2.data.subLogs
            
            setTitle("Subscriber: ")
        }

        setHistory(logs)
        
    }, [a, isp, publicClient])

    //loads once
    useEffect( () => {

        getLogs()

    }, [getLogs]);


    //checks that user has logged in 
    if(account !== ADMIN_ACCOUNT) {
        return (
            <Alert align="center" variant="danger">Must be Admin</Alert>
        )
    } else {
        
        return (
            <div>
                <div>
                    {history.length > 0 ? <Alert align="center" variant="dark">{title}&nbsp;&nbsp;&nbsp;{a}</Alert> : ""}
                </div>
                
                <div>
                    <AdminHistoryTable
                        providerHistory = {history}
                        isp = {isp}
                    />
                </div>
            </div>
            
        )
    }

}

export default AdminHistory