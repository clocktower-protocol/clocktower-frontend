import React, { useEffect, useState, useCallback } from 'react'
import { useOutletContext, useParams } from "react-router";
import { Alert } from 'react-bootstrap';
//import { CHAIN_LOOKUP} from "../config"; 
import SubHistoryTable from '../components/SubHistoryTable';
//import { usePublicClient  } from 'wagmi'
//import { parseAbiItem } from 'viem'
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';
import { SubLog } from '../types/subscription';

const GET_LATEST_SUBLOG = gql`
    query GetSubLog($subscriptionId: Bytes!, $subscriber: Bytes!) {
        subLogs(where: {internal_id: $subscriptionId, subscriber: $subscriber}, orderBy: timestamp, orderDirection: desc) {
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

const SubHistory: React.FC = () => {
    const [account] = useOutletContext<[string]>();

    //gets public client for log lookup
    //const publicClient = usePublicClient()

    const [historyArray, setHistoryArray] = useState<SubLog[]>([]);

    const { id, t } = useParams();

    //const { chainId } = useAccount()

    const getLogs = useCallback(async () => {
        if (!id || !account) return;

        const result = await apolloClient.query({
            query: GET_LATEST_SUBLOG,
            variables: { 
                subscriptionId: id.toLowerCase(), 
                subscriber: account.toLowerCase()
            }
        });
        const logs = result.data.subLogs;
        setHistoryArray(logs);
    }, [account, id]);

    useEffect(() => {
        //gets subscriber events
        getLogs();
    }, [getLogs]);

    //checks that user has logged in 
    if (historyArray.length === 0) {
        return (
            <Alert variant="info" className={`${styles.alerts} text-center`}>
                Switch Back to Subscriber
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
                    isProvider={false}
                />
            </div>
        </div>
    );
};

export default SubHistory; 