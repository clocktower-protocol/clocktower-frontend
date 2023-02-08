import React, {useEffect, useState} from 'react'
import {Alert, Tab, Tabs, Row, Col, Nav} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS} from "../config"; 
import { useOutletContext } from "react-router-dom";
import ProvSubDetailTable from '../ProvSubDetailTable';
import ProvidersTable from '../ProvidersTable';
import CallerHistoryTable from '../CallerHistoryTable';

const Admin = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

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
    

    //loads provider subscription list upon login
    useEffect(() => {

          //gets caller events
          clocktowersub.getPastEvents('CallerLog', {
           // filter: {id:[id], subscriber:[s]},
            fromBlock: 0,
            toBlock: 'latest'
        }, function(error, events){ 
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
    
        //calls contract 
        await clocktowersub.methods.getAllAccounts().call({from: account})
        .then(function(result) {
            accounts = result

            let providers = []
            let subscribers = []

            //separates out producers and subscribers
            accounts.forEach((element) => {
                //if account is a producer
                if(element.provSubs.length > 0) {
                    providers.push(element)
                }
                
                //if account is a subscriber
                if(element.subscriptions.length > 0) {
                    subscribers.push(element)
                }
            })

            setAllProviders(providers)
            setAllSubscribers(subscribers)
            setAllAccounts(accounts)
        })
    }

    //checks that user has logged in 
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        return (
            <div>
            <Alert align="center" variant="secondary">Admin Dashboard</Alert>
            <Tab.Container id="admin-left-tabs" defaultActiveKey="first">
                <Row>
                <Col sm={3}>
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
                            <ProvidersTable 
                                allProviders = {allProviders}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey="third">
                        Test
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
                </Row>
            </Tab.Container>
          </div>
        )
    }
}

export default Admin