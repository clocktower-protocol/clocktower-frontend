import React, { useState, useMemo } from 'react';
import { Table, Pagination, Form, Row, Col } from 'react-bootstrap';
import { Link } from "react-router";

interface ProviderTableItem {
    accountAddress: `0x${string}`;
}

interface ProvidersTableProps {
    allProviders: ProviderTableItem[];
}

const ProvidersTable: React.FC<ProvidersTableProps> = (props) => {
    const providersArray = props.allProviders;
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.ceil(providersArray.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = providersArray.slice(startIndex, endIndex);

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
    if (!Array.isArray(providersArray) || (providersArray.length <= 0)) {
        return null;
    }

    const table: React.ReactElement[] = [];

    //loops through array to create table rows
    for (let i = 0; i < currentItems.length; i++) {
        const row: React.ReactElement[] = [];

        row.push(
            <td key={`${currentItems[i].accountAddress}-1`}>
                {currentItems[i].accountAddress}
            </td>,
            <td key={`${currentItems[i].accountAddress}-2`}>
                <Link to={`../admin/history/${currentItems[i].accountAddress}/${true}`}>
                    History
                </Link>
            </td>,
            <td key={`${currentItems[i].accountAddress}-3`}>
                <Link to={`../admin/subscriptions/provider/${currentItems[i].accountAddress}`}>
                    Subscriptions
                </Link>
            </td>
        );

        table.push(
            <tr className="text-center" key={currentItems[i].accountAddress}>
                {row}
            </tr>
        );
    }

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
                        Showing {startIndex + 1} to {Math.min(endIndex, providersArray.length)} of {providersArray.length} entries
                    </small>
                </Col>
            </Row>
            
            <Table striped bordered hover className="provTable">
                <thead>
                    <tr className="text-center">
                        <th>Provider</th>
                        <th>History</th>
                        <th>Subscriptions</th>
                    </tr>
                </thead>
                <tbody>
                    {table}
                </tbody>
            </Table>

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

export default ProvidersTable; 