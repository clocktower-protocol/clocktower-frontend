import { useOutletContext } from "react-router-dom";
import React, {useEffect, useState , useRef} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import {Alert, Row, Col, Container, Card, ListGroup, Button, Stack, Modal} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount, useContractWrite, useWaitForTransaction, usePublicClient} from "wagmi";
import {recoverMessageAddress, parseAbiItem } from 'viem'
import EditAccountForm from "../EditAccountForm";

const Account = () => {

    let isMounting = useRef(true)

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //const { address, connector: activeConnector } = useAccount()
    const { address } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const [alertType, setAlertType] = useState("danger")
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false)

    const [isDisabled, setIsDisabled] = useState(false)
    const [copyTitle, setCopyTitle] = useState("Copy")
    const [isDomainVerified, setIsDomainVerified] = useState(false)
    const [description, setDescription] = useState("")
    const [company, setCompany] = useState("")
    const [url, setUrl] = useState("")
    const [domain, setDomain] = useState("")
    const [changedAccountDetails, setChangedAccountDetails] = useState({})
    const [accountDetails, setAccountDetails] = useState({})

    const msg = 'test'

     //sets mounting bool to not mounting after initial load
    useEffect(() => {
        isMounting.current = true

        getAccount()
    },[])

    //function for editing account
    const editAccount = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'editProvDetails',
        args: [changedAccountDetails]
    })

    const editAccountWait = useWaitForTransaction({
        confirmations: 1,
        hash: editAccount.data?.hash,
    })

    //hook for signing messages
    const {data: signMessageData, error, isLoading, signMessage, variables}  = useSignMessage({
        message: msg
    })

    //gets signed message
    useEffect(() => {
        ;(async () => {
            if (signMessageData) {
              const recoveredAddress = await recoverMessageAddress({
                message: variables?.message,
                signature: signMessageData,
              })
              if(recoveredAddress == address){
                setCopyTitle("Copy")
                setIsDisabled(false)
                verifyHandleShow()
              }
            }
        })()

    },[signMessageData])

    //hook for account form changes
    useEffect(() => {
          //calls wallet
          if(!isMounting.current && Object.keys(changedAccountDetails).length !== 0) {
            editAccount.write()
        } else {
            isMounting.current = false
        }
    },[changedAccountDetails])

    //shows alert when waiting for transaction to finish
    useEffect(() => {

        if(editAccountWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(editAccountWait.isSuccess) {

            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")
            
            editFormHandleClose()
            getAccount()
        }
    },[editAccountWait.isLoading, editAccountWait.isSuccess])

    const verifyDomain = async (domain, provAddress) => {

        let url = "https://dns.google/resolve?name=ct." + domain + "&type=TXT"

        console.log(url)

        //checks dns record
         try {
            var response = await fetch(url);
                
                var json = await response.json();
                if(json.Answer[0].data !== undefined){
                    console.log(json.Answer[0].data);
                    //verifies signature
                    const dnsRecoveredAddress = await recoverMessageAddress({
                        message: msg,
                        signature: json.Answer[0].data,
                      })
                    console.log(dnsRecoveredAddress)
                    if(dnsRecoveredAddress == provAddress) {
                        setIsDomainVerified(true)
                        console.log("TRUE!")
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

    //turns on and off form modal
    const editFormHandleClose = () => setShowEditForm(false)
    const editFormHandleShow = () => {
        setShowEditWarn(false)
        setShowEditForm(true)
    }

    const editButtonClick = () => {
        editHandleShow()
    }

    const verifyButtonClick = () => {
        verifyHandleShow()
    }

    //gets account info
    const getAccount = async () => {

        //checks if user is logged into account
        if(!isLoggedIn() || typeof address === "undefined") {
            console.log("Not Logged in")
            return
        }

        //TODO: how is this different than verify function?
        //checks dns record
        try {
            var response = await fetch('https://dns.google/resolve?name=ct.clocktower.finance&type=TXT');
                
            var json = await response.json();
             if(json.Answer[0].data !== undefined){
                console.log(json.Answer[0].data);
            }
        }
        catch(Err) {
            console.log(Err)
        }

        //variable to pass scope so that the state can be set
        let accountDetails = {}

        try{
            await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event ProvDetailsLog(address indexed provider, uint40 indexed timestamp, string description, string company, string url, string domain)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {provider: account}
            }) 
            .then(async function(events){
                 //checks for latest update by getting highest timestamp
                 if(events != undefined) {
                        
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
                    }    
                    
                }
                verifyDomain(accountDetails.domain)
                setAccountDetails(accountDetails)
            })
        } catch(Err) {
            console.log(Err)
        }
    }

    //Creates alert
    const alertMaker = () => {
        if(alert) {
            return (
                <div className="alertDiv">
                <Alert variant={alertType} align="center" onClose={() => setAlert(false)} dismissible>{alertText}</Alert>
                </div>
            )
        }
    }

    //checks that user has logged in 
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
            return (
            
                <div className="clockMeta">
                    {alertMaker()}
                    <div className="clockBody">
                        <div>
                            <Modal show={showEditWarn} onHide={editHandleClose} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Warning</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>
                                        All information saved to the account will be stored publically on the blockchain. 
                                    </p>
                                    <p>
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
                            <Modal show={verifyShow} size="xl" onHide={verifyHandleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Verify Domain</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Create the following domain record: 
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
                            <Modal show={showEditForm} size="xl" onHide={editFormHandleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Account</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <EditAccountForm
                                        description = {description}
                                        domain = {domain}
                                        url = {url}
                                        company = {company}
                                        accountDetails = {accountDetails}

                                        setDescription = {setDescription}
                                        setDomain = {setDomain}
                                        setUrl = {setUrl}
                                        setCompany = {setCompany}
                                        setChangedAccountDetails = {setChangedAccountDetails}

                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>  
                            <div>
                            <Card>
                                <Card.Body>
                                    <Card.Title> <Avatar
                                            size={75}
                                            name={account}
                                            variant="pixel"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                    />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{account}
                                    </Card.Title>
                                    <Stack gap={3}>
                                    <Row>

                                    </Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <ListGroup.Item variant="primary">Status</ListGroup.Item>
                                                {!isDomainVerified ?
                                                <ListGroup.Item variant="warning">Domain Unverified</ListGroup.Item>
                                                : <ListGroup.Item variant="success">Domain Verified</ListGroup.Item>}
                                            </ListGroup>
                                        </Col>
                                    <Row>
                                        <Col>
                                            <Stack gap={3}>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Description</ListGroup.Item>
                                                    <ListGroup.Item>{accountDetails.description}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Company</ListGroup.Item>
                                                    <ListGroup.Item>{accountDetails.company}</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>  
                                        </Col>
                                        <Col>
                                            <Stack gap={3}>     
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">URL</ListGroup.Item>
                                                    <ListGroup.Item>{accountDetails.url}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Domain</ListGroup.Item>
                                                    <ListGroup.Item>{accountDetails.domain}</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info" onClick = {() => editButtonClick()}>Edit Details</Button>
                                            </ListGroup>
                                        </Col>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info" onClick={async () => {
                                                    signMessage()
                                                }}>Verify Domain</Button>
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                    </Stack>
                                </Card.Body>
                            </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } 
}

export default Account