import React, { useEffect, useState, useCallback } from 'react'
import { useOutletContext, useParams } from "react-router";
import { Alert } from 'react-bootstrap';
//import { CHAIN_LOOKUP} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
//import { usePublicClient } from 'wagmi'
//import { parseAbiItem } from 'viem'
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { SubLog } from '../types/subscription';

const GET_SUBLOGS = gql`
    query GetSubLog($subscriptionId: Bytes!) {
        subLogs(where: {internal_id: $subscriptionId}, orderBy: timestamp, orderDirection: desc) {
            internal_id
            provider
            subscriber
            timestamp
            amount
            token
            subScriptEvent
            blockNumber
            blockTimestamp
            transactionHash
        }
    }
`;

const ProvSubHistory: React.FC = () => {
    const [account] = useOutletContext<[string]>();
    const lowerAccount = account.toLowerCase();
    const [historyArray, setHistoryArray] = useState<SubLog[]>([]);
    const { id, t } = useParams();
    const apolloClient = useApolloClient();

    const getLogs = useCallback(async () => {
        if (!id) return;

        const result = await apolloClient.query({
            query: GET_SUBLOGS,
            variables: { subscriptionId: id.toLowerCase() }
        });
        const logs = result.data.subLogs;
        setHistoryArray(logs);
    }, [id, apolloClient]);

    //loads once
    useEffect(() => {
        //gets subscriber events
        getLogs();
    }, [getLogs]);

    if (historyArray.length > 0 && typeof historyArray[0] !== "undefined") {
        //checks that user has logged in  
        if (historyArray[0].provider !== lowerAccount) {
            return (
                <Alert variant="info" className={`${styles.alerts} text-center`}>
                    Switch Back to Provider Account
                </Alert>
            );
        }

        return (
            <div>
                <div>
                    {historyArray.length > 0 ? (
                        <Alert variant="dark" className={`${styles.alerts} text-center`}>
                            Subscription History
                        </Alert>
                    ) : (
                        <Alert variant="info" className={`${styles.alerts} text-center`}>
                            No Subscribers Yet
                        </Alert>
                    )}
                </div>
                <div className="subTable">
                    <SubHistoryTable 
                        historyArray={historyArray}
                        ticker={t}
                        isProvider={true}
                    />
                </div>
            </div>
        );
    }

    return null;
};

export default ProvSubHistory; 