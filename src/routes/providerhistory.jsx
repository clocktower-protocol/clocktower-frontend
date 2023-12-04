import {React, useState, useEffect} from 'react';
import {Table, Alert} from 'react-bootstrap';
import {Link, useParams, useOutletContext } from "react-router-dom"
import { CLOCKTOWERSUB_ADDRESS, ADMIN_ACCOUNT } from "../config"; 
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import ProviderHistoryTable from '../ProviderHistoryTable';

const ProviderHistory = (props) => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {a} = useParams();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptyArray = []

    const [providerHistory, setProviderHistory] = useState([emptyArray])

    //loads once
    useEffect( () => {

        getLogs()

    }, []);

    const getLogs = async () => {

        
        const logs = await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event ProviderLog(bytes32 indexed id, address indexed provider, uint40 timestamp, uint256 amount, address token, uint8 indexed provevent)'),
            fromBlock: 0n,
            toBlock: 'latest',
            args: {provider: a}
        })

        console.log(logs[0].args.provevent)

        setProviderHistory(logs)
        
        /*
        const iface = new ethers.Interface(CLOCKTOWERSUB_ABI);
        console.log(iface.format('full'));
        */
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
                    {providerHistory.length > 0 ? <Alert align="center" variant="dark">{"Provider: "}&nbsp;&nbsp;&nbsp;{a}</Alert> : ""}
                </div>
                <div>
                    <ProviderHistoryTable
                        providerHistory = {providerHistory}
                    />
                </div>
            </div>
            
        )
        
        
    }
    }   

}

export default ProviderHistory