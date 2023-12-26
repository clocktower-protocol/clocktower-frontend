import { useOutletContext, useParams } from "react-router-dom";
import React, {useEffect, useState , useRef} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS} from "../config"; 
import {Alert, Row, Col, Container, Card, ListGroup, Button, Stack, Modal, Tabs, Tab} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount, useContractWrite, useWaitForTransaction, usePublicClient} from "wagmi";
import { readContract } from 'wagmi/actions'
import {recoverMessageAddress, parseAbiItem } from 'viem'
import EditAccountForm from "../EditAccountForm";
import CreateSubForm2 from "../CreateSubForm2";
import SubscriptionsTable from "../SubscriptionsTable";

const Account = () => {

    let isMounting = useRef(true)

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //gets passed url variables
    let {a} = useParams();

    //const { address, connector: activeConnector } = useAccount()
    const { address } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const [alertType, setAlertType] = useState("danger")

    //modal triggers
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false)
    const [showCreateSub, setShowCreateSub] = useState(false)

    const [isDisabled, setIsDisabled] = useState(false)
    const [copyTitle, setCopyTitle] = useState("Copy")
    //account variables
    const [isDomainVerified, setIsDomainVerified] = useState(false)
    const [changedAccountDetails, setChangedAccountDetails] = useState({})
    const [accountDetails, setAccountDetails] = useState({})
    //table variables
    let emptyArray = []
    const [provDetailsArray, setProvDetailsArray] = useState(emptyArray)
    const [provSubscriptionArray, setProvSubscriptionArray] = useState(emptyArray)
    const [subscribedDetailsArray, setSubscribedDetailsArray] = useState(emptyArray)
    const [subscribedSubsArray, setSubscribedSubsArray] = useState(emptyArray)
    //passed back objects when calling wallet
    const [cancelledSub, setCancelledSub] = useState({})
    const [changedCreateSub, setChangedCreateSub] = useState({})
    const [unsubscribedSub, setUnsubscribedSub] = useState({})

    const msg = 'test'

     //sets mounting bool to not mounting after initial load
    useEffect(() => {
        isMounting.current = true

        getAccount()
        getProviderSubs()
        getSubscriberSubs()
    },[])

    /*
    //changes data when account is switched
    useEffect(() => {
        getAccount()
        setIsDomainVerified(false)
    },[account])
    */

    //changes data when passed account is switched
    useEffect(() => {
        getAccount()
        setIsDomainVerified(false)
        getProviderSubs()
        getSubscriberSubs()
    },[a])

    //functions for editing account
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

    //functions for creating subscription
    const createSub = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'createSubscription',
        args: [changedCreateSub.amount, changedCreateSub.token, changedCreateSub.details, changedCreateSub.frequency, changedCreateSub.dueDay]
    })

    const createSubWait = useWaitForTransaction({
        confirmations: 1,
        hash: createSub.data?.hash
    })

    //functions for cancelling subscription
    //cancel subscription
    const cancelSubscription = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'cancelSubscription',
        args: [cancelledSub]
    })

    const cancelWait = useWaitForTransaction({
        confirmations: 1,
        hash: cancelSubscription.data?.hash,
    })

    //unsubscribe hooks
    const unsubscribeWrite = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'unsubscribe',
        args: [unsubscribedSub]
    })

    const unsubscribeWait = useWaitForTransaction({
        confirmations: 1,
        hash: unsubscribeWrite.data?.hash,
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

    //hook for calling wallet to create sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(changedCreateSub).length !== 0) {
            createSub.write()
        } else {
            isMounting.current = false
        }
    },[changedCreateSub])

    //hook for calling wallet to cancel sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(cancelledSub).length !== 0) {
            cancelSubscription.write()
        } else {
            isMounting.current = false
        }
    },[cancelledSub])

    //hook for calling wallet to unsubscribe
    useEffect(() => {
        //calls wallet
        if(Object.keys(unsubscribedSub).length !== 0) {
            unsubscribeWrite.write()
        }
    },[unsubscribedSub])


    //shows alert when waiting for transaction to finish
    useEffect(() => {

        if(editAccountWait.isLoading || createSubWait.isLoading || cancelWait.isLoading || unsubscribeWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(editAccountWait.isSuccess || createSubWait.isSuccess || cancelWait.isSuccess || unsubscribeWait.isSuccess) {

            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")
            
            editFormHandleClose()
            createSubHandleClose()
            getAccount()
            getProviderSubs()
            getSubscriberSubs()
        }
    },[editAccountWait.isLoading, createSubWait.isLoading, cancelWait.isLoading, unsubscribeWait.isLoading, unsubscribeWrite.isSuccess, createSubWait.isSuccess, editAccountWait.isSuccess, cancelWait.isSuccess])

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

    //turns on and off create susbcription modal
    const createSubHandleClose = () => setShowCreateSub(false)
    const createSubHandleShow = () => setShowCreateSub(true)

    const editButtonClick = () => {
        editHandleShow()
    }

    const verifyButtonClick = () => {
        verifyHandleShow()
    }

    const createButtonClick = () => {
        createSubHandleShow()
    }

    //gets account info
    const getAccount = async () => {


        //checks if user is logged into account
        if(!isLoggedIn() || typeof address === "undefined") {
            console.log("Not Logged in")
            return
        }

        //variable to pass scope so that the state can be set
        let accountDetails = {}

        try{
            await publicClient.getLogs({
                address: CLOCKTOWERSUB_ADDRESS,
                event: parseAbiItem('event ProvDetailsLog(address indexed provider, uint40 indexed timestamp, string description, string company, string url, string domain)'),
                fromBlock: 0n,
                toBlock: 'latest',
                args: {provider: a}
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
                verifyDomain(accountDetails.domain, a)
                setAccountDetails(accountDetails)
            })
        } catch(Err) {
            console.log(Err)
        }
    }

const getProviderSubs = async () => {
        //checks if user is logged into account
       
        if(!isLoggedIn() || typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }

       //variable to pass scope so that the state can be set
       let accountSubscriptions = []

       try{
       await readContract({
           address: CLOCKTOWERSUB_ADDRESS,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, account]
       })
       .then(async function(result) {
           accountSubscriptions = result

           //loops through each subscription
           for (var i = 0; i < accountSubscriptions.length; i++) {
               await publicClient.getLogs({
                   address: CLOCKTOWERSUB_ADDRESS,
                   event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
                   fromBlock: 0n,
                   toBlock: 'latest',
                   args: {id:[accountSubscriptions[i].subscription.id]}
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
                           provDetailsArray[i] = events[index].args
                       }    
                       
                   }
                   
               })
               
           }
           setProvSubscriptionArray(accountSubscriptions)
           setProvDetailsArray(provDetailsArray)
       })
   } catch(Err) {
       console.log(Err)
   }
}

