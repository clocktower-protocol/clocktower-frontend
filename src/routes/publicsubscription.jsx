import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button, Toast, ToastContainer, Spinner} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate, Link} from "react-router-dom";
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, FREQUENCY_LOOKUP, INFINITE_APPROVAL, TOKEN_LOOKUP, ZERO_ADDRESS} from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount} from 'wagmi'
import { readContract} from 'wagmi/actions'
import { parseAbiItem, formatEther, erc20Abi} from 'viem'
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'

/* global BigInt */

const PublicSubscription = () => {

    const { address } = useAccount()

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const [account] = useOutletContext();

    let {id, f, d} = useParams();

    const navigate = useNavigate()

    const emptyDetails = {}

    const [subscription, setSubscription] = useState("")
    const [details, setDetails] = useState(emptyDetails)
    const [amount, setAmount] = useState(0)
    const [frequencyName, setFrequencyName] = useState("Monthly")
    const [tickerName, setTickerName] = useState("CLOCK")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [alertType, setAlertType] = useState("danger")
    const [subscribed, setIsSubscribed] = useState(false)
    const [isProvider, setIsProvider] = useState(false)
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)
    //alerts
    const [showToast, setShowToast] = useState(false)
    const [toastHeader, setToastHeader] = useState("")
    const [toastBody, setToastBody] = useState("")
    const [isAllowanceSet, setAllowance] = useState(false)
    //const [allowanceBalance, setAllowanceBalance] = useState(0n)
   
   
    const { data, variables, writeContract } = useWriteContract()

    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: data,
    })


    //loads provider subscription list upon receiving parameter
    useEffect(() => {

        //looks up ticker for token
        const tickerLookup = (tokenAddress) => {
            return TOKEN_LOOKUP.map((token) => {
            if(token.address === tokenAddress) {
                return token.ticker
            } else {
                return ""
            }
            })
        }
  
        //looks up frequency
        const frequencyLookup = (frequencyIndex) => {
            return FREQUENCY_LOOKUP.map((frequencyObject) => {
            if(frequencyIndex === frequencyObject.index) {
                return frequencyObject.name
            } else {
                return ""
            }
            })
        }

        const getSub = async () => {
            await fetchToken()
            await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubByIndex',
                args: [id, f, d]
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
                       // console.log(events)
                        
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
                            setDetails(events[index].args)
                        }       
                    }    
                })
                setSubscription(result)
                setAmount(formatEther(result.amount))
                setFrequencyName(frequencyLookup(result.frequency))
                setTickerName(tickerLookup(result.token))
                setToken(result.token)
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
            let result = await readContract(config, {
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubByIndex',
                args: [id, f, d]
            })

            if(result.provider === account) {
                setIsProvider(true)
            } else {
                setIsProvider(false)
            }
        }

        if(typeof account !== undefined){
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
    
       
    },[subscription, address, token])

    const sendToAccount = useCallback(() => 
            navigate('/account/'+address)
    ,[navigate])


     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(subscribeWait.isLoading) {
        
            setToastHeader("Transaction Pending")
            console.log("pending")
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
    },[subscribeWait.isLoading, subscribeWait.isSuccess, sendToAccount, setAlert, setAlertText])
   
    //checks that user has logged in 
   
        return (
            <div> 
                {alertMaker()}
                <ToastContainer position="top-center">
                <   Toast animation="true" onClose={() => setShowToast(false)} show={showToast} delay={20000} autohide>
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
                <div className="publicSub">
                <Card style={{ width: '35rem' }}>
                    <Card.Body>
                        <Card.Title align="center">Subscription</Card.Title>
                        <Card.Text align="center">
                        {details.description}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroup.Item>Provider:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<Link to={`../account/${subscription.provider}`}>{subscription.provider}</Link> </ListGroup.Item>
                        <ListGroup.Item>Amount: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{amount} {tickerName}</ListGroup.Item>
                        <ListGroup.Item>Frequency: &nbsp;&nbsp;{frequencyName}</ListGroup.Item>
                        <ListGroup.Item>Day Due: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subscription.dueDay}</ListGroup.Item>
                        <ListGroup.Item>URL: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.url}</ListGroup.Item>
                    </ListGroup>
                    {(!subscribed && !isProvider) ?
                    <Card.Body align="center">
                        <Button onClick={subscribe}>Subscribe</Button>
                    </Card.Body>
                    : ""}
                   
                </Card>
                
                </div>
                 
            </div>
        )
}

export default PublicSubscription