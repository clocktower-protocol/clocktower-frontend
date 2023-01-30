import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP, CLOCKTOKEN_ADDRESS, ZERO_ADDRESS} from "./config";
import Web3 from 'web3'

const ProviderSubsTable = (props) => {

    const subscriptionArray = props.subscriptionArray

     //checks for empty array
    if(!Array.isArray(subscriptionArray) || (subscriptionArray.length <= 0)) {
        return
    }

    let table = [];
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscriptionArray.length; i++) {
     // console.log(transactionArray[i].cancelled)
      //doesn't show cancelled transactions
      if(subscriptionArray[i].status != 1) {
        let row = []
        row.push(
          <td key={String(subscriptionArray[i].subscription.id)+1}>{subscriptionArray[i].subscription.description}</td>,
          <td key={String(subscriptionArray[i].subscription.id)+2}>{Web3.utils.fromWei(subscriptionArray[i].subscription.amount)} {TOKEN_LOOKUP[subscriptionArray[i].subscription.token]}</td>,
          <td key={String(subscriptionArray[i].subscription.id)+3}>{FREQUENCY_LOOKUP[subscriptionArray[i].subscription.frequency]}</td>, 
          <td key={String(subscriptionArray[i].subscription.id)+4}>{(subscriptionArray[i].subscription.dueDay)}</td>)
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
          </tr>
        </thead>
        <tbody key="tableBody">
           {table}
        </tbody>
        

        </Table>)

}

export default ProviderSubsTable