import React from 'react';
import { Table } from 'react-bootstrap';
import { Link } from "react-router";
import { SUBSCRIPTEVENT_LOOKUP } from '../config';
import dayjs from 'dayjs';
import { TOKEN_LOOKUP, CHAIN_LOOKUP } from "../config";
import { formatEther } from 'viem';
import styles from '../css/clocktower.module.css';
import { useAccount } from 'wagmi';
import { config } from '../wagmiconfig';
import { SubLog } from '../types/subscription';

interface SubHistoryTableProps {
    historyArray: SubLog[];
    ticker?: string;
    isProvider: boolean;
}

const SubHistoryTable: React.FC<SubHistoryTableProps> = (props) => {
    const { historyArray, isProvider } = props;
    const { chainId } = useAccount({ config });

    const chain = CHAIN_LOOKUP.find((chain) => chain.id === chainId);

    const tickerLookup = (tokenAddress: string): string | false => {
        const matchingToken = TOKEN_LOOKUP.find((token) => 
            token.address === tokenAddress
        );
        return matchingToken ? matchingToken.ticker : false;
    };

    let table: React.ReactElement[] = [];
    let tableTop: React.ReactElement[] = [];

    if (historyArray.length > 0 && typeof historyArray[0] !== "undefined") {
        //loops through array to create table rows
        for (let i = 0; i < historyArray.length; i++) {
            if (isProvider) {
                if (Number(historyArray[i].subScriptEvent) === 5) {
                    continue;
                }
            } else {
                if (Number(historyArray[i].subScriptEvent) === 2) {
                    continue;
                }
            }
            
            if (typeof historyArray[i].amount !== "undefined") {
                let row: React.ReactElement[] = [];
                let subAmount = formatEther(BigInt(historyArray[i].amount));
                let formatDate = dayjs.unix(Number(historyArray[i].timestamp)).format('MM/DD/YYYY h:mm:ss A');
                let ticker = tickerLookup(historyArray[i].token);
        
                row.push(
                    <td key={String(historyArray[i].subscriber)+1} className="text-center">
                        {historyArray[i].subscriber !== "0x0000000000000000000000000000000000000000" ? 
                            <Link to={`../account/${historyArray[i].subscriber}`}>{historyArray[i].subscriber}</Link> 
                            : "N/A"
                        }
                    </td>, 
                    <td key={String(historyArray[i].transactionHash)} className="text-center">
                        <a href={`${chain?.explorerUrl}tx/${historyArray[i].transactionHash}`}>TX</a>
                    </td>,
                    <td key={String(historyArray[i].subScriptEvent)+2} className="text-center">
                        {SUBSCRIPTEVENT_LOOKUP[Number(historyArray[i].subScriptEvent)]}
                    </td>,
                    <td key={String(historyArray[i].timestamp)+3} className="text-center">{formatDate}</td>,
                    <td key={String(subAmount)+4} className="text-center">
                        {Number(historyArray[i].subScriptEvent) !== 7 && Number(historyArray[i].subScriptEvent) !== 6 ? 
                            Number(subAmount).toFixed(2) 
                            : "N/A"
                        }&nbsp;&nbsp;{ticker}
                    </td>,
                );
                
                table.push(<tr key={String(historyArray[i].subscriber)+i}>{row}</tr>);
            }
        }
  
        tableTop.push(
            <Table key="table" striped bordered hover size="sm" className={styles.history_table}>
                <thead key="tableHead">
                    <tr key="headRow">
                        <th key="subHead" className="text-center">Subscriber</th>
                        <th key="txHead" className="text-center">TX</th>
                        <th key="eventHead" className="text-center">Event Type</th>
                        <th key="dateHead" className="text-center">Timestamp</th>
                        <th key="amountHead" className="text-center">Amount</th>
                    </tr>
                </thead>
                <tbody key="tableBody">
                    {table}
                </tbody>
            </Table>
        );
    }
    
    return tableTop;
};

export default SubHistoryTable; 