import { useParams } from "react-router";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CLOCKTOWERSUB_ABI, CHAIN_LOOKUP } from "../config"; 
import { Row, Col, Button, Stack, Modal, Toast, ToastContainer, Spinner, ButtonGroup } from 'react-bootstrap';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { readContract } from 'wagmi/actions';
import { config } from '../wagmiconfig';
import CreateSubForm from "../components/CreateSubForm";
import SubscriptionsTable from "../components/SubscriptionsTable";
import EditDetailsForm2 from "../components/EditDetailsForm";
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { useApolloClient } from '@apollo/client/react';
import { SubView, Subscription, SubscriptionEditParams, SubscriptionEditResult, CreateSubscriptionParams, DetailsLog, SubscriptionResult, DetailsLogsQueryResult } from '../types/subscription';

const Subscriptions: React.FC = () => {
    let isMounting = useRef(true);
    const { t } = useParams<{ t: string }>();
    const { address, chainId } = useAccount();
    const apolloClient = useApolloClient();

    // Modal triggers
    const [showCreateSub, setShowCreateSub] = useState(false);
    const [showSubEditForm, setShowSubEditForm] = useState(false);
    const [showLinkDisplay, setShowLinkDisplay] = useState(false);

    // Copy variables
    const [isLinkCopyDisabled, setLinkCopyDisabled] = useState(false);
    const [copyTitleLink, setCopyTitleLink] = useState("Copy");

    // Table variables
    const [provDetailsArray, setProvDetailsArray] = useState<DetailsLog[]>([]);
    const [provSubscriptionArray, setProvSubscriptionArray] = useState<SubView[]>([]);
    const [subscribedDetailsArray, setSubscribedDetailsArray] = useState<DetailsLog[]>([]);
    const [subscribedSubsArray, setSubscribedSubsArray] = useState<SubView[]>([]);

    // Passed back objects when calling wallet
    const [cancelledSub, setCancelledSub] = useState<Subscription>({} as Subscription);
    const [changedCreateSub, setChangedCreateSub] = useState<CreateSubscriptionParams>({} as CreateSubscriptionParams);
    const [unsubscribedSub, setUnsubscribedSub] = useState<Subscription>({} as Subscription);

    // Alerts
    const [showToast, setShowToast] = useState(false);
    const [toastHeader, setToastHeader] = useState("");

    // Editing subscription 
    const [editSub, setEditSub] = useState<Subscription>({} as Subscription);
    const [preEditDetails, setPreEditDetails] = useState<DetailsLog>({} as DetailsLog);
    const [editSubParams, setEditSubParams] = useState<SubscriptionEditParams>({} as SubscriptionEditParams);
    const [editResult, setEditResult] = useState<SubscriptionEditResult>({} as SubscriptionEditResult);

    // Display Link
    const [linkDisplayed, setLinkDisplayed] = useState("");

    // Page formatting 
    const [isTableView, setIsTableView] = useState(true);
    const [tab, setTab] = useState(t || "created");

    // Spinner
    const [isLoading, setIsLoading] = useState(true);

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

    // Dynamically sets the tab
    useEffect(() => {
        if (t === "created" || t === "subscribed") {
            setTab(t);
        } else {
            setTab("created"); // Default to "created" for invalid t
        }
    }, [t]);

    // WAGMI write contract hooks
    const { data: hash, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
        confirmations: 2,
    });

    // Hook for calling wallet to create sub
    useEffect(() => {
        if (Object.keys(changedCreateSub).length > 0) {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            setToastHeader("Waiting on wallet transaction...");
            setShowToast(true);
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'createSubscription',
                args: [changedCreateSub.amount, changedCreateSub.token, changedCreateSub.details, changedCreateSub.frequency, changedCreateSub.dueDay]
            });
        } else {
            isMounting.current = false;
        }
    }, [changedCreateSub, writeContract, chainId]);

    // Hook for calling wallet to cancel sub
    useEffect(() => {
        if (Object.keys(cancelledSub).length !== 0) {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            setToastHeader("Waiting on wallet transaction...");
            setShowToast(true);
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'cancelSubscription',
                args: [cancelledSub]
            });
        } else {
            isMounting.current = false;
        }
    }, [cancelledSub, writeContract, chainId]);

    // Hook for calling wallet to unsubscribe
    useEffect(() => {
        if (Object.keys(unsubscribedSub).length !== 0) {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            setToastHeader("Waiting on wallet transaction...");
            setShowToast(true);
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'unsubscribe',
                args: [unsubscribedSub]
            });
        } else {
            isMounting.current = false;
        }
    }, [unsubscribedSub, writeContract, chainId]);

    // Hook for editing subscription
    useEffect(() => {
        if (Object.keys(editResult).length !== 0) {
            const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
            if (!chainConfig?.contractAddress) {
                console.error("Contract address not found for chain ID:", chainId);
                return;
            }
            const contractAddress = chainConfig.contractAddress as `0x${string}`;

            setToastHeader("Waiting on wallet transaction...");
            setShowToast(true);
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editDetails',
                args: [editResult.details, editResult.id]
            });

            subEditDetailsHandleClose();
        } else {
            isMounting.current = false;
        }
    }, [editResult, writeContract, chainId]);

    // Modal Control
    const createSubHandleClose = () => setShowCreateSub(false);
    const createSubHandleShow = () => setShowCreateSub(true);

    const subEditDetailsHandleClose = () => setShowSubEditForm(false);
    const subEditDetailsHandleShow = () => setShowSubEditForm(true);

    const linkDisplayClose = () => {
        setShowLinkDisplay(false);
        setLinkDisplayed("");
    };
    const linkDisplayShow = () => {
        setLinkCopyDisabled(false);
        setCopyTitleLink("Copy");
        setShowLinkDisplay(true);
    };

    const createButtonClick = () => {
        createSubHandleShow();
    };

    const getProviderSubs = useCallback(async () => {
        if (typeof address === "undefined") {
            console.log("Not Logged in");
            return;
        }

        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        try {
            const accountSubscriptions = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccountSubscriptions',
                args: [false, address]
            }) as SubView[];

            const tempDetailsArray = await Promise.all(
                accountSubscriptions.map(async (sub) => {
                    const result = await apolloClient.query({
                        query: GET_LATEST_DETAILS_LOG,
                        variables: { subscriptionId: sub.subscription.id.toLowerCase(), first: 1 },
                    });
                    const data = result.data as DetailsLogsQueryResult;
                    return data.detailsLogs[0];
                })
            );

            setProvSubscriptionArray(accountSubscriptions);
            setProvDetailsArray(tempDetailsArray);
            setIsLoading(false);
        } catch (Err) {
            console.log(Err);
        }
    }, [address, chainId, GET_LATEST_DETAILS_LOG, apolloClient]);

    const getSubscriberSubs = useCallback(async () => {
        if (typeof address === "undefined") {
            console.log("Not Logged in");
            return;
        }

        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        try {
            const accountSubscriptions = await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccountSubscriptions',
                args: [true, address]
            }) as SubView[];

            const tempDetailsArray = await Promise.all(
                accountSubscriptions.map(async (sub) => {
                    const result = await apolloClient.query({
                        query: GET_LATEST_DETAILS_LOG,
                        variables: { subscriptionId: sub.subscription.id.toLowerCase(), first: 1 },
                    });
                    const data = result.data as DetailsLogsQueryResult;
                    return data.detailsLogs[0];
                })
            );

            setSubscribedSubsArray(accountSubscriptions);
            setSubscribedDetailsArray(tempDetailsArray);
        } catch (Err) {
            console.log(Err);
        }
    }, [address, chainId, GET_LATEST_DETAILS_LOG, apolloClient]);

    const getSub = useCallback(async (editSubParams: SubscriptionEditParams) => {
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
                args: [editSubParams.id]
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

            const result3 = await apolloClient.query({
                query: GET_LATEST_DETAILS_LOG,
                variables: { subscriptionId: resultSub.id.toLowerCase(), first: 1 }
            });

            const data = result3.data as DetailsLogsQueryResult;
            setPreEditDetails(data.detailsLogs[0]);
            setEditSub(resultSub);
        } catch (Err) {
            console.log(Err);
        }
    }, [GET_LATEST_DETAILS_LOG, chainId, apolloClient]);

    // Page hooks
    useEffect(() => {
        isMounting.current = true;

        if (typeof address === "undefined") {
            // linkToMain()
        } else {
            getProviderSubs();
            getSubscriberSubs();
        }
    }, [getProviderSubs, getSubscriberSubs, address]);

    useEffect(() => {
        if (!isMounting.current) {
            getProviderSubs();
            getSubscriberSubs();
        }
    }, [getProviderSubs, getSubscriberSubs]);

    useEffect(() => {
        if (isConfirming) {
            console.log("Transaction is confirming...");
            setToastHeader("Transaction Pending");
        }

        if (isConfirmed) {
            console.log("Transaction confirmed, fetching subscriptions...");
            setShowToast(false);
            createSubHandleClose();
            setUnsubscribedSub({} as Subscription);
            
            setIsLoading(true);
            Promise.all([
                getProviderSubs(),
                getSubscriberSubs()
            ]).then(() => {
                console.log("All subscriptions refreshed");
                setIsLoading(false);
            }).catch(error => {
                console.error("Error refreshing subscriptions:", error);
                setIsLoading(false);
            });
        }
    }, [getProviderSubs, getSubscriberSubs, isConfirmed, isConfirming]);

    useEffect(() => {
        if (JSON.stringify(editSubParams) !== '{}') {
            getSub(editSubParams);
        }
    }, [editSubParams, getSub]);

    useEffect(() => {
        if (Object.keys(editSub).length !== 0) {
            subEditDetailsHandleShow();
        }
    }, [editSub]);

    useEffect(() => {
        if (linkDisplayed !== "" && typeof linkDisplayed !== "undefined") {
            linkDisplayShow();
        }
    }, [linkDisplayed]);

    // Methods to check if tables are empty
    const isTableEmpty1 = (subscriptionArray: SubView[]): boolean => {
        let count = 0;
        if (subscriptionArray.length === 0) {
            return true;
        } else {
            subscriptionArray.forEach(subscription => {
                if (subscription.status !== 1) {
                    count += 1;
                }
            });
            return count === 0;
        }
    };

    const isTableEmpty2 = (subscriptionArray2: SubView[]): boolean => {
        console.log("Checking if table is empty:", subscriptionArray2);
        let count = 0;
        
        if (subscriptionArray2.length === 0) {
            console.log("Table is empty - no subscriptions");
            return true;
        } else {
            subscriptionArray2.forEach(subscription => {
                if (Number(subscription.status) === 0) {
                    count += 1;
                }
            });
            console.log("Active subscriptions count:", count);
            return count === 0;
        }
    };

    return (
        <div className={styles.top_level_subscriptions_route}>
            <ToastContainer position="top-center">
                <Toast animation={true} onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                    <Toast.Header style={{justifyContent: "space-between"}}>
                        <Spinner animation="border" variant="info" />
                        {toastHeader}
                    </Toast.Header>
                </Toast>
            </ToastContainer>
            <div>
                <div>
                    <Modal show={showLinkDisplay} size="lg" onHide={linkDisplayClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Subscription Link</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Pass the following link to your potential subscribers: 
                            <p></p> {linkDisplayed.slice(0,75)}<br></br>{linkDisplayed.slice(76,170)}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" 
                                onClick={() => {
                                    navigator.clipboard.writeText(linkDisplayed);
                                    setLinkCopyDisabled(true);
                                    setCopyTitleLink("Copied");
                                }}
                                disabled={isLinkCopyDisabled}
                            >
                                {copyTitleLink}
                            </Button>
                            <Button variant="secondary" onClick={linkDisplayClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div>
                    <Modal show={showCreateSub} size="xl" onHide={createSubHandleClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Create Subscription</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <CreateSubForm
                                setChangedCreateSub={setChangedCreateSub}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
                <div>
                    <Modal show={showSubEditForm} size="xl" onHide={subEditDetailsHandleClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Subscription</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <EditDetailsForm2
                                editSub={editSub}
                                preEditDetails={preEditDetails}
                                setEditResult={setEditResult}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
                <div>
                </div>
                <p className={styles.subs_header_route}>
                    <b>Subscriptions</b>
                </p>
                <hr className={styles.subs_topline_route}></hr>
                <Stack gap={3}>
                    <div>
                        <Row>
                            <Col align="center">
                                <Button variant="outline-info" onClick={createButtonClick}>Create Subscription</Button>
                            </Col>
                        </Row>
                    </div>
                    <div>    
                        <ButtonGroup aria-label="Table or Card" className={styles.subs_table_card_button_route}>
                            <Button variant={isTableView ? "light" : "secondary"} onClick={() => {setIsTableView(true)}}>Table</Button>
                            <Button variant={!isTableView ? "light" : "secondary"} onClick={() => {setIsTableView(false)}}>Card</Button>
                        </ButtonGroup>
                        <br></br>
                        <div style={{display:"flex", width:"100%", justifyContent:"space-between"}}>
                            <ButtonGroup style={{flexGrow: "1"}} aria-label="Tab switcher" className={styles.subs_tabs}>
                                <Button variant={tab === "created" ? "light" : "secondary"} onClick={() => {setTab("created")}}>Created</Button>
                                <Button variant={tab !== "created" ? "light" : "secondary"} onClick={() => {setTab("subscribed")}}>Subscribed To</Button>
                            </ButtonGroup>
                        </div>
                        
                        {tab === "created" ?  
                            <div>
                                {!isTableEmpty1(provSubscriptionArray) && isTableView ?
                                    <div className={styles.subs_table_route}>
                                        <SubscriptionsTable
                                            subscriptionArray={provSubscriptionArray}
                                            isAdmin={false}
                                            role={1}
                                            detailsArray={provDetailsArray}
                                            setCancelledSub={setCancelledSub}
                                            setEditSubParams={setEditSubParams}
                                            setLinkDisplayed={setLinkDisplayed}
                                        />
                                    </div>
                                : isLoading ? (<div className={styles.tablespinner}><Spinner animation="grow" variant="info" /></div>) :
                                (<div></div>)} 

                                {!isTableEmpty1(provSubscriptionArray) && !isTableView && !isLoading ?
                                    <div style={{justifyContent:"center", display:"flex"}}>
                                        <SubscriptionCards
                                            subscriptionArray={provSubscriptionArray}
                                            detailsArray={provDetailsArray}
                                            setCancelledSub={setCancelledSub}
                                            setEditSubParams={setEditSubParams}
                                            setLinkDisplayed={setLinkDisplayed}
                                            isProvider={true}
                                            isLink={false}
                                            isSubscribed={false}
                                        />
                                    </div>
                                : <div></div>}
                            </div>
                        : <div className="subHistory">
                            {!isTableEmpty2(subscribedSubsArray) && isTableView ?
                                <div className={styles.subs_table_route}>
                                    <SubscriptionsTable
                                        subscriptionArray={subscribedSubsArray}
                                        detailsArray={subscribedDetailsArray}
                                        role={2}
                                        setUnsubscribedSub={setUnsubscribedSub}
                                    />
                                </div>
                            : isLoading ? (<div className={styles.tablespinner}><Spinner animation="grow" variant="info" /></div>) :
                            (<div></div>)} 

                            {!isTableEmpty2(subscribedSubsArray) && !isTableView ?
                                <div style={{justifyContent:"center", display:"flex"}}>
                                    <SubscriptionCards
                                        subscriptionArray={subscribedSubsArray}
                                        detailsArray={subscribedDetailsArray}
                                        setUnsubscribedSub={setUnsubscribedSub}
                                        isProvider={false}
                                        isLink={false}
                                        isSubscribed={false}
                                    />
                                </div>
                            : <div></div>}
                        </div>}
                    </div>
                </Stack>
            </div>
        </div>
    );
};

export default Subscriptions; 