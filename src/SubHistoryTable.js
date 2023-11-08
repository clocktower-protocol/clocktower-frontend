import React from 'react';
import {Table} from 'react-bootstrap';
import Web3 from 'web3'
import { SUBEVENT_LOOKUP } from './config';
import dayjs from 'dayjs'
import {TOKEN_LOOKUP} from "./config";

const SubHistoryTable = (props) => {

    const historyArray = props.historyArray

    //looks up ticker for token
    const tickerLookup = (tokenAddress) => {
      //return TOKEN_LOOKUP.map((token) => {
      let tokenArray =  TOKEN_LOOKUP.map((token) => {
        if(token.address === tokenAddress) {
          return token.ticker
        } 
        return false
      });

      for(const ticker of tokenArray) {
        if(ticker != false) {
          return ticker
        }
      }
    }

    let table = []
    let tableTop = []

  if(historyArray.length > 0 && typeof historyArray[0].returnValues !== "undefined") {
    //loops through array to create table rows
    for(let i = 0; i < historyArray.length; i++) {
        
        let row = []
       
        let subAmount = Web3.utils.fromWei(historyArray[i].returnValues.amount)
        let formatDate = dayjs.unix(historyArray[i].returnValues.timestamp).format('MM/DD/YYYY h:mm:s A')
        let ticker = tickerLookup(historyArray[i].returnValues.token)

        //console.log(subAmount)
  
        row.push(
            <td key={String(historyArray[i].returnValues.subscriber)+1}>{historyArray[i].returnValues.subscriber}</td>, 
            <td key={String(historyArray[i].returnValues.subEvent)+2}>{SUBEVENT_LOOKUP[historyArray[i].returnValues.subEvent]}</td>,
            <td key={String(historyArray[i].returnValues.timestamp)+3}>{formatDate}</td>,
            <td key={String(subAmount)+4}>{Number(subAmount).toFixed(2)}&nbsp;&nbsp;{ticker}</td>,
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

export default SubHistoryTable