import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Toast, ToastContainer, Spinner} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate} from "react-router-dom";
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL, ZERO_ADDRESS, EVENT_START_BLOCK} from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount} from 'wagmi'
import { readContract} from 'wagmi/actions'
import { parseAbiItem, erc20Abi} from 'viem'
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'
import SubscriptionCards from "../components/SubscriptionCards";
import styles from '../css/clocktower.module.css';


/* global BigInt */

const PublicSubscription = () => {

    const { address } = useAccount()

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const [account] = useOutletContext();

    let {id, f, d} = useParams();

    const navigate = useNavigate()

    const [subscription, setSubscription] = useState("")
    
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [alertType, setAlertType] = useState("danger")
    const [subscribed, setIsSubscribed] = useState(false)
    const [isProvider, setIsProvider] = useState(false)
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)
    //card variables
    let emptyArray = []
    const [formattedSub, setFormattedSub] = useState(emptyArray)
    const [formattedDetails, setFormattedDetails] = useState(emptyArray)
    //alerts
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")
   
    const { data, variables, writeContract } = useWriteContract()

    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data,
    })


    //loads provider subscription list upon receiving parameter
    useEffect(() => {

        const getSub = async () => {
            await fetchToken()
            //TODO:
            await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                //functionName: 'getSubByIndex',
                functionName: 'idSubMap',
                //args: [id, f, d]
                args: [id]
            })
            .then(async function(result) {
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
                    args: {id:[resultSub.id]}
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
                            const tempDetails = [events[index].args]
                            setFormattedDetails(tempDetails)
                        }       
                    }    
                })
                //setSubscription(result)
                setSubscription(resultSub)
                //setToken(result.token)
                setToken(resultSub.token)
                //const tempSub = [{subscription: result, status: 0, totalSubscribers: 0}]
                const tempSub = [{subscription: resultSub, status: 0, totalSubscribers: 0}]
                setFormattedSub(tempSub)
                
            })
        }

        const isSubscribed = async () => {
            await fetchToken()
            let result = await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubscribersById',
                args: [id]
            })
            let status = false
            
            result.forEach((element) => {
                if(element.subscriber === account) {
                    setIsSubscribed(true)
                    status = true
                    return
                }
            })

            if(status) {
                setAlertType("warning")
                setAlert(true)
                setAlertText("Already Subscribed")
            }
            //return false
            setIsSubscribed(status)
            
        }
     
        const isProviderSame = async () => {
            await fetchToken()
            //TODO:
            let result = await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                //functionName: 'getSubByIndex',
                functionName: 'idSubMap',
                //args: [id, f, d]
                args: [id]
            })

            const resultSub = {
                id: result[0],
                amount: result[1],
                provider: result[2],
                token: result[3],
                cancelled: result[4], 
                frequency: result[5], 
                dueDay: result[6]
            }

            //if(result.provider === account) {
            if(resultSub.provider === account) {
                setIsProvider(true)
            } else {
                setIsProvider(false)
            }
        }

        if(typeof account !== "undefined"){
            getSub()
            isSubscribed()
            isProviderSame()
        }

    }, [account, d, f, id, publicClient, setAlert, setAlertText]);
    
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


    //subscribes to contract
    const subscribe = useCallback(async () => {

        //first requires user to approve unlimited allowance
        setToastHeader("Waiting on wallet transaction...")
        setShowToast(true)

        //checks if user already has allowance
        await fetchToken()
        const allowanceBalance = await readContract(config, {
            address: token,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, CLOCKTOWERSUB_ADDRESS]
        })
        
        if(BigInt(allowanceBalance) < 100000000000000000000000n) {
            //if allowance has dropped below 100,000 site requests infinite approval again
            
            writeContract({
                address: token,
                abi: erc20Abi,
                functionName: 'approve',
                args: [CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL]
            })
           
        } else {

            //subscribes
            writeContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'subscribe',
                args: [subscription]
            })
        }
    
       
    },[subscription, address, token, writeContract])

    const sendToAccount = useCallback(() => 
            navigate(`/subscriptions/subscribed`)
    ,[navigate])


     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(subscribeWait.isLoading) {
        
            setToastHeader("Transaction Pending")
        }

        if(subscribeWait.isSuccess) {

            //turns off alert
            setShowToast(false)

            //if approval is set calls subscribe function again
            if(variables.functionName === "approve"){
                subscribe()
                
            } else {
                sendToAccount()
            }
        }
    },[subscribeWait.isLoading, subscribeWait.isSuccess, sendToAccount, setAlert, setAlertText, variables, subscribe])
   
    //checks that user has logged in 
   
        return (
            <div className={styles.top_level_public}> 
                {alertMaker()}
                <ToastContainer position="top-center">
                <   Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
                        <Toast.Header style={{justifyContent: "space-between"}}>
                                <Spinner animation="border" variant="info" />
                                {toastHeader}
                        </Toast.Header>
                        </Toast>
             </ToastContainer>
          
                <div style={{justifyContent:"center", display:"flex", paddingTop:"30px"}}>
                    <SubscriptionCards
                        subscriptionArray = {formattedSub}
                        detailsArray = {formattedDetails}
                        isProvider = {isProvider}
                        isLink = {true}
                        isSubscribed = {subscribed}
                        subscribe = {subscribe}
                    />
                </div>
                 
            </div>
        )
}

export default PublicSubscription