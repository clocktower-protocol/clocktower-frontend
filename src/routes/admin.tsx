import React, { useEffect, useState, useCallback } from 'react';
import { Alert, Tab, Tabs } from 'react-bootstrap';
import { CLOCKTOWERSUB_ABI, ADMIN_ACCOUNT, CHAIN_LOOKUP } from "../config"; 
import { useOutletContext } from "react-router";
import ProvidersTable from '../components/ProvidersTable';
import CallerHistoryTable from '../components/CallerHistoryTable';
import SubscribersTable from '../components/SubscribersTable';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { config } from '../wagmiconfig';
import { gql, useApolloClient } from '@apollo/client';

interface SubIndex {
    id: `0x${string}`; // bytes32
    dueDay: number; // uint16
    frequency: number; // Frequency enum
    status: number; // Status enum
}

interface Account {
    accountAddress: `0x${string}`; // address
    subscriptions: SubIndex[]; // SubIndex[]
    provSubs: SubIndex[]; // SubIndex[]
}

interface CallerLog {
    timestamp: string;
    checkedDay: string;
    caller: string;
    isFinished: boolean;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
}

const Admin: React.FC = () => {
    const { chainId } = useAccount();
    const [account] = useOutletContext<[string]>();
    const apolloClient = useApolloClient();

    const [allProviders, setAllProviders] = useState<Account[]>([]);
    const [allSubscribers, setAllSubscribers] = useState<Account[]>([]);
    const [callerHistory, setCallerHistory] = useState<CallerLog[]>([]);

    //graphql queries
    const ALL_PROVIDERS_QUERY = gql`
        query {
            subLogs(where: {subScriptEvent: 0}, orderBy: timestamp, orderDirection: desc) {
                provider
            }
        }
    `;

    const ALL_SUBCRIBERS_QUERY = gql`
         query {
            subLogs(where: {subScriptEvent: 6}, orderBy: timestamp, orderDirection: desc) {
                subscriber
            }
        }
    `;

    const ALL_CALLERS_QUERY = gql`
         query {
            callerLogs(orderBy: timestamp, orderDirection: desc) {
                timestamp
                checkedDay
                caller
                isFinished
                blockNumber
                blockTimestamp
                transactionHash
            }
        }
    `;

    const getAllAccounts = useCallback(async () => {
        //checks if user is logged into account
        if (typeof account === "undefined") {
            console.log("Not Logged in");
            return;
        }

        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        let providers: Account[] = [];
        let subscribers: Account[] = [];

        const result = await apolloClient.query({ query: ALL_PROVIDERS_QUERY });
        const result2 = await apolloClient.query({ query: ALL_SUBCRIBERS_QUERY });
        const providerSubLogs = result.data.subLogs;
        const subscriberSubLogs = result2.data.subLogs;

        // Deduplicate providers and subscribers using a Set
        const uniqueProviders = [...new Set(providerSubLogs.map((log: { provider: string }) => log.provider))];
        const uniqueSubscribers = [...new Set(subscriberSubLogs.map((log: { subscriber: string }) => log.subscriber))];

        //iterates through all providers and gets account info
        for (let i = 0; i < uniqueProviders.length; i++) {
            const mapAccount = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccount',
                args: [uniqueProviders[i]]
            }) as Account;

            providers.push(mapAccount);
        }

        setAllProviders(providers);

        //iterates through all subscribers and gets account info
        for (let i = 0; i < uniqueSubscribers.length; i++) {
            const mapAccount = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccount',
                args: [uniqueSubscribers[i]]
            }) as Account;

            subscribers.push(mapAccount);
        }

        setAllSubscribers(subscribers);
    }, [account, ALL_PROVIDERS_QUERY, ALL_SUBCRIBERS_QUERY, chainId, apolloClient]);

    //loads caller list upon login
    useEffect(() => {
        const fetchAllCallers = async () => {
            const result3 = await apolloClient.query({ query: ALL_CALLERS_QUERY });
            const callerLogs = result3.data.callerLogs;
            setCallerHistory(callerLogs);
            getAllAccounts();
        };

        fetchAllCallers();
    }, [account, getAllAccounts, ALL_CALLERS_QUERY, apolloClient]);

    //checks that user has logged in 
    if (account !== ADMIN_ACCOUNT) {
        return (
            <Alert className="text-center" variant="danger">Must be Admin</Alert>
        );
    }

    return (
        <div>
            <Tabs
                defaultActiveKey="providers"
                id="admin-tabs"
                className="mb-3"
            >
                <Tab eventKey="providers" title="Providers">
                    <ProvidersTable allProviders={allProviders} />
                </Tab>
                <Tab eventKey="subscribers" title="Subscribers">
                    <SubscribersTable allSubscribers={allSubscribers} />
                </Tab>
                <Tab eventKey="caller-history" title="Caller History">
                    <CallerHistoryTable callerHistory={callerHistory} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Admin; 