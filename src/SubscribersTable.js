import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router-dom";


const SubscribersTable = (props) => {

    const subscribersArray = props.allSubscribers

    //checks for empty array
    if(!Array.isArray(subscribersArray) || (subscribersArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < subscribersArray.length; i++) {
   
        let row = []
  
        row.push(
          <td key={String(subscribersArray[i])+1}>{subscribersArray[i].accountAddress}</td>,
          <td key={String(subscribersArray[i])+2}><Link to={`subscriptions/${"subscriber"}/${subscribersArray[i].accountAddress}`}>Subscriptions</Link></td>
        )     
        table.push(<tr align="center" key={String(subscribersArray[i])}>{row}</tr>)
      }
   // }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
              <th key="provAddressHead">Subscriber</th>
              <th key="subsHead">Subscriptions</th>
            </tr>
          </thead>
          <tbody key="tableBody">
            {table}
          </tbody>
        </Table>)
    
    return tableTop


}

export default SubscribersTable