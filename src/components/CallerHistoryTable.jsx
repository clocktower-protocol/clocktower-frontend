import {Table} from 'react-bootstrap';
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

const CallerHistoryTable = (props) => {

const callerHistory = props.callerHistory

    //checks for empty array
    if(!Array.isArray(callerHistory) || (callerHistory.length <= 0) || typeof callerHistory[0] === "undefined") {
     return
 }

 let table = []
 let tableTop = [] 

 //loops through array to create table rows
 for(let i = 0; i < callerHistory.length; i++) {

     let row = []

     let formatDate = dayjs.unix(callerHistory[i].timestamp).format('MM/DD/YYYY h:mm:s A')


     row.push(
       <td key={uuidv4()}>{callerHistory[i].caller}</td>,
       <td key={uuidv4()}>{formatDate}</td>,
       <td key={uuidv4()}>{callerHistory[i].checkedDay}</td>
     )     
     table.push(<tr align="center" key={uuidv4()}>{row}</tr>)
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