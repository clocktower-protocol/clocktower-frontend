import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button} from 'react-bootstrap';
import { useOutletContext, useParams, useNavigate} from "react-router-dom";
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, FREQUENCY_LOOKUP, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP, ZERO_ADDRESS} from "../config"; 

const PublicSubscription = () => {

    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id, f, d} = useParams();

    const [subscription, setSubscription] = useState("")
    const [idSub, setId] = useState(id)
    const [frequency, setFrequency] = useState(f)
    const [dueDay, setDueDay] = useState(d)
    const [amount, setAmount] = useState(0)
    const [frequencyName, setFrequencyName] = useState("Monthly")
    const [tickerName, setTickerName] = useState("CLOCK")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState(CLOCKTOKEN_ABI)
    const [alertType, setAlertType] = useState("danger")

    
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

        const getSub = async () => await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from: account})
        .then(function(result) {
            setSubscription(result)
            setAmount(Web3.utils.fromWei(result.amount))
            setFrequencyName(frequencyLookup(result.frequency))
            setTickerName(tickerLookup(result.token))
            setTokenABI(abiLookup(result.token)[1])
            setToken(result.token)
        })

        if(account != "-1"){
            getSub()
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

    //gets unlimited approval from user
    const setInfiniteAllowance = useCallback(async () => {
        let transactionParameters = {};
        console.log(tokenABI)
        //console.log(token)
        //const web3 = new Web3(node)
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
    }, [account, setAlert, setAlertText, token, tokenABI, ZERO_ADDRESS, CLOCKTOWERSUB_ADDRESS, INFINITE_APPROVAL, web3, setAlertType]
    )

    //handles subscription button click and navigation
    const subscribe = useCallback(async () => {

        //first requires user to approve unlimited allowance
        await setInfiniteAllowance()

        //subscribes to subscription
        /*
        const transactionParameters = {
            to: CLOCKTOWERSUB_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            data: clocktowersub.methods.createSubscription(amount,token,description,frequency, dueDay).encodeABI(),
        }
        */
        
    })

    //setId(id)

    /*
    //gets subscription
    const getSub = async () => {
        await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from: account})
        .then(function(result) {
            setSubscription(result)
            setAmount(Web3.utils.fromWei(result.amount))
            setFrequencyName(frequencyLookup(result.frequency))
            setTickerName(tickerLookup(result.token))
        })
    }
    

    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
        return TOKEN_LOOKUP.map((token) => {
          if(token.address == tokenAddress) {
            return token.ticker
          }
        });
    }
  
    //looks up frequency
    const frequencyLookup = (frequencyIndex) => {
        return FREQUENCY_LOOKUP.map((frequencyObject) => {
          if(frequencyIndex == frequencyObject.index) {
            return frequencyObject.name
          }
        })
    }
    */



    //formats subscription items
    
    /*
    const amount = Web3.utils.fromWei(subscription.amount)
    const frequencyName = frequencyLookup(subscription.frequency)
    const tickerName = tickerLookup(subscription.token)
    */
   // console.log(account)
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
                        {subscription.description}
                        </Card.Text>
                    </Card.Body>
                    <ListGroup className="list-group-flush">
                        <ListGroup.Item>Producer:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {subscription.provider}</ListGroup.Item>
                        <ListGroup.Item>Amount: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{amount} {tickerName}</ListGroup.Item>
                        <ListGroup.Item>Frequency: &nbsp;&nbsp;{frequencyName}</ListGroup.Item>
                        <ListGroup.Item>Day Due: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{subscription.dueDay}</ListGroup.Item>
                    </ListGroup>
                    <Card.Body align="center">
                        <Button onClick={subscribe}>Subscribe</Button>
                    </Card.Body>
                </Card>
                </div>
            </div>


        )
    }
}

export default PublicSubscription