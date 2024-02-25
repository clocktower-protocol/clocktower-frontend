import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import React, {useEffect, useState , useRef, useCallback} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import {Alert, Row, Col, Card, ListGroup, Button, Stack, Modal, Tabs, Tab} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient} from "wagmi";
import { readContract } from 'wagmi/actions'
import {recoverMessageAddress, parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
import EditAccountForm from "../components/EditAccountForm";
import CreateSubForm2 from "../components/CreateSubForm2";
import SubscriptionsTable from "../components/SubscriptionsTable";
import {fetchToken} from '../clockfunctions'


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
    const [showSubEditForm, setShowSubEditForm] = useState(false)

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

    //link functions
    const navigate = useNavigate();
    //const linkToMain = useCallback(() => navigate('/', {replace: true}), [navigate])

    const msg = 'test'

    const { data, writeContract } = useWriteContract()

    const wait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data
    })


    //hook for signing messages
    const {data: signMessageData, signMessage, variables}  = useSignMessage({
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
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editProvDetails',
                args: [changedAccountDetails]
            })
        } else {
            isMounting.current = false
        }
    },[changedAccountDetails])

    //hook for calling wallet to create sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(changedCreateSub).length !== 0) {
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'createSubscription',
                args: [changedCreateSub.amount, changedCreateSub.token, changedCreateSub.details, changedCreateSub.frequency, changedCreateSub.dueDay]
            })
        } else {
            isMounting.current = false
        }
    },[changedCreateSub])

    //hook for calling wallet to cancel sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(cancelledSub).length !== 0) {
            //cancelSubscription.write()
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'cancelSubscription',
                args: [cancelledSub]
            })
        } else {
            isMounting.current = false
        }
    },[cancelledSub])

    //hook for calling wallet to unsubscribe
    useEffect(() => {
        //calls wallet
        if(Object.keys(unsubscribedSub).length !== 0) {
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'unsubscribe',
                args: [unsubscribedSub]
            })
        }
    },[unsubscribedSub])

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
                    if(dnsRecoveredAddress === provAddress) {
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

    //turns on and off edit account form modal
    const editFormHandleClose = () => setShowEditForm(false)
    const editFormHandleShow = () => {
        setShowEditWarn(false)
        setShowEditForm(true)
    }

    //turns on and off create susbcription modal
    const createSubHandleClose = () => setShowCreateSub(false)
    const createSubHandleShow = () => setShowCreateSub(true)

    //turns on and off subscription details edit modal
    //const subEditDetailsHandleClose = () => setShowSubEditForm(false)
    const subEditDetailsHandleShow = () => setShowSubEditForm(true)

    const editButtonClick = () => {
        editHandleShow()
    }


    const createButtonClick = () => {
        createSubHandleShow()
    }

    //gets account info
    const getAccount = useCallback(async () => {


        //checks if user is logged into account
        if(typeof address === "undefined") {
            console.log("Not Logged in")
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
                event: parseAbiItem('event ProvDetailsLog(address indexed provider, uint40 indexed timestamp, string description, string company, string url, string domain)'),
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
                    }    
                    
                }
                verifyDomain(accountDetails.domain, a)
                setAccountDetails(accountDetails)
            })
        } catch(Err) {
            console.log(Err)
        }
    },[a, address, isLoggedIn, publicClient])

