import React, {useEffect, useState} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
//import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import ProvSubscribersTable from '../ProvSubscribersTable';
import { readContract } from 'wagmi/actions'
/* global BigInt */
const ProvSubscribers = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id, a, t} = useParams();

    /*
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    */

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
        //const fee = await clocktowersub.methods.callerFee().call({from: account})
        let fee =  await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        })
        //converts from BigInt
        //console.log(fee%10000n)
        //fee = Number(fee)
        //const cycles = Math.round(1n / ((fee / 10000n) - 1n))
        const cycles = 100n / ((fee % 10000n) / 100n)
        console.log(cycles)

        let subscribers = []

        //subscribers = await clocktowersub.methods.getSubscribersById(id).call({from: account})
        subscribers = await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getSubscribersById',
            args: [id]
        })

        let feeBalance
        let remainingCycles
        let remainingCyclesArray = []


        //gets remaining cycles and status
        for(const element of subscribers) {

            //gets cycles
            let balance = element.feeBalance
            balance = Number(balance)


            if(balance == 0) {
                feeBalance = 0
                remainingCycles = Number(cycles)
                remainingCyclesArray.push(remainingCycles)
            } else {
                feeBalance = balance
                
                //balance = Number(balance)
                //const numberBalance = Number(balance)

                // const subFee = element.subscription.amount / cycles
                //a = BigInt(a)

                const remainingBalancePercent = (balance / a)
                console.log(remainingBalancePercent)

                remainingCycles = remainingBalancePercent * String(cycles)
                console.log(remainingCycles)
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
                        ticker = {t}
                    />
                </div>
            
            </div>
        )
    }

}

export default ProvSubscribers