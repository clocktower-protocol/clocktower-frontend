import React, {useEffect, useState} from 'react'
import {Alert, Tab, Tabs} from 'react-bootstrap';
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ADMIN_ACCOUNT} from "../config"; 
import { useOutletContext } from "react-router-dom";
import ProvidersTable from '../ProvidersTable';
import CallerHistoryTable from '../CallerHistoryTable';
import SubscribersTable from '../SubscribersTable';
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'

const Admin = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptyArray = [];

    //const [allAccounts, setAllAccounts] = useState(emptyArray)
    const [allProviders, setAllProviders] = useState(emptyArray)
    const [allSubscribers, setAllSubscribers] = useState(emptyArray)
    const [callerHistory, setCallerHistory] = useState(emptyArray)
    

    //loads provider subscription list upon login
    useEffect(() => {

      
    publicClient.getLogs({
        address: CLOCKTOWERSUB_ADDRESS,
        event: parseAbiItem('event CallerLog(uint40 timestamp, uint40 checkeday, address indexed caller, bool isfinished)'),
        fromBlock: 0n,
        toBlock: 'latest',
    },function(error, events){ 
        //console.log(events)
        setCallerHistory(events)
    })

        getAllAccounts()

    }, [account]);

   
    const getAllAccounts = async () => {
        
        //checks if user is logged into account
        if(!isLoggedIn()) {
            console.log("Not Logged in")
            return
        }
        //variable to pass scope so that the state can be set
        let accounts = []
        let providers = []
        let subscribers = []
        
        //gets all accounts
        await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getTotalSubscribers'
        })
        .then(async function(result) {
            
            let totalSubscribers = result

            //iterates through each subscriber
            for (let i = 0; i < totalSubscribers; i++) {
                
                await readContract({
                    address: CLOCKTOWERSUB_ADDRESS,
                    abi: CLOCKTOWERSUB_ABI,
                    functionName: 'accountLookup',
                    args: [i]
                })
                .then(async function(address) {
                    await readContract({
                        address: CLOCKTOWERSUB_ADDRESS,
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
           // setAllAccounts(accounts)
        })

    }


    //checks that user has logged in 
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
    if(account != ADMIN_ACCOUNT) {
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
    }}
}

export default Admin