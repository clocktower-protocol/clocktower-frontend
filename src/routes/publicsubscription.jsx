import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button, Modal} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate} from "react-router-dom";
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, FREQUENCY_LOOKUP, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS} from "../config"; 
import { useContractWrite, useWaitForTransaction, usePublicClient, useSignMessage, erc20ABI, useAccount} from 'wagmi'
import { readContract, writeContract } from 'wagmi/actions'
import { parseAbiItem, formatEther, recoverMessageAddress } from 'viem'
//import { read } from 'fs';
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
    const [idSub, setId] = useState(id)
    const [frequency, setFrequency] = useState(f)
    const [dueDay, setDueDay] = useState(d)
    const [amount, setAmount] = useState(0)
    const [frequencyName, setFrequencyName] = useState("Monthly")
    const [tickerName, setTickerName] = useState("CLOCK")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState(CLOCKTOKEN_ABI)
    const [alertType, setAlertType] = useState("danger")
    const [subscribed, setIsSubscribed] = useState(false)
    const [isProvider, setIsProvider] = useState(false)
    const [show, setShow] = useState(false);
    const [signature, setSignature] = useState("-1")
    const [isDomainVerified, setIsDomainVerified] = useState(false)
    //const [recoveredAddress, setRecoveredAddress] = useState("")
    const [isDisabled, setIsDisabled] = useState(false)
    const [copyTitle, setCopyTitle] = useState("Copy")
    const msg = 'test'

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
   // const [isAllowedUnlimited, setIsAllowedUnlimited] = useState(false)

  // const idSub = id
   //const frequency = f
  // const dueDay = d

    //hook for signing messages
    //const { data: signMessageData, error, isLoading, signMessage, variables } = useSignMessage()
    const {data: signMessageData, error, isLoading, signMessage, variables}  = useSignMessage({
        message: 'test'
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
                console.log("here")
                handleShow()
              }
             // setRecoveredAddress(recoveredAddress)
              
            }
        })()

    },[signMessageData])

    //hook for token approval
    const subscribeWrite = useContractWrite({
        address: CLOCKTOWERSUB_ADDRESS,
        abi: CLOCKTOWERSUB_ABI,
        functionName: 'subscribe',
        args: [subscription]
    })
    
    const subscribeWait = useWaitForTransaction({
        confirmations: 1,
        hash: subscribeWrite.data?.hash,
    })

     //shows alert when waiting for transaction to finish
     useEffect(() => {

        if(subscribeWait.isLoading) {
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            console.log("pending")
        }

        if(subscribeWait.isSuccess) {

           // console.log(data.status)
            //turns off alert
            setAlert(false)
            setAlertType("danger")
            console.log("done")

            sendToSubDash()
        }
    },[subscribeWait.isLoading, subscribeWait.isSuccess])

    //loads provider subscription list upon receiving parameter
    useEffect(() => {

        //looks up ticker for token
        const tickerLookup = (tokenAddress) => {
            return TOKEN_LOOKUP.map((token) => {
            if(token.address == tokenAddress) {
                return token.ticker
            }
           // return true
            })
         }
  
        //looks up frequency
        const frequencyLookup = (frequencyIndex) => {
            return FREQUENCY_LOOKUP.map((frequencyObject) => {
            if(frequencyIndex == frequencyObject.index) {
                return frequencyObject.name
            }
           // return true
            })
        }

        //looks up token abi
        const abiLookup = (tokenAddress) => {
            //sets abi
            return TOKEN_LOOKUP.map((token) => {
                if(token.address === tokenAddress){
                    //console.log(token.ABI)
                    return token.ABI
                }
            return true
            })
        }

        /*
        if(account != "-1"){     
            //checks allowance of user
            clocktoken.methods.allowance(account, CLOCKTOWERSUB_ADDRESS).call({from:account})
            .then(function(result) {
                console.log(result)
            })
        }
        */

        const getSub2 = async () => {
            await readContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubByIndex',
                args: [idSub, frequency, dueDay]
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
                            setDetails(events[index].args)
                            //verifies domain
                            verifyDomain(events[index].args.domain, result.provider)
                        }       
                    }    
                })
                setSubscription(result)
                setAmount(formatEther(result.amount))
                setFrequencyName(frequencyLookup(result.frequency))
                setTickerName(tickerLookup(result.token))
                setTokenABI(abiLookup(result.token)[1])
                setToken(result.token)
            })
        }

        /*
        const getSub = async () => await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from: account})
        .then(async function(result) {
            //gets details from logs
            await clocktowersub.getPastEvents('DetailsLog', {
                filter: {id:[result.id]},
                fromBlock: 0,
                toBlock: 'latest'
            }, function(error, events){ 
                //checks for latest update by getting highest timestamp
                if(events != undefined) {
                    let time = 0
                    let index = 0
                   
                    if(events.length > 0)
                    {
                        for (var j = 0; j < events.length; j++) {
                            if(time < events[j].returnValues.timestamp)
                            {
                                time = events[j].returnValues.timestamp
                                index = j
                            }
                        }
                       //adds latest details to details array
                       setDetails(events[index].returnValues)

                       //verifies domain
                       verifyDomain(events[index].returnValues.domain, result.provider)
                    }    
                }
            })
            setSubscription(result)
            setAmount(Web3.utils.fromWei(result.amount))
            setFrequencyName(frequencyLookup(result.frequency))
            setTickerName(tickerLookup(result.token))
            setTokenABI(abiLookup(result.token)[1])
            setToken(result.token)
        })
        */

        const isSubscribed2 = async () => {
            let result = await readContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubscribersById',
                args: [id]
            })
            let status = false
            
            result.forEach((element) => {
                if(element.subscriber == account) {
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
        /*


        const isSubscribed = async () => {
            let result = await clocktowersub.methods.getSubscribersById(id).call({from: account})
            let status = false
            result.forEach((element) => {
                if(element.subscriber == account) {
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
            let result = await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from:account})
        
            if(result.provider == account) {
                setIsProvider(true)
            } else {
                setIsProvider(false)
            }
        }
        */

        const isProviderSame2 = async () => {
            let result = await readContract({
                address: CLOCKTOWERSUB_ADDRESS,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getSubByIndex',
                args: [idSub, frequency, dueDay]
            })

            if(result.provider == account) {
                setIsProvider(true)
            } else {
                setIsProvider(false)
            }
        }

        if(account != "-1"){
           // getSub()
            getSub2()
            //isSubscribed()
            isSubscribed2()
            isProviderSame2()

        }

    }, [account]);
    
    
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);
    

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
    //gets unlimited approval from user
    const setInfiniteAllowance = useCallback(async () => {
        let transactionParameters = {};
        //console.log(token)
        //const web3 = new Web3(node)
         //creates contract variable
        const web3 = new Web3("http://localhost:8545")
        const contract = new web3.eth.Contract(tokenABI, token);

        const confirmTransaction = async (txHash) => {

            //gets transaction details
            const trx = await web3.eth.getTransaction(txHash)
    
            let isDone = false;
            
            //trys every five seconds to see if transaction is confirmed
            isDone = setTimeout(async () => {
    
            if(trx.blockNumber) {
                //turns off alert
                setAlert(false)
                setAlertType("danger")
                //getAccountTransactions()
                return true
            }
    
            //return await this.confirmTransaction(txHash)
            await confirmTransaction(txHash)
            return false
            },5*1000)
    
            
            if(isDone) {
            return true
            } 
        }

        if(token !== ZERO_ADDRESS) {
        
            transactionParameters = {
            to: token, // Required except during contract publications.
            from: account, // must match user's active address.
            data: contract.methods.approve(CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL).encodeABI()
        };

            //get metamask to sign transaction 
            try {
            await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            })
            .then (async (txhash) => {
                console.log(txhash)
                
                //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
                setAlertType("warning")
                setAlert(true)
                setAlertText("Transaction Pending...")
                 
                await confirmTransaction(txhash)

            })

            return {
                status: "transaction cancelled!"
            };
            
            } catch (error) {
            return {
                status: error.message
            }
            } 
        
        }
    }, [account, setAlert, setAlertText, token, tokenABI, setAlertType]
    )
    */


    //signs message with provide private key
    const signMessage2 = async () => {
        //TODO: change to something else
        const msg = "test"
        try {
            const from = account;
            // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
            // This uses a Node.js-style buffer shim in the browser.
            const sign = await window.ethereum.request({
              method: 'personal_sign',
              params: [msg, from],
            });
            console.log(sign)
            //verifies signature
            let signAddress = web3.eth.accounts.recover(msg, sign)
            console.log(signAddress)
            if(signAddress == account) {
                setSignature(sign)
                handleShow()
            }
          } catch (err) {
            console.error(err);
          }
    }


    const verifyDomain = async (domain, provAddress) => {

        let url = "https://dns.google/resolve?name=ct." + domain + "&type=TXT"

        console.log(url)

        //checks dns record
         try {
            var response = await fetch(url);
            const msg = "test"

                
                var json = await response.json();
                if(json.Answer[0].data !== undefined){
                    console.log(json.Answer[0].data);
                    //verifies signature
                    let signAddress = web3.eth.accounts.recover(msg, json.Answer[0].data)
                    console.log(signAddress)
                    if(signAddress == provAddress) {
                        setIsDomainVerified(true)
                        console.log("TRUE!")
                    }
                }
            }
             catch(Err) {
                console.log(Err)
            }
    }

    //handles subscription button click and navigation
    const subscribe = useCallback(async () => {

        /*
        const confirmTransaction = async (txHash) => {

            //gets transaction details
            const trx = await web3.eth.getTransaction(txHash)
    
            let isDone = false;
            
            //trys every five seconds to see if transaction is confirmed
            isDone = setTimeout(async () => {
    
            if(trx.blockNumber) {
                //turns off alert
                setAlert(false)
                setAlertType("danger")
                //getAccountTransactions()
                return true
            }
    
            //return await this.confirmTransaction(txHash)
            await confirmTransaction(txHash)
            return false
            },5*1000)
    
            
            if(isDone) {
            return true
            } 
        }
        */

        //first requires user to approve unlimited allowance

        
        //checks if user already has allowance
        const allowanceBalance = await readContract({
            address: token,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [address, CLOCKTOWERSUB_ADDRESS]
        })

        //console.log(allowanceBalance)
        
        if(BigInt(allowanceBalance) < 100000000000000000000000n) {
            //if allowance has dropped below 100,000 site requests infinite approval again
            await writeContract({
                address: token,
                abi: erc20ABI,
                functionName: 'approve',
                args: [CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL]
            })
        }

        //subscribes
        subscribeWrite.write()
    
        /*
        //subscribes to subscription
        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.subscribe(subscription).encodeABI()
        }

         //get metamask to sign transaction 
         try {
            await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            })
            .then (async (txhash) => {
                console.log(txhash)
                
                //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
                setAlertType("warning")
                setAlert(true)
                setAlertText("Transaction Pending...")
                 
                await confirmTransaction(txhash)

                //send to subscription page
                sendToSubDash()

            })

            return {
                status: "transaction cancelled!"
            };
            
            } catch (error) {
            return {
                status: error.message
            }
        } 
        */
    },[subscription])

    const sendToSubDash = useCallback(() => 
            navigate('/subscriberdash', {replace: true})
    ,[navigate])
    

   
    //checks that user has logged in 
    if(account == "-1") {
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
                        <ListGroup.Item>Provider:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {subscription.provider}</ListGroup.Item>
                        <ListGroup.Item>Amount: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{amount} {tickerName}</ListGroup.Item>
                        <ListGroup.Item>Frequency: &nbsp;&nbsp;{frequencyName}</ListGroup.Item>
                        <ListGroup.Item>Day Due: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subscription.dueDay}</ListGroup.Item>
                        <ListGroup.Item>Domain: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.domain}&nbsp;&nbsp;{isDomainVerified ? "VERIFIED" : ""}</ListGroup.Item>
                        <ListGroup.Item>URL: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.url}</ListGroup.Item>
                        <ListGroup.Item>Email: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.email}</ListGroup.Item>
                        <ListGroup.Item>Phone: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{details.phone}</ListGroup.Item>
                    </ListGroup>
                    {(!subscribed && !isProvider) ?
                    <Card.Body align="center">
                        {/*
                        <Button onClick={setInfiniteAllowance}>Approve</Button> 
                        */}
                        <Button onClick={subscribe}>Subscribe</Button>
                    </Card.Body>
                    : ""}
                    {(isProvider && !isDomainVerified && details.domain != "") ?
                    <>
                    <Card.Body align="center">
                        {/*
                        <Button onClick={setInfiniteAllowance}>Approve</Button> 
                         <Button onClick={signMessage}>Verify</Button>
                        */}
                        <Button onClick={async () => {
                            signMessage()
                           // handleShow()
                            }}>Verify Domain</Button>
                    </Card.Body>
                    <Modal show={show} size="xl" onHide={handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Verify Domain</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Create the following domain record: {signMessageData}</Modal.Body>
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
                </Card>
                </div>
            </div>
        )
    }
}

export default PublicSubscription