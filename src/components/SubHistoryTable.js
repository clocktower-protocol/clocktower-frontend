import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs'
import {TOKEN_LOOKUP} from "../config";
import {formatEther} from 'viem'
import styles from '../css/clocktower.module.css';

const SubHistoryTable = (props) => {

    const historyArray = props.historyArray

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
    const tickerLookup = (tokenAddress) => {
      const matchingToken = TOKEN_LOOKUP.find((token) => 
          token.address === tokenAddress
      );
      return matchingToken ? matchingToken.ticker : false;
    };

    let table = []
    let tableTop = []

  if(historyArray.length > 0 && typeof historyArray[0].args !== "undefined") {
    //loops through array to create table rows
    for(let i = 0; i < historyArray.length; i++) {
        
        let row = []
       
        //convert amount to human readable
       // let eighteenDecimalAmount = historyArray[i].args.amount / (10n ** 6n)

        let subAmount = -1        

        /*
        if(historyArray[i].args.subscriptevent === 2 || historyArray[i].args.subscriptevent === 5) {
          subAmount = eighteenDecimalAmount
          //console.log(historyArray[i].args.amount)
          //console.log(subAmount)
          console.log(eighteenDecimalAmount)
        } else {
        */
          subAmount = formatEther(historyArray[i].args.amount)
          //console.log(subAmount)
        //}
        //let subAmount = formatEther(eighteenDecimalAmount)
        let formatDate = dayjs.unix(historyArray[i].args.timestamp).format('MM/DD/YYYY h:mm:ss A')
        let ticker = tickerLookup(historyArray[i].args.token)
  
        row.push(
            <td key={String(historyArray[i].args.subscriber)+1}>{historyArray[i].args.subscriber !== "0x0000000000000000000000000000000000000000" ? <Link to={`../account/${historyArray[i].args.subscriber}`}>{historyArray[i].args.subscriber}</Link> : "N/A" }</td>, 
            <td key={String(historyArray[i].args.subEvent)+2}>{SUBSCRIPTEVENT_LOOKUP[historyArray[i].args.subscriptevent]}</td>,
            <td key={String(historyArray[i].args.timestamp)+3}>{formatDate}</td>,
            <td key={String(subAmount)+4}>{Number(subAmount).toFixed(2)}&nbsp;&nbsp;{ticker}</td>,
            )
          
        table.push(<tr align="center" key={String(historyArray[i].args.subscriber)+i}>{row}</tr>)
    
      }
  
      tableTop.push(
          <Table key="table" striped bordered hover size="sm" className={styles.history_table}>
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