const getSubscriberSubs = async () => {
    //checks if user is logged into account
   
    if(!isLoggedIn() || account === "-1" || typeof address === "undefined") {
       console.log("Not Logged in")
       return
   }
   
   //variable to pass scope so that the state can be set
   let accountSubscriptions = []

   try{
   await readContract({
       address: CLOCKTOWERSUB_ADDRESS,
       abi: CLOCKTOWERSUB_ABI,
       functionName: 'getAccountSubscriptions',
       args: [true, account]
   })
   .then(async function(result) {
       accountSubscriptions = result

       //loops through each subscription
       for (var i = 0; i < accountSubscriptions.length; i++) {
           await publicClient.getLogs({
               address: CLOCKTOWERSUB_ADDRESS,
               event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
               fromBlock: 0n,
               toBlock: 'latest',
               args: {id:[accountSubscriptions[i].subscription.id]}
           }) 
           .then(async function(events){
           
                
               //checks for latest update by getting highest timestamp
               if(events != undefined) {
                   console.log(events)
                   
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
                       subscribedDetailsArray[i] = events[index].args
                   }    
                   
               }
               
           })
           
       }
       setSubscribedSubsArray(accountSubscriptions)
       setSubscribedDetailsArray(subscribedDetailsArray)
   })
    } catch(Err) {
        console.log(Err)
    }
}

