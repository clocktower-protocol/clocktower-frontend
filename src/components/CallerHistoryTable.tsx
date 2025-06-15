import React from 'react';
import { Table } from 'react-bootstrap';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';

interface CallerHistoryEvent {
    caller: string;
    timestamp: string;
    checkedDay: string;
}

interface CallerHistoryTableProps {
    callerHistory: CallerHistoryEvent[];
}

const CallerHistoryTable: React.FC<CallerHistoryTableProps> = (props) => {
    const { callerHistory } = props;

    //checks for empty array
    if (!Array.isArray(callerHistory) || (callerHistory.length <= 0) || typeof callerHistory[0] === "undefined") {
        return null;
    }

    const table = callerHistory.map((event) => {
        const formatDate = dayjs.unix(Number(event.timestamp)).format('MM/DD/YYYY h:mm:s A');

        return (
            <tr key={uuidv4()} className="text-center">
                <td>{event.caller}</td>
                <td>{formatDate}</td>
                <td>{event.checkedDay}</td>
            </tr>
        );
    });

    return (
        <Table striped bordered hover size="sm" className="provTable">
            <thead>
                <tr className="text-center">
                    <th>Caller</th>
                    <th>Timestamp</th>
                    <th>Checked Day</th>
                </tr>
            </thead>
            <tbody>
                {table}
            </tbody>
        </Table>
    );
};

export default CallerHistoryTable; 