const getProviderSubs = useCallback(async () => {
        //checks if user is logged into account
       
        if(!isLoggedIn() || typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }

       //variable to pass scope so that the state can be set
       let accountSubscriptions = []

       await fetchToken()
       try{
       await readContract(config, {
           address: CLOCKTOWERSUB_ADDRESS,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, account]
       })
       .then(async function(result) {
           accountSubscriptions = result

           //loops through each subscription
           for (let i = 0; i < accountSubscriptions.length; i++) {
            
               await publicClient.getLogs({
                   address: CLOCKTOWERSUB_ADDRESS,
                   event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
                   fromBlock: 0n,
                   toBlock: 'latest',
                   args: {id:[accountSubscriptions[i].subscription.id]}
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
}, [account, address, isLoggedIn, provDetailsArray, publicClient])

const getSubscriberSubs = useCallback(async () => {
    //checks if user is logged into account
   
    if(!isLoggedIn() || account === "-1" || typeof address === "undefined") {
       console.log("Not Logged in")
       return
   }
   
   //variable to pass scope so that the state can be set
   let accountSubscriptions = []

   await fetchToken()
   try{
   await readContract(config, {
       address: CLOCKTOWERSUB_ADDRESS,
       abi: CLOCKTOWERSUB_ABI,
       functionName: 'getAccountSubscriptions',
       args: [true, account]
   })
   .then(async function(result) {
       accountSubscriptions = result

       //loops through each subscription
       for (let i = 0; i < accountSubscriptions.length; i++) {
           await publicClient.getLogs({
               address: CLOCKTOWERSUB_ADDRESS,
               event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
               fromBlock: 0n,
               toBlock: 'latest',
               args: {id:[accountSubscriptions[i].subscription.id]}
           }) 
           .then(async function(events){
           
                
               //checks for latest update by getting highest timestamp
               if(events !== undefined) {
                   //console.log(events)
                   
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
     //  console.log(accountSubscriptions)
       setSubscribedSubsArray(accountSubscriptions)
       setSubscribedDetailsArray(subscribedDetailsArray)
   })
    } catch(Err) {
        console.log(Err)
    }
},[account, address, isLoggedIn, publicClient, subscribedDetailsArray])

//sets mounting bool to not mounting after initial load
useEffect(() => {
    isMounting.current = true


    //checks if user is logged into account
    if(typeof address === "undefined") {
        //console.log("Not Logged in")
        //linkToMain()
    } else {
        getAccount()
        getProviderSubs()
        getSubscriberSubs()
    }

    //console.log("here")
},[getAccount, getProviderSubs, getSubscriberSubs])

//changes data when passed account is switched
useEffect(() => {
    getAccount()
    setIsDomainVerified(false)
    getProviderSubs()
    getSubscriberSubs()
},[a, getAccount, getProviderSubs, getSubscriberSubs])

//shows alert when waiting for transaction to finish
useEffect(() => {

    if(wait.isLoading) {
        setAlertType("warning")
        setAlert(true)
        setAlertText("Transaction Pending...")
        console.log("pending")
    }

    if(wait.isSuccess) {

        //turns off alert
        setAlert(false)
        setAlertType("danger")
        //console.log("done")
        
        editFormHandleClose()
        createSubHandleClose()
        getAccount()
        getProviderSubs()
        getSubscriberSubs()
    }
},[getAccount, getProviderSubs, getSubscriberSubs, setAlert, setAlertType, setAlertText, wait.isLoading, wait.isSuccess])

const isTableEmpty1 = (subscriptionArray) => {
       
    //console.log(subscriptionArray)
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

const isTableEmpty2 = (subscriptionArray2) => {
    let count = 0
    if(subscriptionArray2.length === 0){
        return true
    } else {
        subscriptionArray2.forEach(subscription => {
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
                        <div>
                            <Modal show={showSubEditForm} size="xl" onHide={subEditDetailsHandleShow}>
                            <Modal.Header closeButton>
                                <Modal.Title>Create Subscription</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
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
                                   
                                        
                                        {!isTableEmpty2(subscribedSubsArray) ?
                                        <SubscriptionsTable
                                            subscriptionArray = {subscribedSubsArray}
                                            detailsArray = {subscribedDetailsArray}
                                        // unsubscribe = {unsubscribe}
                                            account = {account}
                                            role = {2}
                                            setUnsubscribedSub = {setUnsubscribedSub}
                                        />
                                        : <div></div>}
                                        
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