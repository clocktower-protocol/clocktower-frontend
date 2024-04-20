import { useOutletContext, useParams } from "react-router-dom";
import React, {useEffect, useState , useRef, useCallback} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import {Row, Col, Card, ListGroup, Button, Stack, Modal, Tabs, Tab, Toast, ToastContainer, Spinner} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { readContract } from 'wagmi/actions'
import {recoverMessageAddress, parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
import EditAccountForm from "../components/EditAccountForm";
import CreateSubForm from "../components/CreateSubForm";
import SubscriptionsTable from "../components/SubscriptionsTable";
import {fetchToken} from '../clockfunctions'
import EditDetailsForm2 from "../components/EditDetailsForm2";
import ProviderSubCards from "../components/ProviderSubCards";

//TODO: getAccount() is called too many times need to cache result

const Account = () => {

    let isMounting = useRef(true)

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //gets passed url variables
    let {a} = useParams();

    //const { address, connector: activeConnector } = useAccount()
    const { address } = useAccount()

    const [account] = useOutletContext();

    //const [alertType, setAlertType] = useState("danger")

    //modal triggers
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false)
    const [showCreateSub, setShowCreateSub] = useState(false)
    const [showSubEditForm, setShowSubEditForm] = useState(false)
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
    //alerts
    //const [alertText2, setAlertText2] = useState("Test")
    //const [isAlertSet, setAlert2] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")
    //const [toastBody, setToastBody] = useState("")
    //editing subscription 
    const [editSub, setEditSub] = useState({})
    const [preEditDetails, setPreEditDetails] = useState({})
    const [editSubParams, setEditSubParams] = useState({})
    const [editResult, setEditResult] = useState({})
    //Display Link
    const [linkDisplayed, setLinkDisplayed] = useState("")
    //link functions
    //const navigate = useNavigate();
    //const linkToMain = useCallback(() => navigate('/', {replace: true}), [navigate])

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

    //hook for calling wallet to create sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(changedCreateSub).length !== 0) {
            //sets toast
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'createSubscription',
                args: [changedCreateSub.amount, changedCreateSub.token, changedCreateSub.details, changedCreateSub.frequency, changedCreateSub.dueDay]
            })
        } else {
            isMounting.current = false
        }
    },[changedCreateSub, writeContract])

    //hook for calling wallet to cancel sub
    useEffect(() => {
        console.log("test")
        //calls wallet
        if(!isMounting.current && Object.keys(cancelledSub).length !== 0) {
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            //cancelSubscription.write()
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'cancelSubscription',
                args: [cancelledSub]
            })
        } else {
            isMounting.current = false
            console.log("here")
        }
    },[cancelledSub, writeContract])

    //hook for calling wallet to unsubscribe
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(unsubscribedSub).length !== 0) {
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'unsubscribe',
                args: [unsubscribedSub]
            })
        }
    },[unsubscribedSub, writeContract])

    //hook for editing subscription
    useEffect(() => {
         //calls wallet
         if(Object.keys(editResult).length !== 0) {
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editDetails',
                args: [editResult.details, editResult.id]
            })

            subEditDetailsHandleClose()

        }
    },[editResult, writeContract])

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
    const subEditDetailsHandleClose = () => setShowSubEditForm(false)
    const subEditDetailsHandleShow = () => setShowSubEditForm(true)

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
                event: parseAbiItem('event ProvDetailsLog(address indexed provider, uint40 indexed timestamp, string description, string company, string url, string domain, string email, string misc)'),
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
    },[a, address, publicClient])

