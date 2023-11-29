import React from 'react';
import {Button, Table} from 'react-bootstrap';
import {Link} from "react-router-dom";
import {TOKEN_LOOKUP, FREQUENCY_LOOKUP} from "./config";
import Web3 from 'web3'

const SubscriptionsTable = (props) => {

    /* Role numbers

    0 == Admin
    1 == Provider
    2 == Subscriber

    */
    

    const subscriptionArray = props.subscriptionArray

    const detailsArray = props.detailsArray

    let bySubscriber = true
    //const isAdmin = props.isAdmin
    const role = props.role

    let isAdmin = false

    role === 0 ? isAdmin = true : isAdmin = false
    
    //sets which view for admin
    if(role == 0) {
      bySubscriber = props.bySubscriber
    }

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
     
      //doesn't show cancelled transactions
      if(subscriptionArray[i].status != 1 || isAdmin) {
        let row = []
        let totalSubscribers = 0;
        if(typeof subscriptionArray[i].totalSubscribers !== 'undefined') {
          totalSubscribers = subscriptionArray[i].totalSubscribers
        }
        let subAmount = Web3.utils.fromWei(String(subscriptionArray[i].subscription.amount))

       // console.log(subscriptionArray[i].subscription.frequency)
        if(role === 0) {
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+0}>{subscriptionArray[i].subscription.id.slice(0,8) + "..."}</td>
          )
        }

        row.push(
            <td key={String(subscriptionArray[i].subscription.id)+1}>{detailsArray[i].description}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+2}>{subAmount}&nbsp;&nbsp; {tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+3}>{frequencyLookup(subscriptionArray[i].subscription.frequency)}</td>, 
            <td key={String(subscriptionArray[i].subscription.id)+4}>{subscriptionArray[i].subscription.dueDay}</td>,
        )
        if(role === 0 && bySubscriber) {
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+8}>{Web3.utils.fromWei(String(props.feeObjects[i].feeBalance))}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+9}>{props.feeObjects[i].remainingCycles}</td>,
          )
        }
        if(role === 0 && !bySubscriber) {
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}>{totalSubscribers}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>
          )
        }
        if(role === 1 && totalSubscribers > 0) {
            row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}><Link to={`subscribers/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.amount}/${tickerLookup(subscriptionArray[i].subscription.token)}`}>{totalSubscribers}</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+8}><Link to={`history/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+9}><Link to={`../editdetails/${subscriptionArray[i].subscription.id}`}>Edit</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+10}><Button type="submit" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button></td>
            )
        }
        if(role === 1 && totalSubscribers == 0) {
          row.push(
            <td key={String(subscriptionArray[i].subscription.id)+5}><Link to={`../public_subscription/${subscriptionArray[i].subscription.id}/${subscriptionArray[i].subscription.frequency}/${subscriptionArray[i].subscription.dueDay}`}>Link</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+6}>{totalSubscribers}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+7}>{totalSubscribers * subAmount}&nbsp;&nbsp;{tickerLookup(subscriptionArray[i].subscription.token)}</td>,
            <td key={String(subscriptionArray[i].subscription.id)+8}><Link to={`history/${subscriptionArray[i].subscription.id}`}>History</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+9}><Link to={`../editdetails/${subscriptionArray[i].subscription.id}`}>Edit</Link></td>,
            <td key={String(subscriptionArray[i].subscription.id)+10}><Button type="submit" onClick={() => props.setCancelledSub(subscriptionArray[i].subscription)}>Cancel</Button></td>
            )
        }

        if(role === 2) {
          row.push(
          <td key={String(subscriptionArray[i].subscription.id)+6}><Link to={`subscription/${subscriptionArray[i].subscription.id}/${props.account}`}>History</Link></td>,
          <td key={String(subscriptionArray[i].subscription.id)+7}><Button type="submit" onClick={() => props.unsubscribe(subscriptionArray[i].subscription)}>Unsubscribe</Button></td>
          )
      }
        
          
        
        table.push(<tr align="center" key={String(subscriptionArray[i].subscription.id)}>{row}</tr>)
      }
    }

    tableTop.push(
        <Table key="table" striped bordered hover size="sm" className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
                {isAdmin
                ? <th key="IdHead">ID</th> : ""
                }
                <th key="descriptionHead">Description</th>
                <th key="dateHead">Amount</th>
                <th key="amountHead">Frequency</th>
                <th key="statusHead">Due Day</th>
                {role === 1 || role === 0
                ? <th key="urlHead">URL</th> : ""
                }
                {role === 1 || role === 0 && !bySubscriber
                ? <th key="totalSubs">Subscribers</th> : ""
                }
                {role === 1 || role === 0 && !bySubscriber
                ? <th key="incomeHead">Income per Period</th> : ""
                }
                {isAdmin && bySubscriber
                ? <th key="feeBalanceHead">Fee Balance</th> : ""
                }
                {isAdmin && bySubscriber
                ? <th key="remainCyclesHead">Remaining Cycles</th> : ""
                }
                {!isAdmin  
                ?  <th key="detailsHead">History</th> : ""
                }
                {role === 1 
                ?   <th key="detailsProvHead">Edit Details</th> : ""
                }  
                {role === 1 
                ?   <th key="cancelProvHead">Cancel</th> : ""
                }   
                {role === 2
                ?   <th key="unsubscribeHead">Unsubscribe</th> : ""
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