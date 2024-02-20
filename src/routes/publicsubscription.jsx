import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate, Link} from "react-router-dom";
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, FREQUENCY_LOOKUP, INFINITE_APPROVAL, TOKEN_LOOKUP, ZERO_ADDRESS} from "../config"; 
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient, useAccount} from 'wagmi'
import { readContract, writeContract } from 'wagmi/actions'
import { parseAbiItem, formatEther, erc20Abi} from 'viem'
import {config} from '../wagmiconfig'
/* global BigInt */

const PublicSubscription = () => {

    const { address } = useAccount()

    //gets public client for log lookup
    const publicClient = usePublicClient()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id, f, d} = useParams();

    const navigate = useNavigate()

    const emptyDetails = {}

    const [subscription, setSubscription] = useState("")
    const [details, setDetails] = useState(emptyDetails)
    //const [idSub, setId] = useState(id)
    //const [frequency, setFrequency] = useState(f)
    //const [dueDay, setDueDay] = useState(d)
    const [amount, setAmount] = useState(0)
    const [frequencyName, setFrequencyName] = useState("Monthly")
    const [tickerName, setTickerName] = useState("CLOCK")
    const [token, setToken] = useState(ZERO_ADDRESS)
    //const [tokenABI, setTokenABI] = useState(CLOCKTOKEN_ABI)
    const [alertType, setAlertType] = useState("danger")
    const [subscribed, setIsSubscribed] = useState(false)
    const [isProvider, setIsProvider] = useState(false)
    //const [show, setShow] = useState(false);
    //const [signature, setSignature] = useState("-1")
    //const [isDomainVerified, setIsDomainVerified] = useState(false)
    //const [isDisabled, setIsDisabled] = useState(false)
    //const [copyTitle, setCopyTitle] = useState("Copy")
    //const msg = 'test'

    //const handleClose = () => setShow(false);
    //const handleShow = () => setShow(true);

    /*

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
              console.log(typeof recoveredAddress)
              console.log(typeof address)
              if(recoveredAddress == address){
                console.log("here")
                setCopyTitle("Copy")
                setIsDisabled(false)
                handleShow()
              }
            }
        })()

    },[signMessageData])
    */

    //hook for token approval
    const subscribeWrite = useWriteContract({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'subscribe',
        args: [subscription]
    })
    
    const subscribeWait = useWaitForTransactionReceipt({
        confirmations: 1,
        hash: subscribeWrite.data?.hash,
    })

    /*
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
    */

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

        //
        /*
        //looks up token abi
        const abiLookup = (tokenAddress) => {
            //sets abi
            return TOKEN_LOOKUP.map((token) => {
                if(token.address === tokenAddress){
                    return token.ABI
                }
            return true
            })
        }
        */

        const getSub = async () => {
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
                            //verifies domain
                           // verifyDomain(events[index].args.domain, result.provider)
                        }       
                    }    
                })
                setSubscription(result)
                setAmount(formatEther(result.amount))
                setFrequencyName(frequencyLookup(result.frequency))
                setTickerName(tickerLookup(result.token))
                //setTokenABI(abiLookup(result.token)[1])
                setToken(result.token)
            })
        }

        const isSubscribed = async () => {
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

/*
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
    */

    //handles subscription button click and navigation
    const subscribe = useCallback(async () => {

        //first requires user to approve unlimited allowance

        
        //checks if user already has allowance
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
        subscribeWrite.write()
    
       
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
                    {/*
                    {(isProvider && !isDomainVerified && details.domain != "") ?
                    <>
                    <Card.Body align="center">
                        <Button onClick={async () => {
                            signMessage()
                            }}>Verify Domain</Button>
                    </Card.Body>
                    <Modal show={show} size="xl" onHide={handleClose}>
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
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                  </Modal>
                   
                  </>
                   
                    : ""}
                 */}
                </Card>
                
                </div>
                 
            </div>
        )
    }
}

export default PublicSubscription