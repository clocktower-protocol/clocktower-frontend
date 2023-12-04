import React from 'react';
import {Table} from 'react-bootstrap';
import {Link} from "react-router-dom";


const ProvidersTable = (props) => {

    const providersArray = props.allProviders

       //checks for empty array
       if(!Array.isArray(providersArray) || (providersArray.length <= 0)) {
        return
    }

    let table = []
    let tableTop = []

    //console.log(providersArray.length)

    //loops through array to create table rows
    for(let i = 0; i < providersArray.length; i++) {
   
        let row = []
  
        row.push(
          <td key={String(providersArray[i])+1}>{providersArray[i].accountAddress}</td>,
          <td key={String(providersArray[i])+2}><Link to={`history/${providersArray[i].accountAddress}/${true}`}>History</Link></td>,
          <td key={String(providersArray[i])+3}><Link to={`subscriptions/${"provider"}/${providersArray[i].accountAddress}`}>Subscriptions</Link></td>
        )     
        table.push(<tr align="center" key={String(providersArray[i])}>{row}</tr>)
      }
   // }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
          <thead key="tableHead">
            <tr key="headRow" align="center">
              <th key="provAddressHead">Provider</th>
              <th key="provHistory">History</th>
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