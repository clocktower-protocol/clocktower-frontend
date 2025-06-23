import { useOutletContext, useParams } from "react-router";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CLOCKTOWERSUB_ABI, CHAIN_LOOKUP } from "../config"; 
import { Row, Col, Card, ListGroup, Button, Stack, Modal, Toast, ToastContainer, Spinner } from 'react-bootstrap';
import Avatar from "boring-avatars";
import { useSignMessage, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { recoverMessageAddress } from 'viem';
import EditAccountForm from "../components/EditAccountForm";
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';
import styles from '../css/clocktower.module.css';
import { AccountDetails, ProvDetailsLog } from '../types/account';

const Account: React.FC = () => {
    let isMounting = useRef(true);
    const { a } = useParams<{ a: string }>();
    const { address, chainId } = useAccount();
    const [account] = useOutletContext<[string]>();

    // Modal triggers
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showLinkDisplay, setShowLinkDisplay] = useState(false);

    // Copy variables
    const [isDisabled, setIsDisabled] = useState(false);
    const [copyTitle, setCopyTitle] = useState("Copy");
    const [isLinkCopyDisabled, setLinkCopyDisabled] = useState(false);
    const [copyTitleLink, setCopyTitleLink] = useState("Copy");

    // Account variables
    const [isDomainVerified, setIsDomainVerified] = useState(false);
    const [changedAccountDetails, setChangedAccountDetails] = useState<AccountDetails>({});
    const [accountDetails, setAccountDetails] = useState<ProvDetailsLog | null>(null);

    // Alerts
    const [showToast, setShowToast] = useState(false);
    const [toastHeader, setToastHeader] = useState("");

    // Display Link
    const [linkDisplayed, setLinkDisplayed] = useState("");
    
    const msg = 'clocktower_is_awesome';

    const { data: hash, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        confirmations: 2,
        hash
    });

    // Hook for signing messages
    const { data: signMessageData, signMessage, variables } = useSignMessage();

    // Gets signed message
    useEffect(() => {
        ;(async () => {
            if (signMessageData && variables?.message) {
                const recoveredAddress = await recoverMessageAddress({
                    message: variables.message,
                    signature: signMessageData,
                });
                if (recoveredAddress === address) {
                    setCopyTitle("Copy");
                    setIsDisabled(false);
                    verifyHandleShow();
                }
            }
        })();
    }, [signMessageData, address, variables?.message]);

    // Hook for account form changes
    useEffect(() => {
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId)?.contractAddress;
        if (!contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }

        if (Object.keys(changedAccountDetails).length > 0) {
            setToastHeader("Waiting on wallet transaction...");
            setShowToast(true);
            writeContract({
                address: contractAddress as `0x${string}`,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editProvDetails',
                args: [changedAccountDetails]
            });
        } else {
            isMounting.current = false;
        }
    }, [changedAccountDetails, writeContract, chainId]);

    const verifyDomain = async (domain: string, provAddress: string) => {
        const url = `https://cloudflare-dns.com/dns-query?name=ct.${domain}&type=TXT`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/dns-json'
                }
            });
                
            const json = await response.json();
            if (json.Answer && json.Answer[0]?.data) {
                const dnsRecoveredAddress = await recoverMessageAddress({
                    message: msg,
                    signature: json.Answer[0].data,
                });
                if (dnsRecoveredAddress === provAddress) {
                    setIsDomainVerified(true);
                }
            }
        } catch (Err) {
            console.log(Err);
        }
    };

    // Turns on and off edit warning modal
    const editHandleClose = () => setShowEditWarn(false);
    const editHandleShow = () => setShowEditWarn(true);

    // Turns on and off verify domain modal 
    const verifyHandleClose = () => setVerifyShow(false);
    const verifyHandleShow = () => setVerifyShow(true);

    // Turns on and off edit account form modal
    const editFormHandleClose = useCallback(() => setShowEditForm(false), []);
    const editFormHandleShow = () => {
        setShowEditWarn(false);
        setShowEditForm(true);
    };

    // Turns on and off link display modal
    const linkDisplayClose = () => {
        setShowLinkDisplay(false);
        setLinkDisplayed("");
    };
    const linkDisplayShow = () => {
        setLinkCopyDisabled(false);
        setCopyTitleLink("Copy");
        setShowLinkDisplay(true);
    };

    const editButtonClick = () => {
        editHandleShow();
    };

    // Gets account info
    const getAccount = useCallback(async () => {
        const GET_LATEST_PROV_DETAILS = gql`
            query GetLatestProvDetails($provider: Bytes!, $first: Int!) {
                provDetailsLogs(where: { provider: $provider }, first: $first, orderBy: timestamp, orderDirection: desc) {
                    provider
                    timestamp
                    description
                    company
                    url
                    domain
                    email
                    misc
                }
            }
        `;

        if (typeof address === "undefined" || !a) {
            console.log("Not logged in or no address provided");
            return;
        }

        try {
            const result = await apolloClient.query({
                query: GET_LATEST_PROV_DETAILS,
                variables: { provider: a.toLowerCase(), first: 1 },
                fetchPolicy: 'network-only'
            });
            
            const accountDetails = result.data.provDetailsLogs[0];
            let domainString = "";
            
            if (accountDetails?.domain) {
                domainString = accountDetails.domain;
            }

            verifyDomain(domainString, a);
            setAccountDetails(accountDetails);
        } catch (Err) {
            console.log(Err);
        }
    }, [a, address]);

    // Sets mounting bool to not mounting after initial load
    useEffect(() => {
        isMounting.current = true;

        if (typeof address === "undefined") {
            // linkToMain()
        } else {
            getAccount();
        }
    }, [getAccount, address]);

    // Changes data when passed account is switched
    useEffect(() => {
        if (!isMounting.current) {
            getAccount();
            setIsDomainVerified(false);
        }
    }, [a, getAccount]);

    // Shows alert when waiting for transaction to finish
    useEffect(() => {
        if (isConfirming) {
            setToastHeader("Transaction Pending");
            setShowToast(true);
        }

        if (isConfirmed) {
            editFormHandleClose();
            setToastHeader("Fetching Data");
            
            const delayAndRefresh = async () => {
                // Wait 2 seconds for subgraph indexing
                await new Promise(resolve => setTimeout(resolve, 2000));
                await getAccount();
            };
            delayAndRefresh();
            setShowToast(false);
        }
    }, [isConfirming, isConfirmed, getAccount, editFormHandleClose]);

    // Called when link to be displayed in modal 
    useEffect(() => {
        if (linkDisplayed !== "" && typeof linkDisplayed !== "undefined") {
            linkDisplayShow();
        }
    }, [linkDisplayed]);

    return (
        <div className={styles.top_level_account}>
            <ToastContainer position="top-center">
                <Toast animation={true} onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                    <Toast.Header style={{justifyContent: "space-between"}}>
                        <Spinner animation="border" variant="info" />
                        {toastHeader}
                    </Toast.Header>
                </Toast>
            </ToastContainer>
            <div className="clockBody">
                <div>
                    <Modal show={showEditWarn} onHide={editHandleClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Warning</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className={styles.tight_text}>
                                All information saved to the account will be stored publically on the blockchain. 
                            </p>
                            <p className={styles.tight_text}>
                                This will help subscribers verify your information but your account will no longer be anonymous.
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={editHandleClose}>Close</Button>
                            <Button variant="primary" onClick={editFormHandleShow}>Continue</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div>
                    <Modal show={verifyShow} size="xl" onHide={verifyHandleClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Verify Domain</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className={styles.tight_text}>Create the following domain record: 
                            <p></p> Step 1: Use the copy button below to copy the hash 
                            <p></p> {String(signMessageData).slice(0,85)}<br></br>{String(signMessageData).slice(86,170)}
                            <p></p> Step 2: Create a new txt record at your domain registrar name &quot;ct&quot;
                            <p></p> Step 3: Paste hash into data field of new record
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="primary" 
                                onClick={() => {
                                    if (signMessageData) {
                                        navigator.clipboard.writeText(signMessageData);
                                        setIsDisabled(true);
                                        setCopyTitle("Copied");
                                    }
                                }}
                                disabled={isDisabled}
                            >
                                {copyTitle}
                            </Button>
                            <Button variant="secondary" onClick={verifyHandleClose}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
                <div>
                    <Modal show={showLinkDisplay} size="lg" onHide={linkDisplayClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Subscription Link</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>Pass the following link to your potential subscribers: 
                            <p></p> {linkDisplayed.slice(0,85)}<br></br>{linkDisplayed.slice(86,170)}
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
                    <Modal show={showEditForm} size="xl" onHide={editFormHandleClose} centered className={styles.subsmodal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Account</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <EditAccountForm
                                accountDetails={{
                                    description: accountDetails?.description || '',
                                    company: accountDetails?.company || '',
                                    url: accountDetails?.url || '',
                                    domain: accountDetails?.domain || '',
                                    email: accountDetails?.email || '',
                                    misc: accountDetails?.misc || ''
                                }}
                                setChangedAccountDetails={async (details: AccountDetails) => {
                                    setChangedAccountDetails(details);
                                }}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
              
                <Stack gap={3}>
                    <div>  
                        <p style={{display: "flex", justifyContent: "center", alignContent: "center", margin: "5px", fontSize:"20px"}}>
                            <b>Account</b>
                        </p>
                        <div>
                            <Card>
                                <Card.Body>
                                    <Card.Title style={{justifyContent:"center", textAlign:"center"}}> 
                                        <Avatar
                                            size={75}
                                            name={a}
                                            variant="pixel"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                        {a}
                                    </Card.Title>  
                                    <Stack gap={3}>
                                        <Row>
                                            <Col>
                                                <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                    <ListGroup.Item variant="primary" style={{width:"150px", textAlign:"center"}}>Status</ListGroup.Item>
                                                    {!isDomainVerified ?
                                                    <ListGroup.Item style={{width:"200px"}} variant="warning">Domain Unverified</ListGroup.Item>
                                                    : <ListGroup.Item style={{width:"200px"}} variant="success">Domain Verified</ListGroup.Item>}
                                                </ListGroup>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Stack gap={3}>
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item variant="primary" style={{width:"250px", textAlign:"center"}}>Description</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.description === undefined || accountDetails.description === "") ? "---" : accountDetails.description}</ListGroup.Item>
                                                    </ListGroup>
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item variant="primary" style={{width:"250px", textAlign:"center"}}>Email</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.email === undefined || accountDetails.email === "") ? "---" : accountDetails.email}</ListGroup.Item>
                                                    </ListGroup>
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">URL</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.url === undefined || accountDetails.url === "") ? "---" : accountDetails.url}</ListGroup.Item>
                                                    </ListGroup>
                                                </Stack>  
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                                <Stack gap={3}>     
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" variant="primary" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Company</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.company === undefined || accountDetails.company === "") ? "---" : accountDetails.company}</ListGroup.Item>
                                                    </ListGroup>
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Misc</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.misc === undefined || accountDetails.misc === "") ? "---" : accountDetails.misc}</ListGroup.Item>
                                                    </ListGroup>
                                                    <ListGroup horizontal={'lg'} className="listgroup-horizontal" style={{justifyContent:"center"}}>
                                                        <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Domain</ListGroup.Item>
                                                        <ListGroup.Item style={{width:"350px", textAlign:"center"}}>{(accountDetails?.domain === undefined || accountDetails.domain === "") ? "---" : accountDetails.domain}</ListGroup.Item>
                                                    </ListGroup>
                                                </Stack>
                                            </Col>
                                        </Row>
                                        {a === account ?
                                        <Row>
                                            <Col>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <Button variant="outline-info" onClick={editButtonClick}>Edit Details</Button>
                                                </ListGroup>
                                            </Col>
                                            <Col>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <Button variant="outline-info" onClick={async () => {
                                                        signMessage({message: msg});
                                                    }}>Verify Domain</Button>
                                                </ListGroup>
                                            </Col>
                                        </Row>
                                        : ""}
                                    </Stack>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                </Stack>
            </div>
        </div>
    );
};

export default Account; 