import { useOutletContext, useParams } from "react-router-dom";
import React, {useEffect, useState , useRef, useCallback} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import {Row, Col, Card, ListGroup, Button, Stack, Modal, Toast, ToastContainer, Spinner} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import {recoverMessageAddress, parseAbiItem } from 'viem'
import EditAccountForm from "../components/EditAccountForm";
import {fetchToken} from '../clockfunctions'

import styles from '../css/clocktower.module.css';


const Account = () => {

    let isMounting = useRef(true)

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //gets passed url variables
    let {a} = useParams();

    const { address } = useAccount()

    const [account] = useOutletContext();

    //modal triggers
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false)
    const [showLinkDisplay, setShowLinkDisplay] = useState(false)

    //copy variables
    const [isDisabled, setIsDisabled] = useState(false)
    const [copyTitle, setCopyTitle] = useState("Copy")
    const [isLinkCopyDisabled, setLinkCopyDisabled] = useState(false)
    const [copyTitleLink, setCopyTitleLink] = useState("Copy")
    //account variables
    const [isDomainVerified, setIsDomainVerified] = useState(false)
    const [changedAccountDetails, setChangedAccountDetails] = useState({})
    const [accountDetails, setAccountDetails] = useState({})
    //alerts
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")

    //display Link
    const [linkDisplayed, setLinkDisplayed] = useState("")
    
    const msg = 'test'

    const { data, writeContract } = useWriteContract()

    const wait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data
    })


    //hook for signing messages
    const {data: signMessageData, signMessage, variables}  = useSignMessage()

    //gets signed message
    useEffect(() => {
        ;(async () => {
            if (signMessageData) {
              const recoveredAddress = await recoverMessageAddress({
                message: variables?.message,
                signature: signMessageData,
              })
              if(recoveredAddress === address){
                setCopyTitle("Copy")
                setIsDisabled(false)
                verifyHandleShow()
              }
            }
        })()

    },[signMessageData, address, variables?.message])

    //hook for account form changes
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(changedAccountDetails).length !== 0) {
            console.log(changedAccountDetails)
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editProvDetails',
                args: [changedAccountDetails]
            })
        } else {
            isMounting.current = false
        }
    },[changedAccountDetails, writeContract])

    const verifyDomain = async (domain, provAddress) => {

        let url = "https://dns.google/resolve?name=ct." + domain + "&type=TXT"

        //checks dns record
         try {
            var response = await fetch(url);
                
                var json = await response.json();
                if(json.Answer[0].data !== undefined){
                   
                    //verifies signature
                    const dnsRecoveredAddress = await recoverMessageAddress({
                        message: msg,
                        signature: json.Answer[0].data,
                      })
                    if(dnsRecoveredAddress === provAddress) {
                        setIsDomainVerified(true)
                    }
                }
            }
             catch(Err) {
                console.log(Err)
            }
    }

    //turns on and off edit warning modal
    const editHandleClose = () => setShowEditWarn(false);
    
    const editHandleShow = () => setShowEditWarn(true);

    //turns on and off verify domain modal 
    const verifyHandleClose = () => setVerifyShow(false);
    const verifyHandleShow = () => setVerifyShow(true);

    //turns on and off edit account form modal
    const editFormHandleClose = () => setShowEditForm(false)
    const editFormHandleShow = () => {
        setShowEditWarn(false)
        setShowEditForm(true)
    }

    //turns on and off link display modal
    const linkDisplayClose = () => {
        setShowLinkDisplay(false)
        setLinkDisplayed("")
    }
    const linkDisplayShow = () => {
        setLinkCopyDisabled(false)
        setCopyTitleLink("Copy")
        setShowLinkDisplay(true)
    }

    const editButtonClick = () => {
        editHandleShow()
    }

    //gets account info
    const getAccount = useCallback(async () => {


        //checks if user is logged into account
        if(typeof address === "undefined") {
            console.log("here")
            //linkToMain()
            return
        }

        //variable to pass scope so that the state can be set
        let accountDetails = {}

        //checks token
        await fetchToken()
        try{
            await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event ProvDetailsLog(address indexed provider, uint40 indexed timestamp, string indexed description, string company, string url, string domain, string email, string misc)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {provider: a}
            }) 
            .then(async function(events){
                 //checks for latest update by getting highest timestamp
                 if(events !== undefined) {
                        
                    let time = 0
                    let index = 0
                    
                    if(events.length > 0)
                    {
                        for (var j = 0; j < events.length; j++) {
                                if(time < events[j].args.timestamp)
                                {
                                    time = events[j].args.timestamp
                                    index = j
                                }
                        }
                        //adds latest details to details array
                        accountDetails = events[index].args
                        console.log(events[index].args)
                    }    
                    
                }
                verifyDomain(accountDetails.domain, a)
                setAccountDetails(accountDetails)
            })
        } catch(Err) {
            console.log(Err)
        }
    },[a, address, publicClient])


