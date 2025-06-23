import React, { useState, useMemo } from 'react';
import { Table, Pagination, Form, Row, Col } from 'react-bootstrap';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.ceil(callerHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = callerHistory.slice(startIndex, endIndex);

    // Generate page numbers for pagination
    const pageNumbers = useMemo(() => {
        const pages = [];
        const maxVisiblePages = 5;
        
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    }, [currentPage, totalPages]);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemsPerPage = parseInt(event.target.value);
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    //checks for empty array
    if (!Array.isArray(callerHistory) || (callerHistory.length <= 0) || typeof callerHistory[0] === "undefined") {
        return null;
    }

    const table = currentItems.map((event) => {
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
        <div>
            <Row className="mb-3 mx-2">
                <Col md={6}>
                    <div className="d-flex align-items-center">
                        <span className="me-2">Items per page:</span>
                        <Form.Select 
                            value={itemsPerPage} 
                            onChange={handleItemsPerPageChange}
                            style={{ width: 'auto' }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </Form.Select>
                    </div>
                </Col>
                <Col md={6} className="text-end">
                    <small className="text-muted">
                        Showing {startIndex + 1} to {Math.min(endIndex, callerHistory.length)} of {callerHistory.length} entries
                    </small>
                </Col>
            </Row>
            
            <div className="table-responsive">
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
            </div>

            {totalPages > 1 && (
                <div className="d-flex justify-content-center" style={{ marginTop: '3rem' }}>
                    <Pagination>
                        <Pagination.First 
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                        />
                        <Pagination.Prev 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        
                        {pageNumbers.map((page, index) => (
                            <Pagination.Item
                                key={index}
                                active={page === currentPage}
                                onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                                disabled={page === '...'}
                            >
                                {page}
                            </Pagination.Item>
                        ))}
                        
                        <Pagination.Next 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                        <Pagination.Last 
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default CallerHistoryTable; 