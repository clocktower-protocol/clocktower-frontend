import React, { useEffect, useState, useCallback } from 'react'
import { useOutletContext, useParams } from "react-router";
import { Alert } from 'react-bootstrap';
import { CLOCKTOWERSUB_ABI, CHAIN_LOOKUP } from "../config"; 
import SubscriptionsTable from '../components/SubscriptionsTable';
import { useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { config } from '../wagmiconfig'
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';
import { DetailsLog, SubView } from '../types/subscription';

interface FeeObject {
    feeBalance: number;
    remainingCycles: number;
}

const AdminSubscriptions: React.FC = () => {
    const [account] = useOutletContext<[string]>();
    const { t, s } = useParams();
    const { chainId } = useAccount();

    const [subscriptionArray, setSubscriptionArray] = useState<SubView[]>([]);
    const [detailsArray, setDetailsArray] = useState<DetailsLog[]>([]);
    const [titleMessage, setTitleMessage] = useState("Subscribed To:");
    const [feeObjects, setFeeObjects] = useState<FeeObject[]>([]);
    const [isSubscriber, setIsSubscriber] = useState(true);

    // Query for DetailsLog events
    const GET_LATEST_DETAILS_PROVIDER_LOG = gql`
        query GetLatestDetailsLog($userAddress: Bytes!, $first: Int!) {
            detailsLogs(where: {provider: $userAddress}, first: $first, orderBy: timestamp, orderDirection: desc) {
                internal_id
                provider
                timestamp
                url
                description
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `;

    const GET_LATEST_DETAILS_SUBSCRIBER_LOG = gql`
        query GetLatestDetailsLog($userAddress: Bytes!, $first: Int!) {
            detailsLogs(where: {subscriber: $userAddress}, first: $first, orderBy: timestamp, orderDirection: desc) {
                internal_id
                provider
                timestamp
                url
                description
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `;

    const getSubsByAccount = useCallback(async (t: string | undefined, s: string | undefined) => {
        //checks if user is logged into account
        if (typeof account === "undefined" || !s) {
            console.log("Not Logged in");
            return;
        }
            
        //variable to pass scope so that the state can be set
        let subscriptions: SubView[] = [];
        let isSubscriber = true;
        let titleMessage = "Subscribed By:";

        if (t === "provider") {
            isSubscriber = false;
            titleMessage = "Created By:";
        }
    
        let feeObjects: FeeObject[] = [];
        let feeBalance: number;
        let remainingCycles: number;

        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        let fee = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'callerFee',
        }) as bigint;

        //converts fee to number 
        let numFee = Number(fee);

        //const cycles = 100n / ((fee % 10000n) / 100n)
        const cycles = 100 / ((numFee % 10000) / 100);
        
        //calls contract 
        subscriptions = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'getAccountSubscriptions',
            args: [isSubscriber, s]
        }) as SubView[];

        //gets fee balance and remaining cycles
        for (let i = 0; i < subscriptions.length; i++) {
            let balance = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'feeBalance',
                args: [subscriptions[i].subscription.id, s]
            }) as bigint;

            const subIndex = i;
            const numBalance = Number(balance);

            if (numBalance === 0) {
                feeBalance = 0;
                remainingCycles = Number(cycles);
            } else {
                feeBalance = numBalance;
                const remainingBalancePercent = (numBalance / Number(subscriptions[i].subscription.amount));
                remainingCycles = remainingBalancePercent * Number(cycles);
            }
            
            let feeObject: FeeObject = { feeBalance, remainingCycles };
            feeObjects.push(feeObject);

            if (!isSubscriber) {
                const result = await apolloClient.query({
                    query: GET_LATEST_DETAILS_PROVIDER_LOG,
                    variables: { userAddress: subscriptions[i].subscription.provider, first: 1 }
                });
                detailsArray[subIndex] = result.data.detailsLogs[0];
            } else {
                const result = await apolloClient.query({
                    query: GET_LATEST_DETAILS_SUBSCRIBER_LOG,
                    variables: { userAddress: subscriptions[i].subscription.subscriber, first: 1 }
                });
                detailsArray[subIndex] = result.data.detailsLogs[0];
            }
        }
       
        setFeeObjects(feeObjects);
        setTitleMessage(titleMessage);
        setSubscriptionArray(subscriptions);
        setDetailsArray(detailsArray);
    }, [account, detailsArray, GET_LATEST_DETAILS_PROVIDER_LOG, GET_LATEST_DETAILS_SUBSCRIBER_LOG, chainId]);

    //loads provider subscription list upon login
    useEffect(() => {
        if (t === "provider") {
            setIsSubscriber(false);
        }

        getSubsByAccount(t, s);
    }, [account, t, s, getSubsByAccount]);

    return (
        <div>
            <div>
                {subscriptionArray.length > 0 ? (
                    <Alert variant="dark" className="text-center">
                        {titleMessage}&nbsp;&nbsp;&nbsp;{s}
                    </Alert>
                ) : null}
            </div>
            <div className="subTable">
                <SubscriptionsTable
                    subscriptionArray={subscriptionArray}
                    detailsArray={detailsArray}
                    isAdmin={true}
                    role={0}
                    feeObjects={feeObjects}
                    bySubscriber={isSubscriber}
                />
            </div>
        </div>
    );
};

export default AdminSubscriptions; 