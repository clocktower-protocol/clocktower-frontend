import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP} from "./config";
import Web3 from 'web3'

const SubscriptionsTable = (props) => {

    /* Role numbers

    0 == Admin
    1 == Provider
    2 == Subscriber

    */
    

    const subscriptionArray = props.subscriptionArray
    //const isAdmin = props.isAdmin
    const role = props.role

    let isAdmin = false

    role == 0 ? isAdmin = true : isAdmin = false
    

    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
      return TOKEN_LOOKUP.map((token) => {
        if(token.address === tokenAddress) {
          return token.ticker
        }
        return false
      });
    }

    //looks up frequency
    const frequencyLookup = (frequencyIndex) => {
      return FREQUENCY_LOOKUP.map((frequencyObject) => {
        if(frequencyIndex === String(frequencyObject.index)) {
          return frequencyObject.name
        }
        return false
      })
    }

     //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscriptionArray.length; i++) {
     // console.log(subscriptionArray[i].status)
      //doesn't show cancelled transactions
      if(subscriptionArray[i].status !== 1 || isAdmin) {
        let row = []
        let totalSubscribers = 0;
        if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
          totalSubscribers = subscriptionArray[i].totalSubscribers
        }
        let subAmount = Web3.utils.fromWei(subscriptionArray[i].subscription.amount)

       // console.log(subscriptionArray[i].subscription.frequency)

        row.push(
            <td key={String(subscriptionArray[i].subscription.id)+1}>{subscriptionArray[i].subscription.description}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+2}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+3}>{frequencyLookup(subscriptionArray[i].subscription.frequency)}</td>, 
            <td key={String(subscriptionArray[i].subscription.id)+4}>{subscriptionArray[i].subscription.dueDay}</td>,
        )
        if(role == 0) {
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}>{totalSubscribers}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>
          )
        }
        if(role == 1) {
            row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}>{totalSubscribers}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+8}><Link to={`subscription/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+9}><Button type="submit" onClick={() => props.cancelSubscription(subscriptionArray[i].subscription)}>Cancel</Button></td>
            )
        }
        if(role == 2) {
          row.push(
          <td key={String(subscriptionArray[i].subscription.id)+6}><Link to={`subscription/${subscriptionArray[i].subscription.id}/${props.account}`}>History</Link></td>,
          <td key={String(subscriptionArray[i].subscription.id)+7}><Button type="submit" onClick={() => props.unsubscribe(subscriptionArray[i].subscription)}>Unsubscribe</Button></td>
          )
      }
        
          
        
        table.push(<tr align="center" key={String(subscriptionArray[i].subscription.id)}>{row}</tr>)
      }
    }

    tableTop.push(
        <Table key="table" striped bordered hover size="sm" className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
                <th key="descriptionHead">Description</th>
                <th key="dateHead">Amount</th>
                <th key="amountHead">Frequency</th>
                <th key="statusHead">Due Day</th>
                {role == 1 || role == 0
                ? <th key="urlHead">URL</th> : ""
                }
                {role == 1 || role == 0
                ? <th key="totalSubs">Subscribers</th> : ""
                }
                {role == 1 || role == 0
                ? <th key="incomeHead">Income per Period</th> : ""
                }
                {!isAdmin  
                ?  <th key="detailsHead">History</th> : ""
                }
                {role == 1 
                ?   <th key="cancelProvHead">Cancel</th> : ""
                }   
                {role == 2
                ?   <th key="unsubscribeHead">Unsubscribe</th> : ""
                } 
            </tr>
          </thead>
          <tbody key="tableBody">
            {table}
          </tbody>
        </Table>)
    
    return tableTop


}

export default SubscriptionsTable