import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams} from "react-router-dom";
import {Alert} from 'react-bootstrap';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import ProvSubscribersTable from '../components/ProvSubscribersTable';
import { readContract } from 'wagmi/actions'
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'

const ProvSubscribers = () => {

    const [account] = useOutletContext();

    let {id, a, t, p} = useParams();

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

        await fetchToken()
        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        let fee =  await readContract(config, {
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        })
       
        const cycles = 100n / ((fee % 10000n) / 100n)
        
        let subscribers = []

        subscribers = await readContract(config, {
            address: CLOCKTOWERSUB_ADDRESS,
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