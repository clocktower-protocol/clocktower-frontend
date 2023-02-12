import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP} from "./config";
import Web3 from 'web3'

const SubscriptionsTable = (props) => {

    const subscriptionArray = props.subscriptionArray
    const isAdmin = props.isAdmin

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
            <td key={String(subscriptionArray[i].subscription.id)+5}>{totalSubscribers}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
        )
        if(!isAdmin) {
            row.push(
            <td key={String(subscriptionArray[i].subscription.id)+8}><Link to={`subscription/${subscriptionArray[i].subscription.id}`}>Details</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+9}><Button type="submit" onClick={() => props.cancelSubscription(subscriptionArray[i].subscription)}>Cancel</Button></td>
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
                <th key="totalSubs">Subscribers</th>
                <th key="incomeHead">Income per Period</th>
                <th key="urlHead">URL</th>
                {!isAdmin  
                ?  <th key="detailsHead">Details</th> : ""
                }
                {!isAdmin  
                ?   <th key="cancelProvHead">Cancel</th> : ""
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