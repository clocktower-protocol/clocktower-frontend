import { useOutletContext, useParams } from "react-router-dom";
import React, {useEffect, useState , useRef, useCallback} from 'react'
import {CLOCKTOWERSUB_ABI, CHAIN_LOOKUP} from "../config"; 
import {Row, Col, Button, Stack, Modal, Toast, ToastContainer, Spinner, ButtonGroup} from 'react-bootstrap';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { readContract } from 'wagmi/actions'
//import { parseAbiItem } from 'viem'
import {config} from '../wagmiconfig'
import CreateSubForm from "../components/CreateSubForm";
import SubscriptionsTable from "../components/SubscriptionsTable";
//import {fetchToken} from '../clockfunctions'
import EditDetailsForm2 from "../components/EditDetailsForm";
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';
import { gql } from '@apollo/client';
import { apolloClient } from '../apolloclient';


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

    const { address, chainId } = useAccount()

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

    const [checked, setChecked] = useState(false)

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

    //dynamically sets the tab
    useEffect(() => {
        if (t === "created" || t === "subscribed") {
          setTab(t);
        } else {
          setTab("created"); // Default to "created" for invalid t
        }
    }, [t]);


    //WAGMI write contract hooks------------------------------

    const { data: hash, writeContract } = useWriteContract()

    /*
    const wait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data
    })
    */
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
        confirmations: 2,
    });

    //hook for calling wallet to create sub
    useEffect(() => {
        //calls wallet
       // if(!isMounting.current && Object.keys(changedCreateSub).length !== 0 && (typeof(changedCreateSub) != "undefined")) {
        if (Object.keys(changedCreateSub).length > 0) {

            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

            //sets toast
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: contractAddress,
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

            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: contractAddress,
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

            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'unsubscribe',
                args: [unsubscribedSub]
            })
        } else {
            isMounting.current = false
        }
    },[unsubscribedSub, writeContract])

    //hook for editing subscription
    useEffect(() => {
         //calls wallet
         if(Object.keys(editResult).length !== 0) {

            //gets contract address from whatever chain is selected
            const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
            setToastHeader("Waiting on wallet transaction...")
            setShowToast(true)
            writeContract({
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'editDetails',
                args: [editResult.details, editResult.id]
            })

            subEditDetailsHandleClose()

        } else {
            isMounting.current = false
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

       //gets contract address from whatever chain is selected
        const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
        //const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

       //variable to pass scope so that the state can be set
       //let accountSubscriptions = []

       //temp details array
       //let tempDetailsArray = [];

       //await fetchToken()
       try{
       const accountSubscriptions = await readContract(config, {
           address: contractAddress,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, address],
           cacheTime: 0
       })
       //.then(async function(result) {
           //accountSubscriptions = result

           //console.log(accountSubscriptions)

           /*
           //loops through each subscription
           for (let i = 0; i < accountSubscriptions.length; i++) {
        
            const result = await apolloClient.query({
                    query: GET_LATEST_DETAILS_LOG,
                    variables: { subscriptionId: accountSubscriptions[i].subscription.id.toLowerCase(), first: 1 }
            });
            tempDetailsArray[i] = result.data.detailsLogs[0];
               
           }
           */
            const tempDetailsArray = await Promise.all(
                accountSubscriptions.map(async (sub) => {
                    const result = await apolloClient.query({
                        query: GET_LATEST_DETAILS_LOG,
                        variables: { subscriptionId: sub.subscription.id.toLowerCase(), first: 1 },
                    });
                return result.data.detailsLogs[0];
            })
    );

           setProvSubscriptionArray(accountSubscriptions)
           setProvDetailsArray(tempDetailsArray)
           setIsLoading(false)
      // })
   } catch(Err) {
       console.log(Err)
   }
}, [address, publicClient, chainId, config,])

