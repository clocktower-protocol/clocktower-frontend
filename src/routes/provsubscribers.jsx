import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import {CLOCKTOWERSUB_ABI, CHAIN_LOOKUP} from "../config"; 
import ProvSubscribersTable from '../components/ProvSubscribersTable';
import { useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'

const ProvSubscribers = () => {

    const [account] = useOutletContext();

    let {id, a, t, p} = useParams();

    const { chainId} = useAccount()

    //creates empty array for table
    const emptyArray = [];

    const [subscribersArray, setSubscribersArray] = useState(emptyArray)
    const [remainingCycles, setRemainingCycles] = useState(emptyArray)

    const getSubscribers = useCallback(async () => {

        //checks if user is logged into account
        if(typeof account === "undefined") {
            console.log("Not Logged in")
        return
        }    

        //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        let fee =  await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        })

        //converts fee to number 
        let numFee = Number(fee)

        //const cycles = 100n / ((fee % 10000n) / 100n)
        const cycles = 100 / ((numFee % 10000) / 100)
        
        let subscribers = []

        subscribers = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getSubscribersById',
            args: [id]
        })

        //let feeBalance
        let remainingCycles
        let remainingCyclesArray = []


        //gets remaining cycles and status
        for(const element of subscribers) {

            //gets cycles
            let balance = element.feeBalance
            balance = Number(balance)

            if(balance === 0) {
                remainingCycles = Number(cycles)
                remainingCyclesArray.push(remainingCycles)
            } else {
        
                const remainingBalancePercent = (balance / a)

                remainingCycles = remainingBalancePercent * String(cycles)
            
                remainingCyclesArray.push(remainingCycles)
            }
        }

        setSubscribersArray(subscribers)
        setRemainingCycles(remainingCyclesArray)
    },[a, account, id])


    //loads provider subscription list upon login
    useEffect(() => {

        getSubscribers()
    }, [account, getSubscribers]);

    
        if(p !== account) {
            return(
                <Alert align="center" variant="info">Must be Provider Account to View</Alert>
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