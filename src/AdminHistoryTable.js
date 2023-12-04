import React from 'react';
import {Table} from 'react-bootstrap';
import { PROVEVENT_LOOKUP, SUBEVENT_LOOKUP } from './config';
import dayjs from 'dayjs'

const ProviderHistoryTable = (props) => {

    const providerHistory = props.providerHistory
    const isp = props.isp

    //checks for empty array
    if(!Array.isArray(providerHistory) || (providerHistory.length <= 0 || typeof providerHistory[0].args === "undefined")) {
     return
    }

    console.log(providerHistory)

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < providerHistory.length; i++) {

        let row = []

        let formatDate = dayjs.unix(Number(providerHistory[i].args.timestamp)).format('MM/DD/YYYY h:mm:s A')
        let event = ""
        if(isp === "true"){
            event = PROVEVENT_LOOKUP[providerHistory[i].args.provevent]
        } else {
            event = SUBEVENT_LOOKUP[providerHistory[i].args.subevent]
        }


        row.push(
        <td key={String(providerHistory[i].args.id)}>{providerHistory[i].args.id.slice(0,10) + "..."}</td>,
        <td key={String(event)}>{event}</td>,
        <td key={String(formatDate)}>{formatDate}</td>,
        )     
        //table.push(<tr align="center" key={"asdfsadfsdfsdfsdf"+isp}>{row}</tr>)
        table.push(<tr align="center" key={String(providerHistory[i].args.timestamp)+i}>{row}</tr>)
    }

    tableTop.push(
        <Table key="tableHist" striped bordered hover size="sm" className="provTable">
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