const isTableEmpty1 = (subscriptionArray) => {
       
    let count = 0
    if(subscriptionArray.length === 0){
        return true
    } else {
       subscriptionArray.forEach(subscription => {
           if(subscription.status !== 1) {count += 1}
       })
       if(count > 0) { return false } else {return true}
    }
       
}

const isTableEmpty2 = () => {
    let count = 0
    if(subscribedSubsArray.length === 0){
        return true
    } else {
        subscribedSubsArray.forEach(subscription => {
            //this checks for unsubscribes AND cancels
            if(Number(subscription.status) === 0) {count += 1}
        })
        if(count > 0) { 
            //setIsEmpty(false)
            return false 
        } else {
        // setIsEmpty(true)
            return true
        }
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

                                        accountDetails = {accountDetails}
                                        setChangedAccountDetails = {setChangedAccountDetails}

                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>
                            <Modal show={showCreateSub} size="xl" onHide={createSubHandleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Create Subscription</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <CreateSubForm2
                                        setChangedCreateSub = {setChangedCreateSub}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <Stack gap={3}>
                        <div>  
                            <div>
                            <Card>
                                <Card.Body>
                                    <Card.Title> <Avatar
                                            size={75}
                                            name={a}
                                            variant="pixel"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                    />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{a}
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
                                                    <ListGroup.Item>{(accountDetails.description === undefined || accountDetails.description === "") ? "---" : accountDetails.description}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Company</ListGroup.Item>
                                                    <ListGroup.Item>{(accountDetails.company === undefined || accountDetails.company === "") ? "---" : accountDetails.company}</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>  
                                        </Col>
                                        <Col>
                                            <Stack gap={3}>     
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">URL</ListGroup.Item>
                                                    <ListGroup.Item>{(accountDetails.url === undefined || accountDetails.url === "") ? "---" : accountDetails.url}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Domain</ListGroup.Item>
                                                    <ListGroup.Item>{(accountDetails.domain === undefined || accountDetails.domain === "") ? "---" : accountDetails.domain }</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>
                                        </Col>
                                    </Row>
                                    {a === account ?
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
                                    : ""}
                                    </Stack>
                                </Card.Body>
                            </Card>
                            </div>
                        </div>
                        {a === account ?
                        <div>
                            <Row>
                                
                                <Col align="center">
                                    <Button variant="outline-info" onClick = {() => createButtonClick()}>Create Subscription</Button>
                                </Col>
                                
                            </Row>
                        </div>
                         : ""}
                        {a === account ?
                        <div>    
                            <Tabs
                                defaultActiveKey="provider"
                                id="account-tabs"
                                className="mb-3"
                                justify
                            >
                                <Tab eventKey="provider" title="Created">
                                    <div className="provHistory">
                                    {!isTableEmpty1(provSubscriptionArray) ?
                                    <SubscriptionsTable
                                        subscriptionArray = {provSubscriptionArray}
                                        isAdmin = {false}
                                        role = {1}
                                        detailsArray = {provDetailsArray}
                                        setCancelledSub = {setCancelledSub}
                                    />
                                    : <div></div>}
                                    
                                    </div>
                                </Tab>
                               
                                <Tab eventKey="subscriber" title="Subscribed To">
                                    <div className="provHistory">
                                        {subscribedSubsArray.length > 0 && !isTableEmpty2() ?
                                        <SubscriptionsTable
                                            subscriptionArray = {subscribedSubsArray}
                                            detailsArray = {subscribedDetailsArray}
                                        // unsubscribe = {unsubscribe}
                                            account = {account}
                                            role = {2}
                                            setUnsubscribedSub = {setUnsubscribedSub}
                                        />
                                        : ""}
                                    </div>
                                </Tab>        
                            </Tabs>
                        </div>
                        : ""}
                        </Stack>
                    </div>
                </div>
            )
        } 
}

export default Account