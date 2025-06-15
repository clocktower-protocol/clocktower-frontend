import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from "react-router";
import { formatEther } from 'viem';

interface ProviderSubscriber {
    subscriber: `0x${string}`;
    feeBalance: bigint;
}

interface ProvSubscribersTableProps {
    subscribersArray: ProviderSubscriber[];
    ticker: string;
    remainingCycles: number[];
}

const ProvSubscribersTable: React.FC<ProvSubscribersTableProps> = (props) => {
    const subscribersArray = props.subscribersArray;

    //checks for empty array
    if (!Array.isArray(subscribersArray) || (subscribersArray.length <= 0)) {
        return null;
    }

    const table: React.ReactElement[] = [];
    const tableTop: React.ReactElement[] = [];

    //loops through array to create table rows
    for (let i = 0; i < subscribersArray.length; i++) {
        const row: React.ReactElement[] = [];
        const feeBalance = formatEther(subscribersArray[i].feeBalance);

        row.push(
            <td key={`${subscribersArray[i].subscriber}-1`}>
                <Link to={`../account/${subscribersArray[i].subscriber}`}>
                    {subscribersArray[i].subscriber}
                </Link>
            </td>,
            <td key={`${subscribersArray[i].subscriber}-2`}>
                {Number(feeBalance).toFixed(4)}&nbsp;&nbsp;{props.ticker}
            </td>,
            <td key={`${subscribersArray[i].subscriber}-3`}>
                {Math.floor(props.remainingCycles[i])}
            </td>
        );

        table.push(
            <tr className="text-center" key={subscribersArray[i].subscriber}>
                {row}
            </tr>
        );
    }

    tableTop.push(
        <Table key="table" striped bordered hover className="provTable">
            <thead key="tableHead">
                <tr key="headRow" className="text-center">
                    <th key="provAddressHead">Subscriber</th>
                    <th key="feeBalanceHead">Fee Balance</th>
                    <th key="cyclesLeftHead">Remaining Cycles</th>
                </tr>
            </thead>
            <tbody key="tableBody">
                {table}
            </tbody>
        </Table>
    );

    return tableTop;
};

export default ProvSubscribersTable; 