import React, { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { useParams, useOutletContext } from "react-router";
import { ADMIN_ACCOUNT } from "../config"; 
import AdminHistoryTable from '../components/AdminHistoryTable';
import { gql, useApolloClient } from '@apollo/client';
import { SubLog } from '../types/subscription';

const AdminHistory: React.FC = () => {
    const [account] = useOutletContext<[string]>();
    const { a, isp } = useParams();
    const apolloClient = useApolloClient();

    const [history, setHistory] = useState<SubLog[]>([]);
    const [title, setTitle] = useState("");

    //graphql queries
    const PROVIDER_HISTORY_QUERY = gql`
        query ProviderHistoryLog($providerAddress: Bytes!) {
            subLogs(where: {provider: $providerAddress}, orderBy: timestamp, orderDirection: desc) {
                id
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

    const SUBSCRIBER_HISTORY_QUERY = gql`
        query SubscriberHistoryLog($subscriberAddress: Bytes!) {
            subLogs(where: {subscriber: $subscriberAddress}, orderBy: timestamp, orderDirection: desc) {
                id
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

    const getLogs = useCallback(async () => {
        let logs: SubLog[] = [];

        if (isp === "true") {
            const result = await apolloClient.query({
                query: PROVIDER_HISTORY_QUERY,
                variables: { providerAddress: a }
            });

            logs = result.data.subLogs;
            setTitle("Provider: ");
        } else {
            const result2 = await apolloClient.query({
                query: SUBSCRIBER_HISTORY_QUERY,
                variables: { subscriberAddress: a }
            });

            logs = result2.data.subLogs;
            setTitle("Subscriber: ");
        }

        setHistory(logs);
    }, [a, isp, PROVIDER_HISTORY_QUERY, SUBSCRIBER_HISTORY_QUERY]);

    //loads once
    useEffect(() => {
        getLogs();
    }, [getLogs]);

    //checks that user has logged in 
    if (account !== ADMIN_ACCOUNT) {
        return (
            <Alert className="text-center" variant="danger">Must be Admin</Alert>
        );
    }
    
    return (
        <div>
            <div>
                {history.length > 0 ? <Alert className="text-center" variant="dark">{title}&nbsp;&nbsp;&nbsp;{a}</Alert> : null}
            </div>
            
            <div>
                <AdminHistoryTable
                    providerHistory={history}
                    isp={isp}
                />
            </div>
        </div>
    );
};

export default AdminHistory; 