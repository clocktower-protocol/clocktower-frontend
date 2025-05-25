import {Table} from 'react-bootstrap';
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

const AdminHistoryTable = (props) => {

    const providerHistory = props.providerHistory

    //checks for empty array
    if(!Array.isArray(providerHistory) || (providerHistory.length <= 0 || typeof providerHistory[0] === "undefined")) {
     return
    }

    let table = []
    let tableTop = []

    //loops through array to create table rows
    for(let i = 0; i < providerHistory.length; i++) {

        let row = []

        let formatDate = dayjs.unix(Number(providerHistory[i].timestamp)).format('MM/DD/YYYY h:mm:s A')
        
        const event = SUBSCRIPTEVENT_LOOKUP[providerHistory[i].subScriptEvent]
      
        row.push(
        <td key={uuidv4()}>{String(providerHistory[i].internal_id).slice(0,10) + "..."}</td>,
        <td key={uuidv4()}>{event}</td>,
        <td key={uuidv4()}>{formatDate}</td>,
        )     
        
        table.push(<tr align="center" key={String(providerHistory[i].timestamp)+i}>{row}</tr>)
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

export default AdminHistoryTable