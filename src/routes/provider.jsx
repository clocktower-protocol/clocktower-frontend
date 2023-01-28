import React, {useEffect, useState} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERPAY_ABI, CLOCKTOWERSUB_ADDRESS, CLOCKTOWERPAY_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { useOutletContext } from "react-router-dom";
import CreateSubForm from '../CreateSubForm';
/* global BigInt */

const Provider = () => {
    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowerpay = new web3.eth.Contract(CLOCKTOWERPAY_ABI, CLOCKTOWERPAY_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    const [alertType, setAlertType] = useState("danger")

    console.log(account)

    //Creates alert
    const alertMaker = () => {
        if(alert) {
            return (
                <div className="alertDiv">
                <Alert variant={alertType} align="center" onClose={() => setAlert(false)} dismissible>{alertText}</Alert>
                </div>
            )
        }
    }

    return (
        <>
        <div className="clockMeta">
            {alertMaker()}
            <div className="clockBody">
                <div className="clockFormDiv">
                    <div>
                        <CreateSubForm />
                    </div>
                </div>
            </div>
        </div>
        </>
    )

}

export default Provider