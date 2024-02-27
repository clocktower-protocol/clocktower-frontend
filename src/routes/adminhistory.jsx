import {React, useState, useEffect} from 'react';
import {Alert} from 'react-bootstrap';
import { useParams, useOutletContext } from "react-router-dom"
import { CLOCKTOWERSUB_ADDRESS, ADMIN_ACCOUNT } from "../config"; 
import { usePublicClient } from 'wagmi'
import { parseAbiItem } from 'viem'
import AdminHistoryTable from '../components/AdminHistoryTable';

const AdminHistory = () => {

    const [account] = useOutletContext();

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
                event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {provider: a}
            })
            setTitle("Provider: ")    
        } else {
            logs = await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event SubLog(bytes32 indexed id, address indexed provider, address indexed subscriber, uint40 timestamp, uint256 amount, address token, uint8 subscriptevent)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {subscriber: a}
            })
            setTitle("Subscriber: ")
        }

        setHistory(logs)
        
    }


    //checks that user has logged in 
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

export default AdminHistory