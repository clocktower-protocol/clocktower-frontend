import React from 'react';
import {Table} from 'react-bootstrap';
import Web3 from 'web3'
import { SUBEVENT_LOOKUP } from './config';
import dayjs from 'dayjs'

const ProvSubDetailTable = (props) => {

    const historyArray = props.historyArray

    let table = []
    let tableTop = []

  if(historyArray.length > 0 && typeof historyArray[0].returnValues !== "undefined") {
    //loops through array to create table rows
    for(let i = 0; i < historyArray.length; i++) {
        
        let row = []
       
        let subAmount = Web3.utils.fromWei(historyArray[i].returnValues.amount)
        let formatDate = dayjs.unix(historyArray[i].returnValues.timestamp).format('MM/DD/YYYY h:mm:s A')

        //console.log(subAmount)
  
        row.push(
            <td key={String(historyArray[i].returnValues.subscriber)+1}>{historyArray[i].returnValues.subscriber}</td>, 
            <td key={String(historyArray[i].returnValues.subEvent)+2}>{SUBEVENT_LOOKUP[historyArray[i].returnValues.subEvent]}</td>,
            <td key={String(historyArray[i].returnValues.timestamp)+3}>{formatDate}</td>,
            <td key={String(subAmount)+4}>{subAmount}&nbsp;&nbsp;</td>,
            )
          
        table.push(<tr align="center" key={String(historyArray[i].returnValues.subscriber)+i}>{row}</tr>)
    
      }
  
      tableTop.push(
          <Table key="table" striped bordered hover size="sm" className="provTable">
            <thead key="tableHead">
              <tr key="headRow" align="center">
                <th key="subHead">Subscriber</th>
                <th key="eventHead">Event Type</th>
                <th key="dateHead">Timestamp</th>
                <th key="amountHead">Amount</th>
              </tr>
            </thead>
            <tbody key="tableBody">
              {table}
            </tbody>
          </Table>)
      
      return tableTop
  }
}

export default ProvSubDetailTable