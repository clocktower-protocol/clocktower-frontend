import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Tab, Tabs} from 'react-bootstrap';
import {CLOCKTOWERSUB_ABI, ADMIN_ACCOUNT, CHAIN_LOOKUP} from "../config"; 
import { useOutletContext } from "react-router";
import ProvidersTable from '../components/ProvidersTable';
import CallerHistoryTable from '../components/CallerHistoryTable';
import SubscribersTable from '../components/SubscribersTable';
import { usePublicClient, useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
//import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';

const Admin = () => {

    const { chainId} = useAccount()

    const [account] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptyArray = [];

    const [allProviders, setAllProviders] = useState(emptyArray)
    const [allSubscribers, setAllSubscribers] = useState(emptyArray)
    const [callerHistory, setCallerHistory] = useState(emptyArray)

    //graphql queries
    const ALL_PROVIDERS_QUERY = gql`
        query {
            subLogs(where: {subScriptEvent: 0}, orderBy: timestamp, orderDirection: desc) {
                provider
            }
        }
    `

    const ALL_SUBCRIBERS_QUERY = gql`
         query {
            subLogs(where: {subScriptEvent: 6}, orderBy: timestamp, orderDirection: desc) {
                subscriber
            }
        }
    `

    const ALL_CALLERS_QUERY = gql`
         query {
            callerLogs(orderBy: timestamp, orderDirection: desc) {
                timestamp
                checkedDay
                caller
                isFinished
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `


   
    const getAllAccounts = useCallback(async () => {
        
        //checks if user is logged into account
        if(typeof account === "undefined") {
            console.log("Not Logged in")
            return
        }

        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

        //variable to pass scope so that the state can be set
        let accounts = []
        let providers = []
        let subscribers = []

        const result = await apolloClient.query({ query: ALL_PROVIDERS_QUERY })
        const result2 = await apolloClient.query({query: ALL_SUBCRIBERS_QUERY})
        const providerSubLogs = result.data.subLogs
        const subscriberSubLogs = result2.data.subLogs

        // Deduplicate providers and subsribers using a Set
        const uniqueProviders = [...new Set(providerSubLogs.map(log => log.provider))];
        const uniqueSubscribers = [...new Set(subscriberSubLogs.map(log => log.subscriber))];

        //iterates through all providers and gets account info
        for(let i = 0; i < uniqueProviders.length; i++) {
            //console.log(uniqueProviders[i])
            
            await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccount',
                args: [uniqueProviders[i]]
            })
            .then(async function(mapAccount) {
                providers.push(mapAccount)
                accounts.push(mapAccount)
            })
            
            
        }

        setAllProviders(providers)

         //iterates through all subscribers and gets account info
         for(let i = 0; i < uniqueSubscribers.length; i++) {
            //console.log(uniqueSubscribers[i])
            
            await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccount',
                args: [uniqueSubscribers[i]]
            })
            .then(async function(mapAccount) {
                subscribers.push(mapAccount)
                accounts.push(mapAccount)
            })
            
        }

        setAllSubscribers(subscribers)
        
        //gets all accounts
        //await fetchToken()
        /*
        await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getTotalSubscribers'
        })
        .then(async function(result) {
            
            let totalSubscribers = result

            //iterates through each subscriber
            for (let i = 0; i < totalSubscribers; i++) {
                await readContract(config, {
                    address: contractAddress,
                    abi: CLOCKTOWERSUB_ABI,
                    functionName: 'accountLookup',
                    args: [i]
                })
                .then(async function(address) {
                    await readContract(config, {
                        address: contractAddress,
                        abi: CLOCKTOWERSUB_ABI,
                        functionName: 'getAccount',
                        args: [address]
                    })
                    .then(async function(mapAccount) {
                        //if account is a producer
                        if(mapAccount.provSubs.length > 0) {
                            providers.push(mapAccount)
                        }
                
                        //if account is a subscriber
                        if(mapAccount.subscriptions.length > 0) {
                            subscribers.push(mapAccount)
                        }

                        accounts.push(mapAccount)
                    })
                })
            }
            setAllProviders(providers)
            setAllSubscribers(subscribers)
        })
        */
        

    },[account, ALL_PROVIDERS_QUERY, ALL_SUBCRIBERS_QUERY, chainId])

    //loads caller list upon login
    useEffect(() =>  {

        /*
        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
        const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

        
        publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event CallerLog(uint40 timestamp, uint40 checkeday, address indexed caller, bool isfinished)'),
            fromBlock: startBlock,
            toBlock: 'latest',
        },function(error, events){ 
            setCallerHistory(events)
        })
        */
        const fetchAllCallers = async () => {

            const result3 = await apolloClient.query({ query: ALL_CALLERS_QUERY })

            const callerLogs = result3.data.callerLogs

            //console.log(callerLogs)

            setCallerHistory(callerLogs)

            getAllAccounts()

        }      
            //getAllAccounts()
            fetchAllCallers()
    
        }, [account, getAllAccounts, publicClient, ALL_CALLERS_QUERY]);


    //checks that user has logged in 
    if(account !== ADMIN_ACCOUNT) {
        return (
            <Alert align="center" variant="danger">Must be Admin</Alert>
        )
    } else {
        return (
        <div>
          
        <div>
        <Alert align="center" variant="secondary">Admin Dashboard</Alert>
        <Tabs
            defaultActiveKey="profile"
            id="admin-tabs"
            className="mb-3"
            justify
        >
            <Tab eventKey="home" title="Caller">
                <CallerHistoryTable
                    callerHistory = {callerHistory}
                />
            </Tab>
            <Tab eventKey="profile" title="Providers">
                      
                <ProvidersTable 
                    allProviders = {allProviders}
                />
                    
            </Tab>
            <Tab eventKey="longer-tab" title="Subscribers">
          
                <SubscribersTable               
                    allSubscribers = {allSubscribers}                   
                />
                     
            </Tab>
 
        </Tabs>
        </div>
        </div>
        )
    }
}

export default Admin