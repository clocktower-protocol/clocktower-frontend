import React from 'react';
import {Button, Table} from 'react-bootstrap';
//import {LinkContainer} from 'react-router-bootstrap'
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, CLOCKTOKEN_ADDRESS, ZERO_ADDRESS, CLOCKTOWERSUB_ADDRESS} from "./config";
import Web3 from 'web3'

const SubsTable = (props) => {

    const subscriptionArray = props.subscriptionArray

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
  
    //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }
  
    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscriptionArray.length; i++) {
        console.log(subscriptionArray[i].status)
        //doesn't show cancelled or unsubscribed transactions
        if(subscriptionArray[i].status == 0) {
          let row = []
          let totalSubscribers = 0;
          if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
            totalSubscribers = subscriptionArray[i].totalSubscribers
          }
          let subAmount = Web3.utils.fromWei(subscriptionArray[i].subscription.amount)
  
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+1}>{subscriptionArray[i].subscription.description}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+2}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+3}>{frequencyLookup(subscriptionArray[i].subscription.frequency)}</td>, 
            <td key={String(subscriptionArray[i].subscription.id)+4}>{subscriptionArray[i].subscription.dueDay}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}><Link to={`subscription/${subscriptionArray[i].subscription.id}`}>Details</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}><Button type="submit" onClick={() => props.unsubscribe(subscriptionArray[i].subscription)}>Unsubscribe</Button></td>)
          
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
                <th key="detailsHead">Details</th>
                <th key="cancelProvHead">Unsubscribe</th>
              </tr>
            </thead>
            <tbody key="tableBody">
              {table}
            </tbody>
          </Table>)
      
      return tableTop
  
}

export default SubsTable