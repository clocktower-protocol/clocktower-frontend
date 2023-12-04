import React from 'react';
import {Table} from 'react-bootstrap';
import { PROVEVENT_LOOKUP } from './config';
import dayjs from 'dayjs'

const ProviderHistoryTable = (props) => {

    const providerHistory = props.providerHistory

    //checks for empty array
    if(!Array.isArray(providerHistory) || (providerHistory.length <= 0 || typeof providerHistory[0].args === "undefined")) {
     return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < providerHistory.length; i++) {

        let row = []

        let formatDate = dayjs.unix(Number(providerHistory[i].args.timestamp)).format('MM/DD/YYYY h:mm:s A')


        row.push(
        <td key={String(providerHistory[i])+2}>{providerHistory[i].args.id.slice(0,10) + "..."}</td>,
        <td key={String(providerHistory[i])+3}>{PROVEVENT_LOOKUP[providerHistory[i].args.provevent]}</td>,
        <td key={String(providerHistory[i])+4}>{formatDate}</td>,
        )     
        table.push(<tr align="center" key={String(providerHistory[i])+formatDate}>{row}</tr>)
    }

    tableTop.push(
        <Table key="table" striped bordered hover size="sm" className="provTable">
        <thead key="tableHead">
            <tr key="headRow" align="center">
            <th key="provSubscription">Subscription</th>
            <th key="provEventType">Event Type</th>
            <th key="subsHead">Timestamp</th>
            </tr>
        </thead>
        <tbody key="tableBody">
            {table}
        </tbody>
        </Table>)
    
    return tableTop

}

export default ProviderHistoryTable