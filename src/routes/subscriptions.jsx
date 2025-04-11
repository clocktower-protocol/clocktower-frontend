import { useOutletContext, useParams } from "react-router-dom";
import React, {useEffect, useState , useRef, useCallback} from 'react'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, EVENT_START_BLOCK} from "../config"; 
import {Row, Col, Button, Stack, Modal, Toast, ToastContainer, Spinner, ButtonGroup} from 'react-bootstrap';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { readContract } from 'wagmi/actions'
import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
import CreateSubForm from "../components/CreateSubForm";
import SubscriptionsTable from "../components/SubscriptionsTable";
//import {fetchToken} from '../clockfunctions'
import EditDetailsForm2 from "../components/EditDetailsForm2";
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';

const Subscriptions = () => {

    let isMounting = useRef(true)

    //gets public client for log lookup
    const publicClient = usePublicClient()

    //gets passed url variables
    let {t} = useParams();

    //formats t if not set
    if(typeof t === "undefined") {
        t = "created"
    }

    const { address } = useAccount()

    const [account] = useOutletContext();

    //modal triggers
    const [showCreateSub, setShowCreateSub] = useState(false)
    const [showSubEditForm, setShowSubEditForm] = useState(false)
    const [showLinkDisplay, setShowLinkDisplay] = useState(false)
    //copy variables
    const [isLinkCopyDisabled, setLinkCopyDisabled] = useState(false)
    const [copyTitleLink, setCopyTitleLink] = useState("Copy")
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
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")
    //editing subscription 
    const [editSub, setEditSub] = useState({})
    const [preEditDetails, setPreEditDetails] = useState({})
    const [editSubParams, setEditSubParams] = useState({})
    const [editResult, setEditResult] = useState({})
    //display Link
    const [linkDisplayed, setLinkDisplayed] = useState("")
    //page formatting 
    const [isTableView, setIsTableView] = useState(true)
    const [tab, setTab] = useState(t)
    //spinner
    const [isLoading, setIsLoading] = useState(true)


    //WAGMI write contract hooks------------------------------

    const { data, writeContract } = useWriteContract()

    const wait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data
    })

    //hook for calling wallet to create sub
    useEffect(() => {
        //calls wallet
        if(!isMounting.current && Object.keys(changedCreateSub).length !== 0 && (typeof(changedCreateSub) != "undefined")) {
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
        //calls wallet
        if(Object.keys(cancelledSub).length !== 0) {
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'cancelSubscription',
                args: [cancelledSub]
            })
        } else {
            isMounting.current = false
        }
    },[cancelledSub, writeContract])

    //hook for calling wallet to unsubscribe
    useEffect(() => {
        //calls wallet
        if(Object.keys(unsubscribedSub).length !== 0) {
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

    //MODAL Control--------------------------------

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

    const createButtonClick = () => {
        createSubHandleShow()
    }

    const getProviderSubs = useCallback(async () => {
        //checks if user is logged into account
       
        if(typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }

       //variable to pass scope so that the state can be set
       let accountSubscriptions = []

       //await fetchToken()
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
            
               await publicClient.getLogs({
                   address: CLOCKTOWERSUB_ADDRESS,
                   event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
                   fromBlock: EVENT_START_BLOCK,
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
           setIsLoading(false)
       })
   } catch(Err) {
       console.log(Err)
   }
}, [address, provDetailsArray, publicClient])

const getSubscriberSubs = useCallback(async () => {
    //checks if user is logged into account
   
    if(typeof address === "undefined") {
       console.log("Not Logged in")
       return
   }
   
  
   //variable to pass scope so that the state can be set
   let accountSubscriptions = []

   //await fetchToken()
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
               fromBlock: EVENT_START_BLOCK,
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
                       subscribedDetailsArray[i] = events[index].args
                   }    
                   
               }
               
           })
           
       }
     
       setSubscribedSubsArray(accountSubscriptions)
       setSubscribedDetailsArray(subscribedDetailsArray)
   })
    } catch(Err) {
        //await fetchToken()
        console.log(Err)
    }
},[address, publicClient, subscribedDetailsArray])

