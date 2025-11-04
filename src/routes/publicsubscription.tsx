import React, { useEffect, useState, useCallback } from 'react'
import { Alert, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate } from "react-router";
import { CLOCKTOWERSUB_ABI, INFINITE_APPROVAL, ZERO_ADDRESS, CHAIN_LOOKUP, TOKEN_LOOKUP } from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useConnection } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { erc20Abi } from 'viem'
import { config } from '../wagmiconfig'
import SubscriptionCards from "../components/SubscriptionCards";
import SubscriptionWidget from "../components/SubscriptionWidget";
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { Subscription, DetailsLog, FormattedSubscription, Subscriber, SubscriptionResult, DetailsLogsQueryResult } from '../types/subscription';

const PublicSubscription: React.FC = () => {
    const { address, chainId } = useConnection();
    const publicClient = usePublicClient();
    const [account] = useOutletContext<[string]>();
    const { id, return_url } = useParams();
    const navigate = useNavigate();
    const apolloClient = useApolloClient();
    const [isInIframe, setIsInIframe] = useState(false);

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
    const [isLoading, setIsLoading] = useState(true);

    const writeContract = useWriteContract();
    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 2,
        hash: writeContract.data,
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

    // Detect if we're in an iframe
    useEffect(() => {
        setIsInIframe(window.self !== window.top);
    }, []);

    //loads provider subscription list upon receiving parameter
    useEffect(() => {
        const getSub = async () => {
             // Clean and debug the ID
            const originalId = id;
            const cleanId = id?.replace(/\s/g, '') || ''; // Remove all whitespace
            
            console.log('🔍 ID Debug Info:');
            console.log('  Original ID:', originalId);
            console.log('  Cleaned ID:', cleanId);
            console.log('  ID length:', cleanId.length);
            console.log('  ID starts with 0x:', cleanId.startsWith('0x'));
            
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
                    setIsLoading(false);
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
                    const detailsData = result2.data as DetailsLogsQueryResult;
                    const tempDetails = detailsData.detailsLogs && detailsData.detailsLogs.length > 0 
                        ? [detailsData.detailsLogs[0]] 
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
                setIsLoading(false);
                
                // Clear any previous error states when subscription is successfully loaded
                if (alert) {
                    setAlert(false);
                }
            } catch (error) {
                console.error("Error fetching subscription:", error);
                setSubscription(null);
                setFormattedDetails([]);
                setFormattedSub([]);
                setIsLoading(false);
                
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
    }, [account, id, publicClient, setAlert, setAlertText, GET_LATEST_DETAILS_LOG, chainId, apolloClient]);

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

                    const detailsData = result2.data as DetailsLogsQueryResult;
                    const tempDetails = detailsData.detailsLogs && detailsData.detailsLogs.length > 0 
                        ? [detailsData.detailsLogs[0]] 
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

        // Re-check token balance to avoid race conditions
        try {
            const balance = await readContract(config, {
                address: subscription.token,
                abi: erc20Abi,
                functionName: 'balanceOf',
                args: [address]
            }) as bigint;

            const token = TOKEN_LOOKUP.find(t => t.address === subscription.token);
            let hasEnoughBalanceNow = false;
            
            if (token) {
                const balanceIn18Decimals = balance * BigInt(10 ** (18 - token.decimals));
                hasEnoughBalanceNow = balanceIn18Decimals >= subscription.amount;
            } else {
                hasEnoughBalanceNow = balance >= subscription.amount;
            }

            if (!hasEnoughBalanceNow) {
                setAlertType("danger");
                setAlert(true);
                setAlertText("Insufficient token balance to subscribe");
                return;
            }
        } catch (error) {
            console.error("Error checking token balance:", error);
            setAlertType("danger");
            setAlert(true);
            setAlertText("Error checking token balance");
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
            writeContract.mutate({
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

            writeContract.mutate({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'subscribe',
                args: [subscription]
            });
        }
    }, [subscription, address, token, writeContract, chainId, showToast]);

    //sends to account page or return url
    const sendToAccount = useCallback(() => {
        if (isInIframe) {
            // In iframe - use postMessage to communicate with parent window
            try {
                const message = {
                    type: 'subscription_complete',
                    subscription_id: id || '',
                    user_address: address || '',
                    success: true,
                    return_url: return_url || null
                };

                // Send message to parent window
                // Note: Using '*' for origin - in production, should validate specific origins
                window.parent.postMessage(message, '*');

                // Show success message in iframe
                setAlertType("success");
                setAlert(true);
                setAlertText("Subscription successful! The parent window has been notified.");

                // Fallback: If postMessage fails or parent doesn't respond, redirect after delay
                setTimeout(() => {
                    if (return_url) {
                        try {
                            const decodedUrl = decodeURIComponent(return_url);
                            const url = new URL(decodedUrl);
                            url.searchParams.set('subscription_success', 'true');
                            url.searchParams.set('subscription_id', id || '');
                            url.searchParams.set('user_address', address || '');
                            window.location.href = url.toString();
                        } catch (error) {
                            console.error('Invalid return URL:', error);
                            navigate(`/subscriptions/subscribed`);
                        }
                    } else {
                        navigate(`/subscriptions/subscribed`);
                    }
                }, 2000); // Give parent window time to handle postMessage
            } catch (error) {
                console.error('Failed to send postMessage:', error);
                // Fallback to redirect if postMessage fails
                if (return_url) {
                    try {
                        const decodedUrl = decodeURIComponent(return_url);
                        const url = new URL(decodedUrl);
                        url.searchParams.set('subscription_success', 'true');
                        url.searchParams.set('subscription_id', id || '');
                        url.searchParams.set('user_address', address || '');
                        window.location.href = url.toString();
                    } catch (err) {
                        console.error('Invalid return URL:', err);
                        navigate(`/subscriptions/subscribed`);
                    }
                } else {
                    navigate(`/subscriptions/subscribed`);
                }
            }
        } else {
            // NOT in iframe - use existing redirect behavior (unchanged)
            if (return_url) {
                try {
                    const decodedUrl = decodeURIComponent(return_url);
                    const url = new URL(decodedUrl);
                    url.searchParams.set('subscription_success', 'true');
                    url.searchParams.set('subscription_id', id || '');
                    url.searchParams.set('user_address', address || '');
                    
                    // Redirect to external site
                    window.location.href = url.toString();
                } catch (error) {
                    console.error('Invalid return URL:', error);
                    // Fallback to default behavior
                    navigate(`/subscriptions/subscribed`);
                }
            } else {
                navigate(`/subscriptions/subscribed`)
            }
        }
    }, [navigate, return_url, id, address, isInIframe, setAlertType, setAlert, setAlertText]);

    //shows alert when waiting for transaction to finish
    useEffect(() => {
        if (subscribeWait.isLoading) {
            setToastHeader("Transaction Pending");
        }

        if (subscribeWait.isSuccess) {
            setShowToast(false);

            if (writeContract.variables?.functionName === "approve") {
                subscribe();
            } else {
                sendToAccount();
            }
        }
    }, [subscribeWait.isLoading, subscribeWait.isSuccess, sendToAccount, writeContract.variables, subscribe]);

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
            <div className={isInIframe ? styles.widget_container : ''} style={isInIframe ? {} : {justifyContent:"center", display:"flex", paddingTop:"30px"}}>
                {isInIframe ? (
                    <SubscriptionWidget
                        subscriptionArray={formattedSub}
                        detailsArray={formattedDetails}
                        isSubscribed={subscribed}
                        subscribe={subscribe}
                        hasEnoughBalance={hasEnoughBalance}
                        isLoading={isLoading}
                    />
                ) : (
                    <SubscriptionCards
                        subscriptionArray={formattedSub}
                        detailsArray={formattedDetails}
                        isProvider={isProvider}
                        isLink={true}
                        isSubscribed={subscribed}
                        subscribe={subscribe}
                        hasEnoughBalance={hasEnoughBalance}
                    />
                )}
            </div>
        </div>
    );
};

export default PublicSubscription; 