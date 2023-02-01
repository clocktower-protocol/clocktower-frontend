import React, {useEffect, useState} from 'react'
import {Alert, Card, ListGroup} from 'react-bootstrap';
import { useOutletContext, useParams} from "react-router-dom";
import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 

const PublicSubscription = () => {

    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    let {id, f, d} = useParams();

    const [subscription, setSubscription] = useState()
    const [idSub, setId] = useState(id)
    const [frequency, setFrequency] = useState(f)
    const [dueDay, setDueDay] = useState(d)

    //loads provider subscription list upon login
    useEffect(() => {
        getSub()
        console.log(idSub)
    }, [id]);

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    //gets subscription
    const getSub = async () => {
        await clocktowersub.methods.getSubByIndex(idSub, frequency, dueDay).call({from: account})
        .then(function(result) {
            setSubscription(result)
        })
    }    


    //checks that user has logged in 
    if(account == "-1") {
        return (
            <Alert align="center" variant="info">Please Login to Subscribe</Alert>
        )
    } else {
        return (
            <Card style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title align="center">Card Title</Card.Title>
                    <Card.Text>
                    Some quick example text to build on the card title and make up the
                    bulk of the card's content.
                    </Card.Text>
                </Card.Body>
                <ListGroup className="list-group-flush">
                    <ListGroup.Item>Cras justo odio</ListGroup.Item>
                    <ListGroup.Item>Dapibus ac facilisis in</ListGroup.Item>
                    <ListGroup.Item>Vestibulum at eros</ListGroup.Item>
                </ListGroup>
                <Card.Body>
                    <Card.Link href="#">Card Link</Card.Link>
                    <Card.Link href="#">Another Link</Card.Link>
                </Card.Body>
            </Card>
        )
    }
}

export default PublicSubscription