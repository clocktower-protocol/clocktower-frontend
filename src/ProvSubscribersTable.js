import React from 'react';
import {Table} from 'react-bootstrap';
import {formatEther} from 'viem'

const ProvSubscribersTable = (props) => {

    const subscribersArray = props.subscribersArray

     //checks for empty array
     if(!Array.isArray(subscribersArray) || (subscribersArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscribersArray.length; i++) {
   
        let row = []

        //let feeBalance = Web3.utils.fromWei(subscribersArray[i].feeBalance)
        let feeBalance = formatEther(subscribersArray[i].feeBalance)
  
        row.push(
          <td key={String(subscribersArray[i])+1}>{subscribersArray[i].subscriber}</td>,
          <td key={String(subscribersArray[i])+2}>{Number(feeBalance).toFixed(4)}&nbsp;&nbsp;{props.ticker}</td>,
          <td key={String(subscribersArray[i])+3}>{Math.floor(props.remainingCycles[i])}</td>,
        )     
        table.push(<tr align="center" key={String(subscribersArray[i])}>{row}</tr>)
      }
   // }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
              <th key="provAddressHead">Subscriber</th>
              <th key="feeBalanceHead">Fee Balance</th>
              <th key="cyclesLeftHead">Remaining Cycles</th>
            </tr>
          </thead>
          <tbody key="tableBody">
            {table}
          </tbody>
        </Table>)
    
    return tableTop


}

export default ProvSubscribersTable