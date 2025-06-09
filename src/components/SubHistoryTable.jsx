import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router";
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs'
import {TOKEN_LOOKUP, CHAIN_LOOKUP} from "../config";
import {formatEther} from 'viem'
import styles from '../css/clocktower.module.css';
import {useAccount} from 'wagmi'
import {config} from '../wagmiconfig'

const SubHistoryTable = (props) => {

    const historyArray = props.historyArray

    //gets chainId
    const { chainId } = useAccount({config})

    const isProvider = props.isProvider

    //console.log(historyArray.length)

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
    //gets explorer url from chain lookup
    const chain = CHAIN_LOOKUP.find((chain) =>
      chain.id === chainId
    )

   // console.log(chain.explorerUrl)

    const tickerLookup = (tokenAddress) => {
      const matchingToken = TOKEN_LOOKUP.find((token) => 
          token.address === tokenAddress
      );
      return matchingToken ? matchingToken.ticker : false;
    };

    let table = []
    let tableTop = []

  if(historyArray.length > 0 && typeof historyArray[0] !== "undefined") {
    //loops through array to create table rows
    for(let i = 0; i < historyArray.length; i++) {

        if(isProvider) {
          if(historyArray[i].subScriptEvent === 5) {
            continue
          }
        } else {
          if(historyArray[i].subScriptEvent === 2) {
            continue
          }
        }
        
        if(typeof historyArray[i].amount !== "undefined") {
          let row = []

          //console.log(historyArray[i].transactionHash)
          //console.log(chainId)
        
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
            subAmount = formatEther(historyArray[i].amount)
            //console.log(historyArray[i].amount)
          //}
          //let subAmount = formatEther(eighteenDecimalAmount)
          let formatDate = dayjs.unix(historyArray[i].timestamp).format('MM/DD/YYYY h:mm:ss A')
          let ticker = tickerLookup(historyArray[i].token)
    
          row.push(
              <td key={String(historyArray[i].subscriber)+1}>{historyArray[i].subscriber !== "0x0000000000000000000000000000000000000000" ? <Link to={`../account/${historyArray[i].subscriber}`}>{historyArray[i].subscriber}</Link> : "N/A" }</td>, 
              <td key={String(historyArray[i].transactionHash)}>{<a href={`${chain.explorerUrl}tx/${historyArray[i].transactionHash}`}>TX</a>}</td>,
              <td key={String(historyArray[i].subScriptEvent)+2}>{SUBSCRIPTEVENT_LOOKUP[historyArray[i].subScriptEvent]}</td>,
              <td key={String(historyArray[i].timestamp)+3}>{formatDate}</td>,
              <td key={String(subAmount)+4}>{historyArray[i].subScriptEvent !== 7 && historyArray[i].subScriptEvent !== 6 ? Number(subAmount).toFixed(2) : "N/A"}&nbsp;&nbsp;{ticker}</td>,
            
              )
            
          table.push(<tr align="center" key={String(historyArray[i].subscriber)+i}>{row}</tr>)

        }
      
    
      }
  
      tableTop.push(
          <Table key="table" striped bordered hover size="sm" className={styles.history_table}>
            <thead key="tableHead">
              <tr key="headRow" align="center">
                <th key="subHead">Subscriber</th>
                <th key="txHead">TX</th>
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