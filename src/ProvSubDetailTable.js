import React from 'react';
import {Button, Table} from 'react-bootstrap';
//import {LinkContainer} from 'react-router-bootstrap'
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, CLOCKTOKEN_ADDRESS, ZERO_ADDRESS} from "./config";
import Web3 from 'web3'

const ProvSubDetailTable = (props) => {

    const historyArray = props.historyArray

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < historyArray.length; i++) {
        
        let row = []
       
        let subAmount = Web3.utils.fromWei(historyArray[i].returnValues.amount)
  
        row.push(
            <td key={String(historyArray[i].returnValues.subscriber)+1}>{subscriptionArray[i].subscription.description}</td>,
            <td key={String(historyArray[i].returnValues.subscriber)+2}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(historyArray[i].returnValues.subscriber)+3}>{frequencyLookup(subscriptionArray[i].subscription.frequency)}</td>, 
            <td key={String(historyArray[i].returnValues.subscriber)+4}>{subscriptionArray[i].subscription.dueDay}</td>,
            )
          
        table.push(<tr align="center" key={String(subscriptionArray[i].subscription.id)}>{row}</tr>)
    
      }
  
      tableTop.push(
          <Table key="table" striped bordered hover size="sm" className="provTable">
            <thead key="tableHead">
              <tr key="headRow" align="center">
                <th key="eventHead">Event Type</th>
                <th key="dateHead">Timestamp</th>
                <th key="subHead">Subscriber</th>
                <th key="amountHead">Amount</th>
              </tr>
            </thead>
            <tbody key="tableBody">
              {table}
            </tbody>
          </Table>)
      
      return tableTop
}

export default ProvSubDetailTable