//sets mounting bool to not mounting after initial load
useEffect(() => {
    isMounting.current = true


    //checks if user is logged into account
    if(typeof address === "undefined") {
        //linkToMain()
    } else {
        getAccount()
    }

},[getAccount, address])

//changes data when passed account is switched
useEffect(() => {
    //doesn't reload on initial load
    if(!isMounting.current){
        getAccount()
        setIsDomainVerified(false)
    }
},[a, getAccount])

//shows alert when waiting for transaction to finish
useEffect(() => {
    if(wait.isLoading) {
        setToastHeader("Transaction Pending")
    }

    if(wait.isSuccess) {

        setShowToast(false)
        editFormHandleClose()
        getAccount()
        
    }
},[getAccount, wait.isLoading, wait.isSuccess])


//called when link to be displayed in modal 
useEffect(() => {
    if(linkDisplayed !== "" && typeof linkDisplayed !== "undefined"){
        linkDisplayShow()
    }

},[linkDisplayed])


            return (
            
                <div className={styles.top_level_account}>
                  
                    <ToastContainer position="top-center">
                        <Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
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
                                    <p></p> Step 2: Create a new txt record at your domain registrar name "ct"
                                    <p></p> Step 3: Paste hash into data field of new record
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="primary" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(signMessageData)
                                        setIsDisabled(true)
                                        setCopyTitle("Copied")
                                    }}
                                    disabled = {isDisabled}
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
                                        navigator.clipboard.writeText(linkDisplayed)
                                        setLinkCopyDisabled(true)
                                        setCopyTitleLink("Copied")
                                    }}
                                    disabled = {isLinkCopyDisabled}
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

                                        accountDetails = {accountDetails}
                                        setChangedAccountDetails = {setChangedAccountDetails}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                      
                        <div>

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
                                            <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
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
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item variant="primary" style={{width:"250px", textAlign:"center"}}>Description</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.description === undefined || accountDetails.description === "") ? "---" : accountDetails.description}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item variant="primary" style={{width:"250px", textAlign:"center"}}>Email</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.email === undefined || accountDetails.email === "") ? "---" : accountDetails.email}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">URL</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.url === undefined || accountDetails.url === "") ? "---" : accountDetails.url}</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>  
                                            </Col>
                                            <Col>
                                            <Stack gap={3}>     
                                                <ListGroup horizontal={'lg'} variant="primary" style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Company</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.company === undefined || accountDetails.company === "") ? "---" : accountDetails.company}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Misc</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.misc === undefined || accountDetails.misc === "") ? "---" : accountDetails.misc}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}} variant="primary">Domain</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"250px", textAlign:"center"}}>{(accountDetails.domain === undefined || accountDetails.domain === "") ? "---" : accountDetails.domain }</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>
                                        </Col>
                                    </Row>
                                    {a === account ?
                                    <Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                <Button variant="outline-info" onClick = {() => editButtonClick()}>Edit Details</Button>
                                            </ListGroup>
                                        </Col>
                                        <Col>
                                            <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                <Button variant="outline-info" onClick={async () => {
                                                    signMessage({message: msg})
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
        )
        
}

export default Account