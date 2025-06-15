import React from 'react';
import { Table } from 'react-bootstrap';
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { SubLog } from '../types/subscription';

interface AdminHistoryTableProps {
    providerHistory: SubLog[];
    isp?: string;
}

const AdminHistoryTable: React.FC<AdminHistoryTableProps> = (props) => {
    const { providerHistory } = props;

    //checks for empty array
    if (!Array.isArray(providerHistory) || (providerHistory.length <= 0 || typeof providerHistory[0] === "undefined")) {
        return null;
    }

    const table = providerHistory.map((event, i) => {
        const formatDate = dayjs.unix(Number(event.timestamp)).format('MM/DD/YYYY h:mm:s A');
        const eventType = SUBSCRIPTEVENT_LOOKUP[Number(event.subScriptEvent)];

        return (
            <tr className="text-center" key={String(event.timestamp) + i}>
                <td key={uuidv4()}>{String(event.internal_id).slice(0, 10) + "..."}</td>
                <td key={uuidv4()}>{eventType}</td>
                <td key={uuidv4()}>{formatDate}</td>
            </tr>
        );
    });

    return (
        <Table striped bordered hover size="sm" className="provTable">
            <thead>
                <tr className="text-center">
                    <th>Subscription</th>
                    <th>Event Type</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {table}
            </tbody>
        </Table>
    );
};

export default AdminHistoryTable; 