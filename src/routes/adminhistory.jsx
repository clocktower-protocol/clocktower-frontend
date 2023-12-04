import {React, useState, useEffect} from 'react';
import {Table, Alert} from 'react-bootstrap';
import {Link, useParams, useOutletContext } from "react-router-dom"
import { CLOCKTOWERSUB_ADDRESS, ADMIN_ACCOUNT } from "../config"; 
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import AdminHistoryTable from '../AdminHistoryTable';

const AdminHistory = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {a, isp} = useParams();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    console.log(isp)

    //creates empty array for table
    let emptyArray = []


    const [history, setHistory] = useState([emptyArray])
    const [title, setTitle] = useState([""])

    //loads once
    useEffect( () => {

        getLogs()

    }, []);

    const getLogs = async () => {

        let logs = []

        if(isp === "true"){
            logs = await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event ProviderLog(bytes32 indexed id, address indexed provider, uint40 timestamp, uint256 amount, address token, uint8 indexed provevent)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {provider: a}
            })
            setTitle("Provider: ")    
        } else {
            logs = await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event SubscriberLog(bytes32 indexed id, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 indexed subevent)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {subscriber: a}
            })
            setTitle("Subscriber: ")
        }

        //console.log(logs[0].args.provevent)

        setHistory(logs)
        
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

}

export default AdminHistory