const getSubscriberSubs = useCallback(async () => {
    //checks if user is logged into account
   
    if(typeof address === "undefined") {
       console.log("Not Logged in")
       return
   }
   
  
   //variable to pass scope so that the state can be set
   //let accountSubscriptions = []

   //temp details array
   //let tempDetailsArray = [];

   //gets contract address from whatever chain is selected
    const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
    //const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

   try{
   const accountSubscriptions = await readContract(config, {
       address: contractAddress,
       abi: CLOCKTOWERSUB_ABI,
       functionName: 'getAccountSubscriptions',
       args: [true, address],
       cacheTime: 0
   })
   /*
   .then(async function(result) {
       accountSubscriptions = result

       //loops through each subscription
       for (let i = 0; i < accountSubscriptions.length; i++) {
   
        const result2 = await apolloClient.query({
                query: GET_LATEST_DETAILS_LOG,
                variables: { subscriptionId: accountSubscriptions[i].subscription.id.toLowerCase(), first: 1 }
        });
        tempDetailsArray[i] = result2.data.detailsLogs[0];
           
       }
    */

     const tempDetailsArray = await Promise.all(
      accountSubscriptions.map(async (sub) => {
        const result = await apolloClient.query({
          query: GET_LATEST_DETAILS_LOG,
          variables: { subscriptionId: sub.subscription.id.toLowerCase(), first: 1 },
        });
        return result.data.detailsLogs[0];
      })
    );

    //console.log(accountSubscriptions)
     
       setSubscribedSubsArray(accountSubscriptions)
       setSubscribedDetailsArray(tempDetailsArray)
   //})
    } catch(Err) {
        //await fetchToken()
        console.log(Err)
    }
},[address, publicClient, chainId, config,])

const getSub = useCallback(async (editSubParams) => {

    //gets contract address from whatever chain is selected
    const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
    //const startBlock = CHAIN_LOOKUP.find(item => item.id === chainId).start_block

    await readContract(config, {
        address: contractAddress,
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
     
        const result3 = await apolloClient.query({
            query: GET_LATEST_DETAILS_LOG,
            variables: { subscriptionId: resultSub.id.toLowerCase(), first: 1 }
        });
        setPreEditDetails(result3.data.detailsLogs[0])
        
        //setEditSub(result)
        setEditSub(resultSub)
    })
},[publicClient])


//Page hooks------------------------------

//changes data when passed account is switched
useEffect(() => {
    isMounting.current = true

    //console.log("mounting")
    //checks if user is logged into account
    if(typeof address === "undefined") {
        //console.log("Not Logged in")
    } else {

        getProviderSubs()
        getSubscriberSubs()
    }

},[getProviderSubs, getSubscriberSubs, address])

//changes data when not mounting
useEffect(() => {

    //console.log("not mounting")
    //doesn't reload on initial load
    if(!isMounting.current){
        getProviderSubs()
        getSubscriberSubs()
    }
},[getProviderSubs, getSubscriberSubs])

//Hooks to catch object mutations------------------------
useEffect(() => {
    if(isConfirming) {
        console.log("Transaction is confirming...");
        setToastHeader("Transaction Pending")
    }

    if(isConfirmed) {
        console.log("Transaction confirmed, fetching subscriptions...");
        setShowToast(false)
        createSubHandleClose()
        setUnsubscribedSub({})  // Reset unsubscribedSub state
        
        // Force a refresh of the data
        setIsLoading(true)  // Show loading state
        Promise.all([
            getProviderSubs(),
            getSubscriberSubs()
        ]).then(() => {
            console.log("All subscriptions refreshed");
            setIsLoading(false)
        }).catch(error => {
            console.error("Error refreshing subscriptions:", error);
            setIsLoading(false)
        });
    }
},[getProviderSubs, getSubscriberSubs, isConfirmed, isConfirming])

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
    console.log("Checking if table is empty:", subscriptionArray2);
    let count = 0
    
    if(subscriptionArray2.length === 0){
        console.log("Table is empty - no subscriptions");
        return true
    } else {
        subscriptionArray2.forEach(subscription => {
            // Check for ACTIVE subscriptions (status === 0)
            if(Number(subscription.status) === 0) {
                count += 1
            }
        })
        console.log("Active subscriptions count:", count);
        if(count > 0) { 
            return false 
        } else {
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