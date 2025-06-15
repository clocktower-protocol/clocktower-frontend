import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from "react-router";
import { v4 as uuidv4 } from 'uuid';

interface SubscriberTableItem {
    accountAddress: `0x${string}`;
}

interface SubscribersTableProps {
    allSubscribers: SubscriberTableItem[];
}

const SubscribersTable: React.FC<SubscribersTableProps> = (props) => {
    const subscribersArray = props.allSubscribers;

    //checks for empty array
    if (!Array.isArray(subscribersArray) || (subscribersArray.length <= 0)) {
        return null;
    }

    const table: React.ReactElement[] = [];
    const tableTop: React.ReactElement[] = [];

    //loops through array to create table rows
    for (let i = 0; i < subscribersArray.length; i++) {
        const row: React.ReactElement[] = [];

        row.push(
            <td key={uuidv4()}>{subscribersArray[i].accountAddress}</td>,
            <td key={uuidv4()}><Link to={`../admin/history/${subscribersArray[i].accountAddress}/${false}`}>History</Link></td>,
            <td key={uuidv4()}><Link to={`../admin/subscriptions/${"subscriber"}/${subscribersArray[i].accountAddress}`}>Subscriptions</Link></td>
        );
        table.push(<tr className="text-center" key={uuidv4()}>{row}</tr>);
    }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
            <thead key="tableHead">
                <tr key="headRow" className="text-center">
                    <th key="provAddressHead">Subscriber</th>
                    <th key="subsHistory">History</th>
                    <th key="subsHead">Subscriptions</th>
                </tr>
            </thead>
            <tbody key="tableBody">
                {table}
            </tbody>
        </Table>
    );

    return tableTop;
};

export default SubscribersTable; 