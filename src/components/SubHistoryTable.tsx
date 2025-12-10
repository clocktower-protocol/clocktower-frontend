import React, { useEffect, useState, useMemo } from 'react';
import { Table, Pagination, Form, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from "react-router";
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs';
import { TOKEN_LOOKUP, CHAIN_LOOKUP } from "../config";
import { formatEther } from 'viem';
import styles from '../css/clocktower.module.css';
import { useConnection } from 'wagmi';
import { config } from '../wagmiconfig';
import { SubLog } from '../types/subscription';

interface SubHistoryTableProps {
    historyArray: SubLog[];
    ticker?: string;
    isProvider: boolean;
}

const SubHistoryTable: React.FC<SubHistoryTableProps> = (props) => {
    const { historyArray, isProvider } = props;
    const { chainId } = useConnection({ config });
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const chain = CHAIN_LOOKUP.find((chain) => chain.id === chainId);

    // Handle browser back button
    useEffect(() => {
        const handlePopState = () => {
            navigate('../subscriptions/subscribed');
        };

        window.addEventListener('popstate', handlePopState);
        
        // Push a new state to the history stack
        window.history.pushState(null, '', window.location.href);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [navigate]);

    const tickerLookup = (tokenAddress: string): string | false => {
        const matchingToken = TOKEN_LOOKUP.find((token) => 
            token.address === tokenAddress
        );
        return matchingToken ? matchingToken.ticker : false;
    };

    // Filter the history array based on provider/subscriber logic
    const filteredHistory = useMemo(() => {
        return historyArray.filter(item => {
            if (isProvider) {
                return Number(item.subScriptEvent) !== 5;
            } else {
                return Number(item.subScriptEvent) !== 2;
            }
        }).filter(item => typeof item.amount !== "undefined");
    }, [historyArray, isProvider]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredHistory.slice(startIndex, endIndex);

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

    let table: React.ReactElement[] = [];

    if (currentItems.length > 0 && typeof currentItems[0] !== "undefined") {
        //loops through array to create table rows
        for (let i = 0; i < currentItems.length; i++) {
            let row: React.ReactElement[] = [];
            let subAmount = formatEther(BigInt(currentItems[i].amount));
            let formatDate = dayjs.unix(Number(currentItems[i].timestamp)).format('MM/DD/YYYY h:mm:ss A');
            let ticker = tickerLookup(currentItems[i].token);
    
            row.push(
                <td key={String(currentItems[i].subscriber)+1} className="text-center">
                    {currentItems[i].subscriber !== "0x0000000000000000000000000000000000000000" ? 
                        <Link to={`../account/${currentItems[i].subscriber}`}>{currentItems[i].subscriber}</Link> 
                        : "N/A"
                    }
                </td>, 
                <td key={String(currentItems[i].transactionHash)} className="text-center">
                    <a href={`${chain?.explorerUrl}tx/${currentItems[i].transactionHash}`}>TX</a>
                </td>,
                <td key={String(currentItems[i].subScriptEvent)+2} className="text-center">
                    {SUBSCRIPTEVENT_LOOKUP[Number(currentItems[i].subScriptEvent)]}
                </td>,
                <td key={String(currentItems[i].timestamp)+3} className="text-center">{formatDate}</td>,
                <td key={String(subAmount)+4} className="text-center">
                    {Number(currentItems[i].subScriptEvent) !== 7 && Number(currentItems[i].subScriptEvent) !== 6 ? 
                        Number(subAmount).toFixed(2) 
                        : "N/A"
                    }&nbsp;&nbsp;{ticker}
                </td>,
            );
            
            table.push(<tr key={String(currentItems[i].subscriber)+i}>{row}</tr>);
        }
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
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredHistory.length)} of {filteredHistory.length} entries
                    </small>
                </Col>
            </Row>
            
            <div className="table-responsive">
                <Table striped bordered hover size="sm" className={styles.history_table}>
                    <thead>
                        <tr>
                            <th className="text-center">Subscriber</th>
                            <th className="text-center">TX</th>
                            <th className="text-center">Event Type</th>
                            <th className="text-center">Timestamp</th>
                            <th className="text-center">Amount</th>
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

export default SubHistoryTable; 