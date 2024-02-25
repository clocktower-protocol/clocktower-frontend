import React, {useEffect, useState, useCallback} from 'react'
import { useOutletContext, useParams, useNavigate} from "react-router-dom";
import {Alert} from 'react-bootstrap';
//import Web3 from 'web3'
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config";
import EditDetailsForm from '../components/EditDetailsForm';
//import EthCrypto from 'eth-crypto';
//import { fromString } from 'uint8arrays/from-string'
//import {ecrecover, ecsign, privateToPublic} from '@ethereumjs/util'
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient} from 'wagmi'
import { parseAbiItem } from 'viem'

const EditDetails = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    //gets public client for log lookup
    const publicClient = usePublicClient()

    let {id} = useParams();

    const navigate = useNavigate()

    const [details, setDetails] = useState({})
    const [alertType, setAlertType] = useState("danger")
    const [description, setDescription] = useState("")
    const [domain, setDomain] = useState("")
    const [url, setUrl] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [submittedDetails, setSubmittedDetails] = useState({})
   
   // const fee = 0.1

    //loads once
    
    
    useEffect(() => {
        //gets subscriber events
        getDetails()
    }, [account]);

    const sendToProvDash = useCallback(() => 
    navigate('/provider', {replace: true})
    ,[navigate])

    /*
    const testEncryption = async () => {

        //TODO:
        
        try{
        //get public key from private key
        const hex = Uint8Array.from(Buffer.from('47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a', 'hex'));
        
        let publicKeyArray = privateToPublic(hex)

        let publicKey = Buffer.from(publicKeyArray).toString('hex');

       // console.log(publicKey)
        
        //encrypt data with public key and post to logs
        const encrypted = await EthCrypto.encryptWithPublicKey(
            publicKey, // by encrypting with bobs publicKey, only bob can decrypt the payload with his privateKey
            JSON.stringify("test") // we have to stringify the payload before we can encrypt it
        );

        // we convert the object into a smaller string-representation
        const encryptedString = EthCrypto.cipher.stringify(encrypted);

        let decryptedString = await window.ethereum.request({
            "method": "eth_decrypt",
            "params": [
              encryptedString,
              "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
            ]
        });

        console.log(decryptedString)
        } catch (err) {
            console.error(err);
        }
          /*
        const accountArray = fromString(String(account));

        const encryptedURL = await EthCrypto.encryptWithPublicKey(
            accountArray, 
            JSON.stringify(url) 
        );
        const encryptedURLString = EthCrypto.cipher.stringify(encryptedURL);
        */

       // console.log(encryptedURLString)

   // }
/*
const editDetailsWrite = useWriteContract({
    address: CLOCKTOWERSUB_ADDRESS,
    abi: CLOCKTOWERSUB_ABI,
    functionName: 'editDetails',
    args: [submittedDetails, id]
})
*/
const { data, writeContract } = useWriteContract()

const editDetailsWait = useWaitForTransactionReceipt({
    confirmations: 1,
    hash: data,
})

useEffect(() => {
    //calls wallet
    if(Object.keys(submittedDetails).length !== 0) {
        //editDetailsWrite.write()
        writeContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'editDetails',
            args: [submittedDetails, id]
        })
    } 
},[submittedDetails])

 //shows alert when waiting for transaction to finish
 useEffect(() => {

    if(editDetailsWait.isLoading) {
        setAlertType("warning")
        setAlert(true)
        setAlertText("Transaction Pending...")
        console.log("pending")
    }

    if(editDetailsWait.isSuccess) {

        //turns off alert
        setAlert(false)
        setAlertType("danger")
        console.log("done")

        sendToProvDash()
        
    }
},[editDetailsWait.isLoading, editDetailsWait.isSuccess])


const getDetails = async () => {
    let tempDetails = {}
    await publicClient.getLogs({
        address: CLOCKTOWERSUB_ADDRESS,
        event: parseAbiItem('event DetailsLog(bytes32 indexed id, address indexed provider, uint40 indexed timestamp, string domain, string url, string email, string phone, string description)'),
        fromBlock: 0n,
        toBlock: 'latest',
        args: {id:id}
    }) 
    .then(async function(events){
        //checks for latest update by getting highest timestamp
        if(events != undefined) {
            let time = 0
            let index = 0

           
            if(events.length > 0)
            {
                for (var j = 0; j < events.length; j++) {
                    if(time < events[j].args.timestamp)
                    {
                        time = events[j].args.timestamp
                        index = j
                    }
                    console.log(events[j].args.timestamp)
                }
               //adds latest details to details array
               tempDetails = events[index].args
            }    
        }
    })

   // testEncryption()

   console.log(tempDetails.domain)

    setDetails(tempDetails)
    setDescription(tempDetails.description)
    setDomain(tempDetails.domain)
    setEmail(tempDetails.email)
    setUrl(tempDetails.url)
    setPhone(tempDetails.phone)
}


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

    //checks that user has logged in 
    if(account == "-1") {
        return ( 
            <Alert align="center" variant="info">Please Login</Alert>  
        )
    } else {
        if(account != details.provider) {
            return (
                <Alert align="center" variant="info">Unrecognized Subscription</Alert>
            )

        } else {
            return (
            <div>
                {alertMaker()}
                
                <div>
                    {<Alert align="center" variant="dark">Edit Details</Alert>}
                </div>
                
                <div className="subTable">
                    <EditDetailsForm
                        details = {details}
                        description = {description}
                        domain = {domain}
                        email = {email}
                        url = {url}
                        phone = {phone}


                        //editDetails = {editDetails}
                    // testEncryption = {testEncryption}
                    
                        setDescription = {setDescription}
                        setDomain = {setDomain}
                        setEmail = {setEmail}
                        setUrl = {setUrl}
                        setPhone = {setPhone}
                    
                        setAlert = {setAlert}
                        setAlertText = {setAlertText}
                    
                        setSubmittedDetails = {setSubmittedDetails}
                    />
                </div>
            </div>
        
            )
    }   }
}

export default EditDetails 