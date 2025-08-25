import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate } from "react-router";
import { CLOCKTOWERSUB_ABI, INFINITE_APPROVAL, ZERO_ADDRESS, CHAIN_LOOKUP, TOKEN_LOOKUP } from "../config"; 
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
    const [hasEnoughBalance, setHasEnoughBalance] = useState(false);

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
                setAlertType("danger");
                setAlert(true);
                setAlertText("This chain is not supported. Please switch to a supported chain (Base or Base Sepolia).");
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

                        try {
                const result = await readContract(config, {
                    address: contractAddress,
                    abi: CLOCKTOWERSUB_ABI,
                    functionName: 'idSubMap',
                    args: [id]
                }) as SubscriptionResult;

                // Check if subscription exists (provider address will be zero if not found)
                if (result[2] === "0x0000000000000000000000000000000000000000") {
                    setAlertType("warning");
                    setAlert(true);
                    setAlertText("This subscription doesn't exist on the current chain. Please switch to the correct chain to view this subscription");
                    setSubscription(null);
                    setFormattedDetails([]);
                    setFormattedSub([]);
                    return;
                }

                const resultSub: Subscription = {
                    id: result[0],
                    amount: result[1],
                    provider: result[2],
                    token: result[3],
                    cancelled: result[4],
                    frequency: result[5],
                    dueDay: result[6]
                };

                try {
                    const result2 = await apolloClient.query({
                        query: GET_LATEST_DETAILS_LOG,
                        variables: { subscriptionId: resultSub.id.toLowerCase(), first: 1 }
                    });

                    // Check if details logs exist and have data
                    const tempDetails = result2.data.detailsLogs && result2.data.detailsLogs.length > 0 
                        ? [result2.data.detailsLogs[0]] 
                        : [];
                    
                    setFormattedDetails(tempDetails);
                } catch (error) {
                    console.error("Error fetching details logs:", error);
                    setFormattedDetails([]);
                }
                setSubscription(resultSub);
                setToken(resultSub.token);
                const tempSub: FormattedSubscription[] = [{
                    subscription: resultSub,
                    status: 0,
                    totalSubscribers: 0
                }];
                setFormattedSub(tempSub);
                
                // Clear any previous error states when subscription is successfully loaded
                if (alert) {
                    setAlert(false);
                }
            } catch (error) {
                console.error("Error fetching subscription:", error);
                setSubscription(null);
                setFormattedDetails([]);
                setFormattedSub([]);
                
                // Show user-friendly error message for wrong chain
                setAlertType("warning");
                setAlert(true);
                setAlertText("This subscription doesn't exist on the current chain. Please switch to the correct chain to view this subscription.");
            }
        };

        const isSubscribed = async () => {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            try {
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
            } catch (error) {
                console.error("Error checking subscription status:", error);
                setIsSubscribed(false);
            }
        };

        const isProviderSame = async () => {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            try {
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
            } catch (error) {
                console.error("Error checking provider status:", error);
                setIsProvider(false);
            }
        };

        if (typeof account !== "undefined") {
            getSub();
            isSubscribed();
            isProviderSame();
        }
    }, [account, d, f, id, publicClient, setAlert, setAlertText, GET_LATEST_DETAILS_LOG, chainId, apolloClient]);

    // Check token balance when subscription or address changes
    useEffect(() => {
        if (subscription && address) {
            const checkTokenBalance = async () => {
                try {
                    const balance = await readContract(config, {
                        address: subscription.token,
                        abi: erc20Abi,
                        functionName: 'balanceOf',
                        args: [address]
                    }) as bigint;

                    // Get token info to determine decimals
                    const token = TOKEN_LOOKUP.find(t => t.address === subscription.token);
                    
                    if (token) {
                        // Convert user's balance from token decimals to 18 decimals for comparison
                        const balanceIn18Decimals = balance * BigInt(10 ** (18 - token.decimals));
                        
                        setHasEnoughBalance(balanceIn18Decimals >= subscription.amount);
                    } else {
                        // Fallback: assume 18 decimals if token not found
                        setHasEnoughBalance(balance >= subscription.amount);
                    }
                } catch (error) {
                    console.error("Error checking token balance:", error);
                    setHasEnoughBalance(false);
                }
            };

            checkTokenBalance();
        }
    }, [subscription, address]);

    // Clear alert when subscription is successfully loaded
    useEffect(() => {
        if (subscription && alert) {
            setAlert(false);
        }
    }, [subscription, alert]);

    // Retry fetching details if subscription exists but details are missing
    useEffect(() => {
        const retryFetchDetails = async () => {
            if (subscription && formattedDetails.length === 0) {
                try {
                    const result2 = await apolloClient.query({
                        query: GET_LATEST_DETAILS_LOG,
                        variables: { subscriptionId: subscription.id.toLowerCase(), first: 1 }
                    });

                    const tempDetails = result2.data.detailsLogs && result2.data.detailsLogs.length > 0 
                        ? [result2.data.detailsLogs[0]] 
                        : [];
                    
                    setFormattedDetails(tempDetails);
                } catch (error) {
                    console.error("Error retrying details fetch:", error);
                }
            }
        };

        retryFetchDetails();
    }, [subscription, formattedDetails.length, apolloClient]);

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

        // Check if user has enough token balance
        if (!hasEnoughBalance) {
            setAlertType("danger");
            setAlert(true);
            setAlertText("Insufficient token balance to subscribe");
            return;
        }

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
                    hasEnoughBalance={hasEnoughBalance}
                />
            </div>
        </div>
    );
};

export default PublicSubscription; 