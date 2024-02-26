import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button} from 'react-bootstrap';
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
   
   
    const { data, writeContract } = useWriteContract()

    
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
                    event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
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

        if(account !== "-1"){
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

    //handles subscription button click and navigation
    const subscribe = useCallback(async () => {

        //first requires user to approve unlimited allowance

        
        //checks if user already has allowance
        await fetchToken()
        const allowanceBalance = await readContract(config, {
            address: token,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [address, CLOCKTOWERSUB_ADDRESS]
        })

        //console.log(allowanceBalance)
        
        if(BigInt(allowanceBalance) < 100000000000000000000000n) {
            //if allowance has dropped below 100,000 site requests infinite approval again
            await writeContract({
                address: token,
                abi: erc20Abi,
                functionName: 'approve',
                args: [CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL]
            })
        }

        //subscribes
        writeContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'subscribe',
            args: [subscription]
        })
    
       
    },[subscription, address, token])

    const sendToSubDash = useCallback(() => 
            navigate('/subscriberdash', {replace: true})
    ,[navigate])
    
     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(subscribeWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(subscribeWait.isSuccess) {

            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")

            sendToSubDash()
        }
    },[subscribeWait.isLoading, subscribeWait.isSuccess, sendToSubDash, setAlert, setAlertText])
   
    //checks that user has logged in 
    if(account === "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login to Subscribe</Alert>  
        )
    } else {
        return (
            <div> 
            {alertMaker()}
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
                        <ListGroup.Item>Domain: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.domain}&nbsp;&nbsp;</ListGroup.Item>
                        <ListGroup.Item>URL: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.url}</ListGroup.Item>
                        <ListGroup.Item>Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.email}</ListGroup.Item>
                        <ListGroup.Item>Phone: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.phone}</ListGroup.Item>
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
}

export default PublicSubscription