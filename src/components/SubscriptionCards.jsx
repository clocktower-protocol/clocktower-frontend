import React from 'react';
import {Button, Card, Stack, ListGroup} from 'react-bootstrap';
import {Link, useNavigate} from "react-router";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP, DOMAIN} from "../config";
import {formatEther} from 'viem'
import Avatar from "boring-avatars"
import { v4 as uuidv4 } from 'uuid'


const SubscriptionCards = (props) => {

    const subscriptionArray = props.subscriptionArray

    const detailsArray = props.detailsArray

    const cards = []

    const navigate = useNavigate();

    //gets domain 
    const hostname = window.location.hostname

     //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }
   
    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
        return TOKEN_LOOKUP.find((token) => 
            token.address === tokenAddress
        )?.ticker || false;
    }
    /*
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
    */

  
    //looks up frequency
    /*
    const frequencyLookup = (frequencyIndex) => {
    return FREQUENCY_LOOKUP.map((frequencyObject) => {
        if(frequencyIndex === frequencyObject.index) {
        return frequencyObject.name2
        }
        return undefined
    }).join('')
    }
    */
    const frequencyLookup = (frequencyIndex) => {
        return FREQUENCY_LOOKUP.find((frequencyObject) => 
            frequencyIndex === frequencyObject.index
        )?.name2 || '';
    };

    //returns ending string for day value in English
    const dayEndString = (dayString) => {

        let firstDigit = 0

        //figures out digit length and captures first digit
        let stringArray =  dayString.split('')

        switch(stringArray.length){
            case 1:
            firstDigit = stringArray[0]
            break
    
            case 2:
            firstDigit = stringArray[1]
            break

            case 3:
            firstDigit = stringArray[2]
            break

            default:
            firstDigit = stringArray[0]
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

        let dueString = "Payday"

        //checks for cancelled subscriptions
        if(subscriptionArray[i].status < 1) {

            let totalSubscribers = 0;

            let urlDisplayed = props.detailsArray[i].url

            //if this is a link card
            if(props.isLink) {
                //Sets pay string depending on if this is a link or not
                dueString = "Due"
                //shortens url displayed if too long
                if(props.detailsArray[i].url.split("").length > 40) {
                    urlDisplayed = props.detailsArray[i].url.slice(0,40) + "..."
                }
            }

        
            if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
                totalSubscribers = subscriptionArray[i].totalSubscribers
            }

            let description = detailsArray[i]?.description || '---'

            //in abscence of description sets as "(No Description)"
            if(description === ""){
                description = "---"
            }

            //formats subscription amount
            let subAmount = formatEther(String(subscriptionArray[i].subscription.amount))

            //builds payday string
            let paydayString = ""

            //warning payday string
            let warnPaydayString = ""
            
            //checks if this is a weekday frequency or not
            if(subscriptionArray[i].subscription.frequency > 0){
                paydayString = dayEndString(String(subscriptionArray[i].subscription.dueDay)) + " Day of the " + frequencyLookup(subscriptionArray[i].subscription.frequency)
                warnPaydayString = "on the " + paydayString
            } else {
                //weekly
                let index = subscriptionArray[i].subscription.dueDay
                if(subscriptionArray[i].subscription.dueDay === 7){
                    index = 0
                }

                paydayString = "Every " + DAY_OF_WEEK_LOOKUP[index].name
                warnPaydayString = paydayString
                
            }

            //dynamic styling based on if its on the link page or not
            let textBarWidth = "300px"
            let titleBarWidth = "140px"
            let linkNamePadding = "0px"
            let cardWidth = "500px"
            let dynamicwidth1 = "33%"
            let dynamicwidth2 = "33%"
            //dynamic name padding
            if(props.isLink) {
                linkNamePadding = "78px"
                titleBarWidth = "125px"
                textBarWidth = "500px"
                cardWidth = "650px"
                dynamicwidth1 = "19%"
                dynamicwidth2 = "81%"
            }
            
            cards.push(
                <Card key={uuidv4()} style={{width: cardWidth, marginBottom:"20px"}}>
                    <Card.Body>
                        <Card.Title >
                            <div key={uuidv4()} style={{display: "flex", flexGrow: "1", flexBasis: "0", alignItems: "center", flexWrap: "wrap", width: "100%"}}>
                            <Avatar style={{display: "flex", justifyContent: "start", flexGrow: "1", width: dynamicwidth1}}
                                size={50}
                                name={subscriptionArray[i].subscription.id}
                                square={true}
                                variant="marble"
                                colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                            />
                            
                                <div key={uuidv4()} style={{display: "flex", justifyContent: "center", flexGrow: "1", paddingRight: linkNamePadding, width: dynamicwidth2}}>
                                    {description}
                                </div>
                                {props.isProvider && !props.isLink ?
                                <div key={uuidv4()} style={{display: "flex", flexDirection: "column", fontWeight: "normal", fontSize: "15px", justifyContent: "center", width: "34%"}}>
                                    
                                    {Number(totalSubscribers) > 0 ?
                                    <div key={uuidv4()} style={{display: "flex", justifyContent: "center"}}> 
                                    <Link to={`../subscribers/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.amount}/${tickerLookup(subscriptionArray[i].subscription.token)}/${subscriptionArray[i].subscription.provider}`}>{Number(totalSubscribers)}</Link>
                                    </div>
                                    : 
                                    <div key={uuidv4()} style={{display: "flex", justifyContent: "center", paddingBottom: "5px"}}> 
                                    {String(Number(totalSubscribers) * Number(subAmount))}
                                    </div>}
                                    <div key={uuidv4()} style={{display: "flex", justifyContent: "center", paddingBottom:"5px"}}>
                                    {" Subscribers"}
                                    </div>
                                </div>
                                : <div key={uuidv4()}></div>}
                            </div>
                        </Card.Title>

                        <hr key={uuidv4()}></hr>

                        <div key={uuidv4()} style={{display: "flex", justifyContent: "center"}}>
                        <Stack gap={1}>

                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}} >
                            <ListGroup.Item variant="info" style={{width: titleBarWidth, textAlign:"center", fontSize: "15px"}}>Amount</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{width: textBarWidth, textAlign:"center", fontSize: "15px"}}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</ListGroup.Item>
                        </ListGroup>

                    
                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}}>
                            <ListGroup.Item variant="info" style={{width: titleBarWidth, textAlign:"center", fontSize: "15px"}}>{dueString}</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{width: textBarWidth, textAlign:"center", fontSize: "15px"}}>{paydayString}</ListGroup.Item>
                        </ListGroup>

                        {props.isProvider && !props.isLink ?
                        <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                            <ListGroup.Item variant="info" style={{width: titleBarWidth, textAlign:"center", fontSize: "15px"}}>Pay Per Period</ListGroup.Item>
                            <ListGroup.Item variant="light" style={{display: "flex", alignItems: "center", justifyContent: "center", width: textBarWidth, textAlign:"center", fontSize: "15px", height: "100%"}}>{Number(totalSubscribers) * Number(subAmount)}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</ListGroup.Item>
                        </ListGroup>
                        : <></>}

                        {props.isLink ? 
                            <>
                                <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}}>
                                    <ListGroup.Item variant="info" style={{width: titleBarWidth, textAlign:"center", fontSize: "15px"}}>URL</ListGroup.Item>
                                    <ListGroup.Item variant="light" style={{width: textBarWidth, textAlign:"center", fontSize: "15px"}}><Link to={props.detailsArray[i].url}>{urlDisplayed}</Link></ListGroup.Item>
                                </ListGroup> 
                                <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}}>
                                    <ListGroup.Item variant="info" style={{width: titleBarWidth, textAlign:"center", fontSize: "15px"}}>Provider</ListGroup.Item>
                                    <ListGroup.Item variant="light" style={{width: textBarWidth, textAlign:"center", fontSize: "15px"}}><Link to={`../account/${subscriptionArray[i].subscription.provider}`}>{subscriptionArray[i].subscription.provider}</Link></ListGroup.Item>
                                </ListGroup> 
                            </>
                        : <></>
                        }

                        </Stack>
                        </div>

                        {props.isProvider && props.isLink ?
                            <></> :
                            <hr key={uuidv4()}></hr>
                        }
                        <div key={uuidv4()} style={{display: "flex", justifyContent: "space-evenly"}}>
                            {props.isProvider && !props.isLink ?
                            <>
                            <Button style ={{width: "100%"}} type="submit" variant="outline-secondary" onClick={() => navigate(`../history/${subscriptionArray[i].subscription.id}`)}>History</Button>
                            <Button style={{ width: "100%", padding: '5px' }} type="submit" variant="outline-secondary" onClick={() => props.setLinkDisplayed(`${DOMAIN}/#/public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`)}>Link</Button>
                            <Button style={{ width: "100%" }} type="submit" variant="outline-secondary" onClick={() => props.setEditSubParams({ id: subscriptionArray[i].subscription.id, f: subscriptionArray[i].subscription.frequency, d: subscriptionArray[i].subscription.dueDay })}>Edit</Button>
                            <Button style={{ width: "100%" }} type="submit" variant="outline-secondary" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button>
                            </>
                            : 
                            <>
                                {!props.isLink ?
                                
                                <>
                                    <Button style={{ width: "100%" }} type="submit" variant="outline-secondary" onClick={() => navigate(`../subscription/${subscriptionArray[i].subscription.id}`)}>History</Button>
                                    <Button style={{ width: "100%" }} type="submit" variant="outline-secondary" onClick={() => props.setUnsubscribedSub(subscriptionArray[i].subscription)}>Unsubscribe</Button>
                                </>
                                :
                                    <>
                                    {!props.isSubscribed && !props.isProvider ?    
                                        <>
                                            <Stack gap={3}>
                                            <Button style={{ width: "100%" }} type="submit" variant="outline-secondary" onClick={() => props.subscribe()}>Subscribe</Button>
                                            <ListGroup horizontal={'sm'} style={{display: "flex", justifyContent: "center"}} >
                                                <ListGroup.Item variant="light" style={{width: "100%", textAlign:"center", fontSize: "15px"}}>Clicking subscribe will charge your wallet {warnPaydayString.toLowerCase()}</ListGroup.Item>
                                            </ListGroup>
                                            </Stack>
                                        </>
                                    :
                                        <>
                                        </>
                                    }
                                    </>
                                }
                            </>
                            }
                        </div>
                        
                    </Card.Body>
                </Card>
            );
        }
    }

    return (
        <div>{cards}</div>
    )
}

export default SubscriptionCards