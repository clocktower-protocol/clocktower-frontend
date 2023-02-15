import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import ProvSubscribersTable from '../ProvSubscribersTable';

const ProvSubscribers = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id, a} = useParams();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);

    //creates empty array for table
    const emptyArray = [];

    const [subscribersArray, setSubscribersArray] = useState(emptyArray)
    const [remainingCycles, setRemainingCycles] = useState(emptyArray)

    //loads provider subscription list upon login
    useEffect(() => {

        getSubscribers()
    }, [account]);

   
    const getSubscribers = async () => {

        //checks if user is logged into account
        if(!isLoggedIn()) {
            console.log("Not Logged in")
        return
        }    

        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        const fee = await clocktowersub.methods.fee().call({from: account})
        const cycles = Math.round(1 / ((fee / 10000) - 1))

        let subscribers = []

        subscribers = await clocktowersub.methods.getSubscribersById(id).call({from: account})

        let feeBalance
        let remainingCycles
        let remainingCyclesArray = []


        //gets remaining cycles and status
        for(const element of subscribers) {

            //gets cycles
            const balance = element.feeBalance

            if(balance == 0) {
                feeBalance = 0
                remainingCycles = cycles
                remainingCyclesArray.push(remainingCycles)
            } else {
                feeBalance = balance

               // const subFee = element.subscription.amount / cycles

                const remainingBalancePercent = (balance / a)

                remainingCycles = remainingBalancePercent * cycles
                remainingCyclesArray.push(remainingCycles)
            }

            /*
            //gets status
            clocktowersub.getPastEvents('SubscriberLog', {
                filter: {id:[id], subscriber:[element.subscriber]},
                fromBlock: 'latest',
            }, function(error, events){ 
              if(events.returnValues.subEvent === )
            })
            */
        }

        setSubscribersArray(subscribers)
        setRemainingCycles(remainingCyclesArray)
    }

    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        
        return (
            <div>
                <div className="subTable">
                    <ProvSubscribersTable 
                        subscribersArray = {subscribersArray}
                        remainingCycles = {remainingCycles}
                    />
                </div>
            
            </div>
        )
    }

}

export default ProvSubscribers