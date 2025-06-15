import React, { useEffect, useState, useCallback } from 'react'
import { useOutletContext, useParams } from "react-router";
import { Alert } from 'react-bootstrap';
import { CLOCKTOWERSUB_ABI, CHAIN_LOOKUP } from "../config"; 
import ProvSubscribersTable from '../components/ProvSubscribersTable';
import { useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { config } from '../wagmiconfig'
import { Subscriber } from '../types/subscription';

const ProvSubscribers: React.FC = () => {
    const [account] = useOutletContext<[string]>();
    const { id, a, t, p } = useParams();
    const { chainId } = useAccount();

    const [subscribersArray, setSubscribersArray] = useState<Subscriber[]>([]);
    const [remainingCycles, setRemainingCycles] = useState<number[]>([]);

    const getSubscribers = useCallback(async () => {
        //checks if user is logged into account
        if (typeof account === "undefined") {
            console.log("Not Logged in");
            return;
        }    

        //gets contract address from whatever chain is selected
        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        //calculates remaining cycles until feeBalance is filled (assumes fee is same for all subs otherwise put in loop)
        const fee = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        });

        //converts fee to number 
        const numFee = Number(fee);

        //const cycles = 100n / ((fee % 10000n) / 100n)
        const cycles = 100 / ((numFee % 10000) / 100);
        
        const subscribers = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getSubscribersById',
            args: [id]
        }) as Subscriber[];

        const remainingCyclesArray: number[] = [];

        //gets remaining cycles and status
        for (const element of subscribers) {
            //gets cycles
            const balance = Number(element.feeBalance);

            if (balance === 0) {
                remainingCyclesArray.push(Number(cycles));
            } else {
                const remainingBalancePercent = (balance / Number(a));
                const remainingCycles = remainingBalancePercent * Number(cycles);
                remainingCyclesArray.push(remainingCycles);
            }
        }

        setSubscribersArray(subscribers);
        setRemainingCycles(remainingCyclesArray);
    }, [a, account, id, chainId]);

    //loads provider subscription list upon login
    useEffect(() => {
        getSubscribers();
    }, [account, getSubscribers]);

    if (p !== account) {
        return (
            <Alert variant="info" className="text-center">
                Must be Provider Account to View
            </Alert>
        );
    }

    return (
        <div>
            <div className="subTable">
                <ProvSubscribersTable 
                    subscribersArray={subscribersArray}
                    remainingCycles={remainingCycles}
                    ticker={t}
                />
            </div>
        </div>
    );
};

export default ProvSubscribers; 