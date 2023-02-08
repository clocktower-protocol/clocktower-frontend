import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
//import {TOKEN_LOOKUP, FREQUENCY_LOOKUP} from "./config";
import Web3 from 'web3'

const ProvidersTable = (props) => {

    const providersArray = props.allProviders

       //checks for empty array
       if(!Array.isArray(providersArray) || (providersArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    console.log(providersArray.length)

    //loops through array to create table rows
    for(let i = 0; i < providersArray.length; i++) {
     // console.log(subscriptionArray[i].status)
      //doesn't show cancelled transactions
     // if(subscriptionArray[i].status !== 1) {
        let row = []
       // let totalSubscribers = 0;
       /*
        if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
          totalSubscribers = subscriptionArray[i].totalSubscribers
        }
        */
        //let subAmount = Web3.utils.fromWei(subscriptionArray[i].subscription.amount)

       // console.log(subscriptionArray[i].subscription.frequency)

        row.push(
          <td key={String(providersArray[i])+1}>{providersArray[i].accountAddress}</td>,
          <td key={String(providersArray[i])+2}>Subscriptions</td>
        )     
        table.push(<tr align="center" key={String(providersArray[i])}>{row}</tr>)
      }
   // }

    tableTop.push(
        <Table key="table" striped bordered hover size="sm" className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
              <th key="provAddressHead">Provider</th>
              <th key="subsHead">Subscriptions</th>
            </tr>
          </thead>
          <tbody key="tableBody">
            {table}
          </tbody>
        </Table>)
    
    return tableTop


}

export default ProvidersTable