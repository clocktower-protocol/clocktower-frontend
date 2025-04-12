import React from 'react';
import {Table} from 'react-bootstrap';
import dayjs from 'dayjs'

const CallerHistoryTable = (props) => {

const callerHistory = props.callerHistory

    //checks for empty array
    if(!Array.isArray(callerHistory) || (callerHistory.length <= 0) || typeof callerHistory[0].args === "undefined") {
     return
 }

 let table = []
 let tableTop = [] 

 //loops through array to create table rows
 for(let i = 0; i < callerHistory.length; i++) {

     let row = []

     let formatDate = dayjs.unix(callerHistory[i].returnValues.timestamp).format('MM/DD/YYYY h:mm:s A')


     row.push(
       <td key={String(callerHistory[i])+1}>{callerHistory[i].args.caller}</td>,
       <td key={String(callerHistory[i])+2}>{formatDate}</td>,
       <td key={String(callerHistory[i])+3}>{callerHistory[i].args.checkedDay}</td>
     )     
     table.push(<tr align="center" key={String(callerHistory[i])}>{row}</tr>)
   }

 tableTop.push(
     <Table key="table" striped bordered hover size="sm" className="provTable">
       <thead key="tableHead">
         <tr key="headRow" align="center">
           <th key="provAddressHead">Caller</th>
           <th key="subsHead">Timestamp</th>
           <th key="checkedDayHead">Checked Day</th>
         </tr>
       </thead>
       <tbody key="tableBody">
         {table}
       </tbody>
     </Table>)
 
 return tableTop

}

export default CallerHistoryTable