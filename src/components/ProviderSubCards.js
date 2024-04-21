import React from 'react';
import {Button, Table, Card, Stack, Col, Row, ListGroup} from 'react-bootstrap';
import {Link, useNavigate} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP, DOMAIN} from "../config";
//import Web3 from 'web3'
import {formatEther} from 'viem'
import Avatar from "boring-avatars"
//import dayjs from 'dayjs'
//import advancedFormat from 'dayjs/plugin/advancedFormat'

//dayjs.extend(advancedFormat)

const ProviderSubCards = (props) => {

    const subscriptionArray = props.subscriptionArray

    const detailsArray = props.detailsArray

    const cards = []

    const navigate = useNavigate();

     //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }
   
    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
    let tokenArray =  TOKEN_LOOKUP.map((token) => {
        if(token.address === tokenAddress) {
        return token.ticker
        } 
        return false
    });

    for(const ticker of tokenArray) {
        if(ticker !== false) {
        return ticker
        }
    }
    }
  
    //looks up frequency
    const frequencyLookup = (frequencyIndex) => {
    return FREQUENCY_LOOKUP.map((frequencyObject) => {
        if(frequencyIndex === frequencyObject.index) {
        return frequencyObject.name2
        }
       // return false
    }).join('')
    }

    //returns ending string for day value in English
    const dayEndString = (dayString) => {

        let firstDigit = 0

        //figures out digit length and captures first digit
        let stringArray =  dayString.split('')

        switch(stringArray.length){
            case 1:
            firstDigit = stringArray[0]
    
            case 2:
            firstDigit = stringArray[1]

            case 3:
            firstDigit = stringArray[2]
        }

        //makes exclusion for 11,12 and 13 which need "th" ending
        if(dayString !== "11" && dayString !== "12" && dayString !== "13"){

            //checks first digit
            switch(firstDigit){
                case '1':
                return dayString + "st"

                case '2':
                return dayString + "nd"

                case '3':
                return dayString + "rd"
                
                default:
                return dayString + "th"
            }

        } else {
            return dayString + "th"
        }
    }
   
    //loops through subscription and creates cards
    for (let i = 0; i < subscriptionArray.length; i++) {

        //checks for cancelled subscriptions
        if(subscriptionArray[i].status < 1) {

            let totalSubscribers = 0;
        
            if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
                totalSubscribers = subscriptionArray[i].totalSubscribers
            }

            let description = detailsArray[i].description

            //in abscence of description sets as "(No Description)"
            if(typeof description !== undefined && description === ""){
                description = "(No Description)"
            }

            //formats subscription amount
            let subAmount = formatEther(String(subscriptionArray[i].subscription.amount))

            //builds payday string
            let paydayString = ""
            
            //checks if this is a weekday frequency or not
            if(subscriptionArray[i].subscription.frequency > 0){
                paydayString = dayEndString(String(subscriptionArray[i].subscription.dueDay)) + " Day of the " + frequencyLookup(subscriptionArray[i].subscription.frequency)
            } else {
                //TODO: need to test
                let index = subscriptionArray[i].subscription.dueDay
                if(subscriptionArray[i].subscription.dueDay === 7){
                    index = 0
                }

                paydayString = "Every " + DAY_OF_WEEK_LOOKUP[index].name
                console.log(subscriptionArray[i].subscription.dueDay)
            }
            
            cards.push(
                <Card style={{width:"500px"}}>
                    <Card.Body>
                        <Card.Title >
                            <div key={i+1} style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap"}}>
                            <Avatar
                                size={50}
                                name={subscriptionArray[i].subscription.id}
                                square={true}
                                variant="marble"
                                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                            />
                            
                                <div key={(i+1)*2}>
                                    {description}
                                </div>
                                <div key={(i+1)*3} style={{display: "flex", flexDirection: "column", fontWeight: "normal", fontSize: "15px"}}>
                                    
                                    {Number(totalSubscribers) > 0 ?
                                    <div key={(i+1)*4} style={{display: "flex", justifyContent: "center", paddingBottom:"5px"}}> 
                                    <Link to={`../subscribers/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.amount}/${tickerLookup(subscriptionArray[i].subscription.token)}/${subscriptionArray[i].subscription.provider}`}>{Number(totalSubscribers)}</Link>
                                    </div>
                                    : 
                                    <div key={(i+1)*4} style={{display: "flex", justifyContent: "center", paddingBottom:"5px"}}> 
                                    {String(Number(totalSubscribers) * Number(subAmount))}
                                    </div>}
                                    <div key={(i+1)*5}>
                                    {" Subscribers"}
                                    </div>
                                </div>
                            </div>
                        </Card.Title>

                        <hr key={(i+1)*6}></hr>

                        <div key={(i+1)*7} style={{display: "flex", justifyContent: "center"}}>
                        <Stack gap={1}>

                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}} >
                            <ListGroup.Item variant="info" style={{width:"140px", textAlign:"center", fontSize: "15px"}}>Amount</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{width:"300px", textAlign:"center", fontSize: "15px"}}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</ListGroup.Item>
                        </ListGroup>

                    
                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}}>
                            <ListGroup.Item variant="info" style={{width:"140px", textAlign:"center", fontSize: "15px"}}>Payday</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{width:"300px", textAlign:"center", fontSize: "15px"}}>{paydayString}</ListGroup.Item>
                        </ListGroup>

                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}}>
                            <ListGroup.Item variant="info" style={{width:"140px", textAlign:"center", fontSize: "15px"}}>Pay Per Period</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{width:"300px", textAlign:"center", fontSize: "15px"}}>{Number(totalSubscribers) * Number(subAmount)}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</ListGroup.Item>
                        </ListGroup>

                        </Stack>
                        </div>

                        <hr key={(i+1)*8}></hr>

                        <div key={(i+1)*9} style={{display: "flex", justifyContent: "space-evenly"}}>
                            <Button style ={{width: "100%"}} type="submit" variant="outline-secondary" onClick={() => navigate(`../history/${subscriptionArray[i].subscription.id}`)}>History</Button>
                            <Button style ={{width: "100%", padding:'5px'}} type="submit" variant="outline-secondary" onClick={() => props.setLinkDisplayed(`${DOMAIN}/public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`)}>Link</Button>
                            <Button style ={{width: "100%"}} type="submit" variant="outline-secondary" onClick={() => props.setEditSubParams({id: subscriptionArray[i].subscription.id, f: subscriptionArray[i].subscription.frequency, d: subscriptionArray[i].subscription.dueDay})}>Edit</Button>
                            <Button style ={{width: "100%"}} type="submit" variant="outline-secondary" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button>
                        </div>
                        
                    </Card.Body>
                </Card>
            );
        }
    }

    return (
        <div key={"cards"}>{cards}</div>
    )
}

export default ProviderSubCards