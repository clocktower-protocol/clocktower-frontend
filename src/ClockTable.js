import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {TOKEN_LOOKUP} from "./config";
import Web3 from 'web3'
import dayjs from 'dayjs'

const ClockTable = (props) => {

    const transactionArray = props.transactionArray

    //checks for empty array
    if(!Array.isArray(transactionArray) || (transactionArray.length <= 0)) {
     
        return
      }
   
      let table = [];
      let tableTop = []
  
      //loops through array to create table rows
      for(let i = 0; i < transactionArray.length; i++) {
       // console.log(transactionArray[i].cancelled)
        //doesn't show cancelled transactions
        if(!transactionArray[i].cancelled) {
          let row = []
          row.push(
            <td key={String(transactionArray[i].id)+1}>{transactionArray[i].receiver}</td>,
            <td key={String(transactionArray[i].id)+2}>{dayjs.unix(transactionArray[i].timeTrigger).format('MM/DD/YYYY HH:00')}</td>,
            <td key={String(transactionArray[i].id)+3}>{Web3.utils.fromWei(transactionArray[i].payload)} {TOKEN_LOOKUP[transactionArray[i].token]}</td>, 
            <td key={String(transactionArray[i].id)+4}>{(transactionArray[i].sent ? "Sent" : "Ready")}</td>,
            <td key={String(transactionArray[i].id)+5}><Button type="submit" onClick={() => props.cancelTransaction(transactionArray[i])}>Cancel</Button></td>)
          table.push(<tr align="center" key={String(transactionArray[i].id)}>{row}</tr>)
        }
      }

    tableTop.push(
        <Table key="table" striped bordered hover size="sm" className="clockTable">
        <thead key="tableHead">
          <tr key="headRow" align="center">
            <th key="receiverHead">Receiver</th>
            <th key="dateHead">Date</th>
            <th key="amountHead">Amount</th>
            <th key="statusHead">Status</th>
            <th key="cancelHead">Cancel</th>
          </tr>
        </thead>
        <tbody key="tableBody">
           {table}
        </tbody>
        

        </Table>)
  
      return tableTop

}

export default ClockTable