import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate } from "react-router";
import { CLOCKTOWERSUB_ABI, INFINITE_APPROVAL, ZERO_ADDRESS, CHAIN_LOOKUP } from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { erc20Abi } from 'viem'
import { config } from '../wagmiconfig'
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';
import { gql, useApolloClient } from '@apollo/client';
import { Subscription, DetailsLog, FormattedSubscription, Subscriber, SubscriptionResult } from '../types/subscription';

const PublicSubscription: React.FC = () => {
    const { address, chainId } = useAccount();
    const publicClient = usePublicClient();
    const [account] = useOutletContext<[string]>();
    const { id, f, d } = useParams();
    const navigate = useNavigate();
    const apolloClient = useApolloClient();

    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [token, setToken] = useState<`0x${string}`>(ZERO_ADDRESS);
    const [alertType, setAlertType] = useState<"danger" | "warning" | "success" | "info">("danger");
    const [subscribed, setIsSubscribed] = useState(false);
    const [isProvider, setIsProvider] = useState(false);
    const [alertText, setAlertText] = useState("");
    const [alert, setAlert] = useState(false);
    const [formattedSub, setFormattedSub] = useState<FormattedSubscription[]>([]);
    const [formattedDetails, setFormattedDetails] = useState<DetailsLog[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [toastHeader, setToastHeader] = useState("");

    const { data, variables, writeContract } = useWriteContract();
    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 2,
        hash: data,
    });

    // Query for DetailsLog events
    const GET_LATEST_DETAILS_LOG = gql`
        query GetLatestDetailsLog($subscriptionId: Bytes!, $first: Int!) {
            detailsLogs(where: {internal_id: $subscriptionId}, first: $first, orderBy: timestamp, orderDirection: desc) {
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

    //loads provider subscription list upon receiving parameter
    useEffect(() => {
        const getSub = async () => {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            const result = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'idSubMap',
                args: [id]
            }) as SubscriptionResult;

            const resultSub: Subscription = {
                id: result[0],
                amount: result[1],
                provider: result[2],
                token: result[3],
                cancelled: result[4],
                frequency: result[5],
                dueDay: result[6]
            };

            const result2 = await apolloClient.query({
                query: GET_LATEST_DETAILS_LOG,
                variables: { subscriptionId: resultSub.id.toLowerCase(), first: 1 }
            });

            const tempDetails = [result2.data.detailsLogs[0]];
            setFormattedDetails(tempDetails);
            setSubscription(resultSub);
            setToken(resultSub.token);
            const tempSub: FormattedSubscription[] = [{
                subscription: resultSub,
                status: 0,
                totalSubscribers: 0
            }];
            setFormattedSub(tempSub);
        };

        const isSubscribed = async () => {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            const result = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubscribersById',
                args: [id]
            }) as Subscriber[];

            let status = false;
            
            result.forEach((element) => {
                if (element.subscriber === account) {
                    setIsSubscribed(true);
                    status = true;
                    return;
                }
            });

            if (status) {
                setAlertType("warning");
                setAlert(true);
                setAlertText("Already Subscribed");
            }
            setIsSubscribed(status);
        };

        const isProviderSame = async () => {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            const result = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'idSubMap',
                args: [id]
            }) as SubscriptionResult;

            const resultSub: Subscription = {
                id: result[0],
                amount: result[1],
                provider: result[2],
                token: result[3],
                cancelled: result[4],
                frequency: result[5],
                dueDay: result[6]
            };

            setIsProvider(resultSub.provider === account);
        };

        if (typeof account !== "undefined") {
            getSub();
            isSubscribed();
            isProviderSame();
        }
    }, [account, d, f, id, publicClient, setAlert, setAlertText, GET_LATEST_DETAILS_LOG, chainId, apolloClient]);

    //Creates alert
    const alertMaker = () => {
        if (alert) {
            return (
                <div className="alertDiv">
                    <Alert variant={alertType} className="text-center" onClose={() => setAlert(false)} dismissible>
                        {alertText}
                    </Alert>
                </div>
            );
        }
    };

    //subscribes to contract
    const subscribe = useCallback(async () => {
        if (!subscription || !address) return;

        setToastHeader("Waiting on wallet transaction...");
        setShowToast(true);

        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        const allowanceBalance = await readContract(config, {
            address: token,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, contractAddress]
        }) as bigint;

        if (allowanceBalance < 100000000000000000000000n) {
            writeContract({
                address: token,
                abi: erc20Abi,
                functionName: 'approve',
                args: [contractAddress, INFINITE_APPROVAL]
            });
        } else {
            if (!showToast) {
                setToastHeader("Waiting on wallet transaction...");
                setShowToast(true);
            }

            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'subscribe',
                args: [subscription]
            });
        }
    }, [subscription, address, token, writeContract, chainId, showToast]);

    const sendToAccount = useCallback(() => 
        navigate(`/subscriptions/subscribed`)
    , [navigate]);

    //shows alert when waiting for transaction to finish
    useEffect(() => {
        if (subscribeWait.isLoading) {
            setToastHeader("Transaction Pending");
        }

        if (subscribeWait.isSuccess) {
            setShowToast(false);

            if (variables?.functionName === "approve") {
                subscribe();
            } else {
                sendToAccount();
            }
        }
    }, [subscribeWait.isLoading, subscribeWait.isSuccess, sendToAccount, variables, subscribe]);

    return (
        <div className={styles.top_level_public}> 
            {alertMaker()}
            <ToastContainer position="top-center">
                <Toast animation={true} onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                    <Toast.Header style={{justifyContent: "space-between"}}>
                        <Spinner animation="border" variant="info" />
                        {toastHeader}
                    </Toast.Header>
                </Toast>
            </ToastContainer>
            <div style={{justifyContent:"center", display:"flex", paddingTop:"30px"}}>
                <SubscriptionCards
                    subscriptionArray={formattedSub}
                    detailsArray={formattedDetails}
                    isProvider={isProvider}
                    isLink={true}
                    isSubscribed={subscribed}
                    subscribe={subscribe}
                />
            </div>
        </div>
    );
};

export default PublicSubscription; 