const getSub = useCallback(async (editSubParams) => {
    //await fetchToken()
    await readContract(config, {
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        //functionName: 'getSubByIndex',
        functionName: 'idSubMap',
        //args: [editSubParams.id, editSubParams.f, editSubParams.d]
        args: [editSubParams.id]
    })
    .then(async function(result) {
        //converts array to object
        const resultSub = {
            id: result[0],
            amount: result[1],
            provider: result[2],
            token: result[3],
            cancelled: result[4], 
            frequency: result[5], 
            dueDay: result[6]
        }
        await publicClient.getLogs({
            address: CLOCKTOWERSUB_ADDRESS,
            event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string url, string description)'),
            fromBlock: EVENT_START_BLOCK,
            toBlock: 'latest',
            //args: {id:[result.id]}
            //args: {id: result[0]}
            args: {id: resultSub.id}
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
        //setEditSub(result)
        setEditSub(resultSub)
    })
},[publicClient])


//Page hooks------------------------------

//sets mounting bool to not mounting after initial load
useEffect(() => {
    isMounting.current = true


    //checks if user is logged into account
    if(typeof address === "undefined") {
        console.log("Not Logged in")
    } else {
        getProviderSubs()
        getSubscriberSubs()
    }

},[getProviderSubs, getSubscriberSubs, address])

//changes data when passed account is switched
useEffect(() => {
    //doesn't reload on initial load
    if(!isMounting.current){
        getProviderSubs()
        getSubscriberSubs()
    }
},[getProviderSubs, getSubscriberSubs])

//Hooks to catch object mutations------------------------
useEffect(() => {
    if(wait.isLoading) {
        setToastHeader("Transaction Pending")
    }

    if(wait.isSuccess) {

        //turns off alert
        setShowToast(false)

        //editFormHandleClose()
        createSubHandleClose()
        //getAccount()
        getProviderSubs()
        getSubscriberSubs()
        
    }
},[getProviderSubs, getSubscriberSubs, wait.isLoading, wait.isSuccess])

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
    if(linkDisplayed !== "" && (typeof linkDisplayed !== "undefined")){
        linkDisplayShow()
    }

},[linkDisplayed])

//Methods to check if tables are empty--------------------------------
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

return (
            
    <div className={styles.top_level_subscriptions_route}>
        <ToastContainer position="top-center">
            <Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
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
                <Modal show={showCreateSub} size="xl" onHide={createSubHandleClose} centered className={styles.subsmodal}>
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
                <Modal show={showSubEditForm} size="xl" onHide={subEditDetailsHandleClose} centered className={styles.subsmodal}>
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
            <p className={styles.subs_header_route}>
                    <b>Subscriptions</b>
            </p>
            <hr className={styles.subs_topline_route}></hr>
            <Stack gap={3}>
            <div>
                <Row>
                    
                    <Col align="center">
                        <Button variant="outline-info" onClick = {() => createButtonClick()}>Create Subscription</Button>
                    </Col>
                    
                </Row>
            </div>
           
            <div>    
                <ButtonGroup aria-label="Table or Card" className={styles.subs_table_card_button_route}>
                    <Button variant={isTableView ? "secondary" : "light"} onClick={() => {setIsTableView(true)}}>Table</Button>
                    <Button variant={!isTableView ? "secondary" : "light"} onClick={() => {setIsTableView(false)}}>Card</Button>
                </ButtonGroup>
                <br></br>
                <div style={{display:"flex", width:"100%", justifyContent:"space-between"}}>
                    <ButtonGroup style={{flexGrow: "1"}} aria-label="Tab switcher" className={styles.subs_tabs}>
                        <Button variant={tab === "created" ? "secondary" : "light"} onClick={() => {setTab("created")}}>Created</Button>
                        <Button variant={tab !== "created" ? "secondary" : "light"} onClick={() => {setTab("subscribed")}}>Subscribed To</Button>
                    </ButtonGroup>
                </div>
                
        
        {tab === "created" ?  
            <div>

                    
                {!isTableEmpty1(provSubscriptionArray) && isTableView ?
                <div className={styles.subs_table_route}>
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
                </div>
                : isLoading ? (<div className={styles.tablespinner}><Spinner animation="grow" variant="info" /></div>) :
                (<div></div>)} 

                {!isTableEmpty1(provSubscriptionArray) && !isTableView && !isLoading ?
                <div style={{justifyContent:"center", display:"flex"}}>
                    <SubscriptionCards
                        subscriptionArray = {provSubscriptionArray}
                        detailsArray = {provDetailsArray}
                        setCancelledSub = {setCancelledSub}
                        subEditDetailsHandleShow = {subEditDetailsHandleShow}
                        setEditSubParams = {setEditSubParams}
                        setLinkDisplayed = {setLinkDisplayed}
                        isProvider = {true}
                        isLink = {false}
                        isSubscribed = {false}
                    />
                </div>
                : <div></div>}
            </div>

        : <div className="subHistory">
                       
                            
        {!isTableEmpty2(subscribedSubsArray) && isTableView ?
        <div className={styles.subs_table_route}>
            <SubscriptionsTable
                subscriptionArray = {subscribedSubsArray}
                detailsArray = {subscribedDetailsArray}
                account = {account}
                role = {2}
                setUnsubscribedSub = {setUnsubscribedSub}
            />
        </div>
        : isLoading ? (<div className={styles.tablespinner}><Spinner animation="grow" variant="info" /></div>) :
        (<div></div>)} 

        {!isTableEmpty2(subscribedSubsArray) && !isTableView ?
        <div style={{justifyContent:"center", display:"flex"}}>
            <SubscriptionCards
                subscriptionArray = {subscribedSubsArray}
                detailsArray = {subscribedDetailsArray}
                setUnsubscribedSub = {setUnsubscribedSub}
                isProvider = {false}
                isLink = {false}
                isSubscribed = {false}
            />
        </div>
        : <div></div>}
        
    </div>}

            </div>
            </Stack>
        </div>
    </div>
)
}

export default Subscriptions