const getProviderSubs = useCallback(async () => {
        //checks if user is logged into account
       
        if(typeof address === "undefined") {
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
           args: [false, address]
       })
       .then(async function(result) {
           accountSubscriptions = result

           //loops through each subscription
           for (let i = 0; i < accountSubscriptions.length; i++) {
            
               console.log(i+1)
               console.log(address)
               await publicClient.getLogs({
                   address: CLOCKTOWERSUB_ADDRESS,
                   event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
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
}, [account, address, provDetailsArray, publicClient])

const getSubscriberSubs = useCallback(async () => {
    //checks if user is logged into account
   
    if(typeof address === "undefined") {
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
       args: [true, address]
   })
   .then(async function(result) {
       accountSubscriptions = result

       //loops through each subscription
       for (let i = 0; i < accountSubscriptions.length; i++) {
           await publicClient.getLogs({
               address: CLOCKTOWERSUB_ADDRESS,
               event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
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
},[account, address, publicClient, subscribedDetailsArray])

const getSub = useCallback(async (editSubParams) => {
    await fetchToken()
    await readContract(config, {
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'getSubByIndex',
        args: [editSubParams.id, editSubParams.f, editSubParams.d]
    })
    .then(async function(result) {
        await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
            fromBlock: 0n,
            toBlock: 'latest',
            args: {id:[result.id]}
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
                    setPreEditDetails(events[index].args)
                }       
            }    
        })
        setEditSub(result)
        //subEditDetailsHandleShow()
    })
},[publicClient])



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
},[getAccount, getProviderSubs, getSubscriberSubs, address])

//changes data when passed account is switched
useEffect(() => {
    //doesn't reload on initial load
    if(!isMounting.current){
        console.log("Account Switch")
        getAccount()
        setIsDomainVerified(false)
        getProviderSubs()
        getSubscriberSubs()
    }
},[a, getAccount, getProviderSubs, getSubscriberSubs])

//shows alert when waiting for transaction to finish
useEffect(() => {
    if(wait.isLoading) {
        /*
        setAlertType("warning")

       // setAlert(true)
      //  setAlertText("Transaction Pending...")

        setAlert2(true)
        setAlertText2("Transaction Pending...")
        */
        setToastHeader("Transaction Pending")
    }

    if(wait.isSuccess) {

        //turns off alert
      //  setAlert(false)
        setShowToast(false)

        /*
        setAlert2(false)
        

        setAlertType("danger")
        //console.log("done")
        */
        editFormHandleClose()
        createSubHandleClose()
        getAccount()
        getProviderSubs()
        getSubscriberSubs()
        
    }
},[getAccount, getProviderSubs, getSubscriberSubs, wait.isLoading, wait.isSuccess])

//called when edit subscription button is pushed
useEffect(() =>{
    if(JSON.stringify(editSubParams) !== '{}'
    ){
        //subEditDetailsHandleShow()
        getSub(editSubParams)
    }

},[editSubParams, getSub])

//called when subscription data is done loading
useEffect(() =>{
    if(Object.keys(editSub).length !== 0)
    {
        subEditDetailsHandleShow()
    }

},[editSub])

//called when link to be displayed in modal 
useEffect(() => {
    console.log(linkDisplayed)
    if(linkDisplayed !== "" && typeof linkDisplayed !== undefined){
        linkDisplayShow()
    }

},[linkDisplayed])

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
    //console.log(subscriptionArray2)
    //console.log("check")
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
 /*
const alertMaker = () => {
    if(isAlertSet) {
        return (
            <div className="alertDiv">
                <Alert variant={"danger"} align="center" onClose={() => setAlert2(false)} dismissible>{alertText2}</Alert>
            </div>
        )
    }
   // console.log(isAlertSet)
}
*/

    
            return (
            
                <div className="clockMeta">
                    {/*
                    alertMaker()
            */}
                    <ToastContainer position="top-center">
                        <Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                                <Toast.Header style={{justifyContent: "space-between"}}>
                                    <Spinner animation="border" variant="info" />
                                    {toastHeader}
                                </Toast.Header>
                                {/*
                                <Toast.Body style={{backgroundColor: "white", textAlign: "center"}}>
                                    {toastBody}
                                </Toast.Body>
                                */}
                        </Toast>
                    </ToastContainer>
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
                            <Modal show={verifyShow} size="xl" onHide={verifyHandleClose} centered>
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
                            <Modal show={showLinkDisplay} size="xl" onHide={linkDisplayClose} centered>
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
                            <Modal show={showEditForm} size="xl" onHide={editFormHandleClose} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Account</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <EditAccountForm

                                        accountDetails = {accountDetails}
                                        setChangedAccountDetails = {setChangedAccountDetails}

                                       // setAlert = {setAlert2}
                                       // setAlertText = {setAlertText2}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>
                            <Modal show={showCreateSub} size="xl" onHide={createSubHandleClose} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Create Subscription</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <CreateSubForm
                                        setChangedCreateSub = {setChangedCreateSub}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>
                            <Modal show={showSubEditForm} size="xl" onHide={subEditDetailsHandleClose} centered>
                            <Modal.Header closeButton>
                                <Modal.Title>Edit Subscription</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <EditDetailsForm2
                                        editSub = {editSub}
                                        preEditDetails = {preEditDetails}
                                        setEditResult = {setEditResult}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>

                        </div>
                        <Stack gap={3}>
                        <div>  
                            <div>
                            <Card>
                                <Card.Body>
                                    
                                    <Card.Title style={{justifyContent:"center", textAlign:"center"}}> 
                                        <Avatar
                                            size={75}
                                            name={a}
                                            variant="pixel"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                        />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{a}
                                    </Card.Title>
                                   
                                    <Stack gap={3}>
                                    <Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                <ListGroup.Item variant="primary" style={{width:"150px", textAlign:"center"}}>Status</ListGroup.Item>
                                                {!isDomainVerified ?
                                                <ListGroup.Item style={{width:"175px"}} variant="warning">Domain Unverified</ListGroup.Item>
                                                : <ListGroup.Item style={{width:"175px"}} variant="success">Domain Verified</ListGroup.Item>}
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <Stack gap={3}>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item variant="primary" style={{width:"150px", textAlign:"center"}}>Description</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.description === undefined || accountDetails.description === "") ? "---" : accountDetails.description}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item variant="primary" style={{width:"150px", textAlign:"center"}}>Email</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.email === undefined || accountDetails.email === "") ? "---" : accountDetails.email}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}} variant="primary">URL</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.url === undefined || accountDetails.url === "") ? "---" : accountDetails.url}</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>  
                                            </Col>
                                            <Col>
                                            <Stack gap={3}>     
                                                <ListGroup horizontal={'lg'} variant="primary" style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}} variant="primary">Company</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.company === undefined || accountDetails.company === "") ? "---" : accountDetails.company}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}} variant="primary">Misc</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.misc === undefined || accountDetails.misc === "") ? "---" : accountDetails.misc}</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'} style={{justifyContent:"center"}}>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}} variant="primary">Domain</ListGroup.Item>
                                                    <ListGroup.Item style={{width:"150px", textAlign:"center"}}>{(accountDetails.domain === undefined || accountDetails.domain === "") ? "---" : accountDetails.domain }</ListGroup.Item>
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
                                                    //verifyHandleShow()
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
                                            subEditDetailsHandleShow = {subEditDetailsHandleShow}
                                            setEditSubParams = {setEditSubParams}
                                            setLinkDisplayed = {setLinkDisplayed}
                                        />
                                        : <div></div>}
                                        
                                        {!isTableEmpty1(provSubscriptionArray) ?
                                        <div style={{justifyContent:"center", display:"flex"}}>
                                            <ProviderSubCards
                                                subscriptionArray = {provSubscriptionArray}
                                                detailsArray = {provDetailsArray}
                                                setCancelledSub = {setCancelledSub}
                                                subEditDetailsHandleShow = {subEditDetailsHandleShow}
                                                setEditSubParams = {setEditSubParams}
                                                setLinkDisplayed = {setLinkDisplayed}
                                            />
                                        </div>
                                        : <div></div>}
                                        
                                    </div>
                                </Tab>
                               
                                <Tab eventKey="subscriber" title="Subscribed To">
                                    <div className="subHistory">
                                   
                                        
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

export default Account