import React, {useEffect, useState} from 'react'
import {Alert, Tab, Tabs, Row, Col, Nav, Accordion} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, ADMIN_ACCOUNT} from "../config"; 
import { useOutletContext } from "react-router-dom";
import SubHistoryTable from '../SubHistoryTable';
import ProvidersTable from '../ProvidersTable';
import CallerHistoryTable from '../CallerHistoryTable';
import ProviderHistoryTable from '../ProviderHistoryTable';
import SubscribersTable from '../SubscribersTable';
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'

const Admin = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    //creates empty array for table
    let emptyArray = [];

    //const [providerArray, setProviderArray] = useState(emptyArray)
    const [allAccounts, setAllAccounts] = useState(emptyArray)
    const [allProviders, setAllProviders] = useState(emptyArray)
    const [allSubscribers, setAllSubscribers] = useState(emptyArray)
    const [callerHistory, setCallerHistory] = useState(emptyArray)
    const [providersHistory, setProvidersHistory] = useState(emptyArray)
    const [subscribersHistory, setSubscribersHistory] = useState(emptyArray)
    

    //loads provider subscription list upon login
    useEffect(() => {

        /*
        //gets caller events
        clocktowersub.getPastEvents('CallerLog', {
           // filter: {id:[id], subscriber:[s]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            setCallerHistory(events)
        })

        //gets provider events
        clocktowersub.getPastEvents('ProviderLog', {
            // filter: {id:[id], subscriber:[s]},
             fromBlock: 0,
             toBlock: 'latest'
         }, function(error, events){ 
             //console.log(events)
             setProvidersHistory(events)
         })

        //gets provider events
        clocktowersub.getPastEvents('SubscriberLog', {
            // filter: {id:[id], subscriber:[s]},
             fromBlock: 0,
             toBlock: 'latest'
        }, function(error, events){ 
             //console.log(events)
             setSubscribersHistory(events)
        })
        */
       //gets caller events
       clocktowersub.getPastEvents('CallerLog', {
        // filter: {id:[id], subscriber:[s]},
         fromBlock: 0,
         toBlock: 'latest'
     }, function(error, events){ 
         //console.log(events)
         setCallerHistory(events)
     })

     //gets provider events
     clocktowersub.getPastEvents('ProviderLog', {
         // filter: {id:[id], subscriber:[s]},
          fromBlock: 0,
          toBlock: 'latest'
      }, function(error, events){ 
          //console.log(events)
          setProvidersHistory(events)
      })

     //gets provider events
     clocktowersub.getPastEvents('SubscriberLog', {
         // filter: {id:[id], subscriber:[s]},
          fromBlock: 0,
          toBlock: 'latest'
     }, function(error, events){ 
          //console.log(events)
          setSubscribersHistory(events)
     })


        getAllAccounts()

    }, [account]);

    /*
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
        await clocktowersub.methods.getTotalSubscribers().call({from: account})
        .then(async function(result) {
            
            let totalSubscribers = result

            //iterates through each subscriber
            for (let i = 0; i < totalSubscribers; i++) {
                
                await clocktowersub.methods.accountLookup(i).call({from: account})
                .then( async function(address) {
                    await clocktowersub.methods.getAccount(address).call({from: account})
                    .then(function(mapAccount) {
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
            setAllAccounts(accounts)
        })

    }
    */
    const getAllEvents = async () => {
        //gets caller events
        await clocktowersub.getPastEvents('CallerLog', {
            // filter: {id:[id], subscriber:[s]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            setCallerHistory(events)
        })

        //gets provider events
        await clocktowersub.getPastEvents('ProviderLog', {
            // filter: {id:[id], subscriber:[s]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
            //console.log(events)
            setProvidersHistory(events)
        })

        //gets provider events
        await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event SubscriberLog(bytes32 indexed id, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 indexed subevent)'),
            fromBlock: 0n,
            toBlock: 'latest',
        })
        .then(function(error, events){ 
            //console.log(events)
            setSubscribersHistory(events)
        })
    }
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
            setAllAccounts(accounts)
        })

    }

    /*
    //get fee balance
    const getFeeBalance = async (id, account, subscribers) => {
         //calls contract 
         await clocktowersub.methods.feeBalance(id, account).call({from: account})
         .then(function(result) {
            //subscribers
         })
    }
    */

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
            {/*
            <div>
            <Alert align="center" variant="secondary">Admin Dashboard</Alert>
            <Tab.Container id="admin-left-tabs" defaultActiveKey="first">
                <Row>
                <Col sm={2}>
                    <Nav variant="pills" className="flex-column">
                        <Nav.Item>
                        <Nav.Link eventKey="first">Caller</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                        <Nav.Link eventKey="second">Providers</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                        <Nav.Link eventKey="third">Subscribers</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col sm={9}>
                    <Tab.Content>
                        <Tab.Pane eventKey="first">
                            <CallerHistoryTable
                                callerHistory = {callerHistory}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="second">
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Provider List</Accordion.Header>
                                <Accordion.Body>
                                    <ProvidersTable 
                                    allProviders = {allProviders}
                                     />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Provider History</Accordion.Header>
                                <Accordion.Body>
                                    <ProviderHistoryTable
                                    providerHistory = {providersHistory}
                                    />
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        </Tab.Pane>
                        <Tab.Pane eventKey="third">
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Subscriber List</Accordion.Header>
                                <Accordion.Body>
                                    <SubscribersTable 
                                    allSubscribers = {allSubscribers}
                                     />
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Subscriber History</Accordion.Header>
                                <Accordion.Body>
                                   <SubHistoryTable
                                    historyArray = {subscribersHistory}
                                   />
                                </Accordion.Body>
                            </Accordion.Item>
                            </Accordion>
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
                </Row>
            </Tab.Container>
          </div>
        */}
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
                    
                    { /*
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Provider History</Accordion.Header>
                        <Accordion.Body>
                            <ProviderHistoryTable
                                providerHistory = {providersHistory}
                            />
                        </Accordion.Body>
                        </Accordion.Item>
                    */}
                  
            </Tab>
            <Tab eventKey="longer-tab" title="Subscribers">
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Subscriber List</Accordion.Header>
                        <Accordion.Body>
                            <SubscribersTable 
                                allSubscribers = {allSubscribers}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Subscriber History</Accordion.Header>
                        <Accordion.Body>
                            <SubHistoryTable
                                historyArray = {subscribersHistory}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Tab>
 
        </Tabs>
        </div>
        </div>
        )
    }}
}

export default Admin