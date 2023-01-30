import React, {useEffect, useState} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import '../App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
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
    const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    const [alertType, setAlertType] = useState("danger")
    const [hour, setHour] = useState("0")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [tokenABI, setTokenABI] = useState({})
    const [formFrequency, setFormFrequency] = useState(0)
    const [dueDay, setDueDay] = useState(1)
    const [description, setDescription] = useState("")
    //const [isValidated, setIsValidated] = useState(false)

    const [formAmount, setFormAmount] = useState(0.00)

    //validates form data
    const formValidate = () => {

        let isCorrect = true;

        //checks amount
        if(formAmount <= 0) {
            console.log (
                "amount incorrect"
            )
            isCorrect = false
            setAlert(true)
            setAlertText("Amount invalid")
            return
        } else {
            setAlert(false)
        }

        //checks description
        isCorrect = true;

        //checks amount
        if(description.length > 255) {
            console.log (
                "Description too long"
            )
            isCorrect = false
            setAlert(true)
            setAlertText("Description must be under 256 characters")
            return
        } else {
            setAlert(false)
        }
    
    }

    const submitForm = async (event) => {
        // const target = event.currentTarget;
    
            event.preventDefault();
            event.stopPropagation();

            if(formValidate) {

            } else {
                return
            }
    
            /*
            //checks if allowance increase is needed
            if(await enoughAllowance()) {
            console.log("enough")
            await addTransaction()
            } else {
            console.log("not enough")
            await addTransactionPermit()
            }
        
            await getAccountTransactions();
            */
    
    };

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
                        <CreateSubForm 
                            token = {token}
                            formAmount = {formAmount}
                            formFrequency = {formFrequency}
                            dueDay = {dueDay}
                            description = {description}

                            setToken = {setToken}
                            setTokenABI = {setTokenABI}
                            setFormAmount = {setFormAmount}
                            setFormFrequency = {setFormFrequency}
                            setDueDay = {setDueDay}
                            setDescription = {setDescription}
                            submitForm = {submitForm}
                            setAlert = {setAlert}
                            setAlertText = {setAlertText}
                          //  setIsValidated = {setIsValidated}
                        />
                    </div>
                </div>
            </div>
        </div>
        </>
    )

}

export default Provider