import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP, DOMAIN} from "../config";
import {formatEther} from 'viem'
import Avatar from "boring-avatars"
import { v4 as uuidv4 } from 'uuid'
import styles from '../css/clocktower.module.css';

const SubscriptionsTable = (props) => {

    /* Role numbers

    0 == Admin
    1 == Provider
    2 == Subscriber

    */
    

    const subscriptionArray = props.subscriptionArray

    const detailsArray = props.detailsArray

    let bySubscriber = true
    const role = props.role

    let isAdmin = false

    role === 0 ? isAdmin = true : isAdmin = false
    
    //sets which view for admin
    if(role === 0) {
      bySubscriber = props.bySubscriber
    }

    /*
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
    */
    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
        return TOKEN_LOOKUP.find((token) => 
            token.address === tokenAddress
        )?.ticker || false;
    }

    /*
    //looks up frequency
    const frequencyLookup = (frequencyIndex) => {
      return FREQUENCY_LOOKUP.map((frequencyObject) => {
        if(frequencyIndex === frequencyObject.index) {
          return frequencyObject.name
        }
        return false
      })
    }
    */

    const frequencyLookup = (frequencyIndex) => {
        return FREQUENCY_LOOKUP.find((frequencyObject) => 
            frequencyIndex === frequencyObject.index
        )?.name2 || '';
    };

     //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscriptionArray.length; i++) {
     
      //doesn't show cancelled or unsubscribed transactions
      if(subscriptionArray[i].status < 1 || isAdmin) {
        let row = []
        let totalSubscribers = 0;
        if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
          totalSubscribers = subscriptionArray[i].totalSubscribers
        }

        let dueDay = subscriptionArray[i].subscription.dueDay
        //changes weekday number to weekday name
        if(subscriptionArray[i].subscription.frequency === 0) {

          let index = subscriptionArray[i].subscription.dueDay
          if(subscriptionArray[i].subscription.dueDay === 7){
              index = 0
          }

          dueDay = DAY_OF_WEEK_LOOKUP[index].name
        }

        let subAmount = formatEther(String(subscriptionArray[i].subscription.amount))

        if(role === 0) {
          row.push(
            <td key={uuidv4()}>{subscriptionArray[i].subscription.id.slice(0,8) + "..."}</td>
          )
        }

        row.push(
            <td key={uuidv4()}>{ 
            <Avatar
              size={50}
              name={subscriptionArray[i].subscription.id}
              square={true}
              variant="marble"
              colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
            />
            }</td>,
            <td key={uuidv4()} className={styles.tablecell}>{detailsArray[i].description}</td>,
            <td key={uuidv4()}>{subAmount + " " + tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={uuidv4()}>{frequencyLookup(subscriptionArray[i].subscription.frequency)}</td>, 
            <td key={uuidv4()}>{dueDay}</td>,
        )
        if(role === 0 && bySubscriber) {
          row.push(
            <td key={uuidv4()}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={uuidv4()}>{Number(formatEther(String(props.feeObjects[i].feeBalance))).toFixed(4)}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={uuidv4()}>{Math.floor(props.feeObjects[i].remainingCycles)}</td>,
          )
        }
        if(role === 0 && !bySubscriber) {
          row.push(
            <td key={uuidv4()}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={uuidv4()}>{Number(totalSubscribers)}</td>,
            <td key={uuidv4()}>{Number(totalSubscribers) * Number(subAmount)}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>
          )
        }
        if(role === 1 && Number(totalSubscribers) > 0) {
            row.push(
            //<td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setLinkDisplayed(`${DOMAIN}/#/public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`)}>Link</Button></td>,
            <td key={uuidv4()}><Link to={`../subscribers/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.amount}/${tickerLookup(subscriptionArray[i].subscription.token)}/${subscriptionArray[i].subscription.provider}`}>{Number(totalSubscribers)}</Link></td>,
            <td key={uuidv4()}>{Number(totalSubscribers) * Number(subAmount)}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={uuidv4()}><Link to={`../history/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
            <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setEditSubParams({id: subscriptionArray[i].subscription.id, f: subscriptionArray[i].subscription.frequency, d: subscriptionArray[i].subscription.dueDay})}>Edit</Button></td>,
            //<td key={String(subscriptionArray[i].subscription.id)+9}><Link to={`../editdetails/${subscriptionArray[i].subscription.id}`}>Edit</Link></td>,
            <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button></td>
            )
        }
        if(role === 1 && Number(totalSubscribers) === 0) {
          row.push(
            //<td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setLinkDisplayed(`${process.env.DOMAIN}/#/public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`)}>Link</Button></td>,
            <td key={uuidv4()}>{Number(totalSubscribers)}</td>,
            <td key={uuidv4()}>{Number(totalSubscribers) * Number(subAmount)}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={uuidv4()}><Link to={`../history/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
            <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setEditSubParams({id: subscriptionArray[i].subscription.id, f: subscriptionArray[i].subscription.frequency, d: subscriptionArray[i].subscription.dueDay})}>Edit</Button></td>,
            //<td key={String(subscriptionArray[i].subscription.id)+9}><Link to={`../editdetails/${subscriptionArray[i].subscription.id}`}>Edit</Link></td>,
            <td key={uuidv4()}><Button type="submit"  variant="outline-info" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button></td>
            )
        }

        if(role === 2) {
          row.push(
          <td key={uuidv4()}><Link to={`../subscription/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
          <td key={uuidv4()}><Button type="submit" variant="outline-info" onClick={() => props.setUnsubscribedSub(subscriptionArray[i].subscription)}>Unsubscribe</Button></td>
          )
      }
        
          
        
        table.push(<tr align="center" className={styles.tablerow} key={String(subscriptionArray[i].subscription.id)}>{row}</tr>)
      }
    }

    tableTop.push(
        <Table key={uuidv4()} striped bordered hover size="sm" >
          <thead key={uuidv4()}>
            <tr key={uuidv4()} align="center">
                {isAdmin
                ? <th key={uuidv4()}>ID</th> : ""
                }
                <th key={uuidv4()}></th>
                <th key={uuidv4()}>Description</th>
                <th key={uuidv4()}>Amount</th>
                <th key={uuidv4()}>Frequency</th>
                <th key={uuidv4()}>Due Day</th>
                {role === 1 || role === 0
                ? <th key={uuidv4()}>Link</th> : ""
                }
                {role === 1 || (role === 0 && !bySubscriber)
                ? <th key={uuidv4()}>Subscribers</th> : ""
                }
                {role === 1 || (role === 0 && !bySubscriber)
                ? <th key={uuidv4()}>Pay per Period</th> : ""
                }
                {isAdmin && bySubscriber
                ? <th key={uuidv4()}>Fee Balance</th> : ""
                }
                {isAdmin && bySubscriber
                ? <th key={uuidv4()}>Remaining Cycles</th> : ""
                }
                {!isAdmin  
                ?  <th key={uuidv4()}>History</th> : ""
                }
                {role === 1 
                ?   <th key={uuidv4()}>Edit Details</th> : ""
                }  
                {role === 1 
                ?   <th key={uuidv4()}>Cancel</th> : ""
                }   
                {role === 2
                ?   <th key={uuidv4()}>Unsubscribe</th> : ""
                } 
            </tr>
          </thead>
          <tbody key={uuidv4()}>
            {table}
          </tbody>
        </Table>)
    
    return tableTop


}

export default SubscriptionsTable