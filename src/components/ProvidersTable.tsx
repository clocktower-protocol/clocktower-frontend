import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from "react-router";

interface ProviderTableItem {
    accountAddress: `0x${string}`;
}

interface ProvidersTableProps {
    allProviders: ProviderTableItem[];
}

const ProvidersTable: React.FC<ProvidersTableProps> = (props) => {
    const providersArray = props.allProviders;

    //checks for empty array
    if (!Array.isArray(providersArray) || (providersArray.length <= 0)) {
        return null;
    }

    const table: React.ReactElement[] = [];
    const tableTop: React.ReactElement[] = [];

    //loops through array to create table rows
    for (let i = 0; i < providersArray.length; i++) {
        const row: React.ReactElement[] = [];

        row.push(
            <td key={`${providersArray[i].accountAddress}-1`}>
                {providersArray[i].accountAddress}
            </td>,
            <td key={`${providersArray[i].accountAddress}-2`}>
                <Link to={`../admin/history/${providersArray[i].accountAddress}/${true}`}>
                    History
                </Link>
            </td>,
            <td key={`${providersArray[i].accountAddress}-3`}>
                <Link to={`../admin/subscriptions/provider/${providersArray[i].accountAddress}`}>
                    Subscriptions
                </Link>
            </td>
        );

        table.push(
            <tr className="text-center" key={providersArray[i].accountAddress}>
                {row}
            </tr>
        );
    }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
            <thead key="tableHead">
                <tr key="headRow" className="text-center">
                    <th key="provAddressHead">Provider</th>
                    <th key="provHistory">History</th>
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

export default ProvidersTable; 