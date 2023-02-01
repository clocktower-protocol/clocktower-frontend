import React, {useEffect, useState, useCallback} from 'react'
import {Alert, Card, ListGroup, Button} from 'react-bootstrap';
import { useOutletContext, useParams} from "react-router-dom";
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, FREQUENCY_LOOKUP, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 

const PublicSubscription = () => {

    const [account] = useOutletContext();

    let {id, f, d} = useParams();

    const [subscription, setSubscription] = useState("")
    const [idSub, setId] = useState(id)
    const [frequency, setFrequency] = useState(f)
    const [dueDay, setDueDay] = useState(d)
    const [amount, setAmount] = useState(0)
    const [frequencyName, setFrequencyName] = useState("Monthly")
    const [tickerName, setTickerName] = useState("CLOCK")

    
    //loads provider subscription list upon receiving parameter
    useEffect(() => {
        //looks up ticker for token
        const tickerLookup = (tokenAddress) => {
            return TOKEN_LOOKUP.map((token) => {
            if(token.address == tokenAddress) {
                return token.ticker
            }
            })
         }
  
        //looks up frequency
        const frequencyLookup = (frequencyIndex) => {
            return FREQUENCY_LOOKUP.map((frequencyObject) => {
            if(frequencyIndex == frequencyObject.index) {
                return frequencyObject.name
            }
            })
        }

        const getSub = async () => await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from: account})
        .then(function(result) {
            setSubscription(result)
            setAmount(Web3.utils.fromWei(result.amount))
            setFrequencyName(frequencyLookup(result.frequency))
            setTickerName(tickerLookup(result.token))
        })

        getSub()

    }, []);
    
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

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

    //checks that user has logged in 
    if(account == "-1") {
        return (
            <Alert align="center" variant="info">Please Login to Subscribe</Alert>
        )
    } else {
        return (
            <Card style={{ width: '35rem' }}>
                <Card.Body>
                    <Card.Title align="center">Subscription</Card.Title>
                    <Card.Text>
                    {subscription.description}
                    </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item>Producer: {subscription.provider}</ListGroup.Item>
                    <ListGroup.Item>Amount: {amount} {tickerName}</ListGroup.Item>
                    <ListGroup.Item>Frequency: {frequencyName}</ListGroup.Item>
                    <ListGroup.Item>Day Due: {subscription.dueDay}</ListGroup.Item>
                </ListGroup>
                <Card.Body align="center">
                    <Button>Subscribe</Button>
                </Card.Body>
            </Card>
        )
    }
}

export default PublicSubscription