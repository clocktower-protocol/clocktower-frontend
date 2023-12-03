import {React, useState, useEffect} from 'react';
import {Table} from 'react-bootstrap';
import {Link, useParams} from "react-router-dom";
import { CLOCKTOWERSUB_ADDRESS } from "../config"; 
import { usePublicClient } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'

const ProviderHistory = (props) => {

    let {a} = useParams();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //creates empty array for table
    let emptyArray = []

    const [historyArray, setHistoryArray] = useState([emptyArray])

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

        //console.log(logs)

        setHistoryArray(logs)
        
        /*
        const iface = new ethers.Interface(CLOCKTOWERSUB_ABI);
        console.log(iface.format('full'));
        */
    }




}

export default ProviderHistory