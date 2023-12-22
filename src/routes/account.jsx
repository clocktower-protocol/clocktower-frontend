import { useOutletContext } from "react-router-dom";
import React, {useEffect, useState } from 'react'
import {Alert, Row, Col, Container, Card, ListGroup, Button, Stack, Modal} from 'react-bootstrap';
import Avatar from "boring-avatars"
import { useSignMessage, useAccount} from "wagmi";
import {recoverMessageAddress } from 'viem'
import EditAccountForm from "../EditAccountForm";

const Account = () => {

    //const { address, connector: activeConnector } = useAccount()
    const { address } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const [alertType, setAlertType] = useState("danger")
    const [showEditWarn, setShowEditWarn] = useState(false);
    const [verifyShow, setVerifyShow] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false)

    const [isDisabled, setIsDisabled] = useState(false)
    const [copyTitle, setCopyTitle] = useState("Copy")
    const [isDomainVerified, setIsDomainVerified] = useState(false)
    const [description, setDescription] = useState("")
    const [company, setCompany] = useState("")
    const [url, setUrl] = useState("")
    const [domain, setDomain] = useState("")
    const msg = 'test'

    //hook for signing messages
    const {data: signMessageData, error, isLoading, signMessage, variables}  = useSignMessage({
        message: msg
    })

    //gets signed message
    useEffect(() => {
        ;(async () => {
            if (signMessageData) {
              const recoveredAddress = await recoverMessageAddress({
                message: variables?.message,
                signature: signMessageData,
              })
              if(recoveredAddress == address){
                console.log("here")
                setCopyTitle("Copy")
                setIsDisabled(false)
                verifyHandleShow()
              }
            }
        })()

    },[signMessageData])

    const verifyDomain = async (domain, provAddress) => {

        let url = "https://dns.google/resolve?name=ct." + domain + "&type=TXT"

        console.log(url)

        //checks dns record
         try {
            var response = await fetch(url);
                
                var json = await response.json();
                if(json.Answer[0].data !== undefined){
                    console.log(json.Answer[0].data);
                    //verifies signature
                    const dnsRecoveredAddress = await recoverMessageAddress({
                        message: msg,
                        signature: json.Answer[0].data,
                      })
                    console.log(dnsRecoveredAddress)
                    if(dnsRecoveredAddress == provAddress) {
                        setIsDomainVerified(true)
                        console.log("TRUE!")
                    }
                }
            }
             catch(Err) {
                console.log(Err)
            }
    }

    //turns on and off edit warning modal
    const editHandleClose = () => setShowEditWarn(false);
    const editHandleShow = () => setShowEditWarn(true);

    //turns on and off verify domain modal 
    const verifyHandleClose = () => setVerifyShow(false);
    const verifyHandleShow = () => setVerifyShow(true);

    //turns on and off form modal
    const editFormHandleClose = () => setShowEditForm(false)
    const editFormHandleShow = () => {
        setShowEditWarn(false)
        setShowEditForm(true)
    }

    const editButtonClick = () => {
        editHandleShow()
    }

    const verifyButtonClick = () => {
        verifyHandleShow()
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
    if(account === "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
            return (
            
                <div className="clockMeta">
                    {alertMaker()}
                    <div className="clockBody">
                        <div>
                            <Modal show={showEditWarn} onHide={editHandleClose} centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>Warning</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <p>
                                        All information saved to the account will be stored publically on the blockchain. 
                                    </p>
                                    <p>
                                        This will help subscribers verify your information but your account will no longer be anonymous.
                                    </p>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onClick={editHandleClose}>Close</Button>
                                    <Button variant="primary" onClick={editFormHandleShow}>Continue</Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div>
                            <Modal show={verifyShow} size="xl" onHide={verifyHandleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Verify Domain</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>Create the following domain record: 
                                    <p></p> Step 1: Use the copy button below to copy the hash 
                                    <p></p> {String(signMessageData).slice(0,85)}<br></br>{String(signMessageData).slice(86,170)}
                                    <p></p> Step 2: Create a new txt record at your domain registrar name "ct"
                                    <p></p> Step 3: Paste hash into data field of new record
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="primary" 
                                    onClick={() => {
                                        navigator.clipboard.writeText(signMessageData)
                                        setIsDisabled(true)
                                        setCopyTitle("Copied")
                                    }}
                                    disabled = {isDisabled}
                                    >
                                        {copyTitle}
                                    </Button>
                                    <Button variant="secondary" onClick={verifyHandleClose}>
                                        Close
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                        <div>
                            <Modal show={showEditForm} size="xl" onHide={editFormHandleClose}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Edit Account</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <EditAccountForm
                                        description = {description}
                                        domain = {domain}
                                        url = {url}
                                        company = {company}

                                        setDescription = {setDescription}
                                        setDomain = {setDomain}
                                        setUrl = {setUrl}
                                        setCompany = {setCompany}

                                        setAlert = {setAlert}
                                        setAlertText = {setAlertText}
                                    />
                                </Modal.Body>
                            </Modal>
                        </div>
                        <div>  
                            <div>
                            <Card>
                                <Card.Body>
                                    <Card.Title> <Avatar
                                            size={75}
                                            name={account}
                                            variant="pixel"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                    />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{account}
                                    </Card.Title>
                                    <Stack gap={3}>
                                    <Row>

                                    </Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <ListGroup.Item variant="primary">Status</ListGroup.Item>
                                                <ListGroup.Item variant="warning">Domain Unverified</ListGroup.Item>
                                            </ListGroup>
                                        </Col>
                                    <Row>
                                        <Col>
                                            <Stack gap={3}>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Description</ListGroup.Item>
                                                    <ListGroup.Item>Blah Blah</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Company</ListGroup.Item>
                                                    <ListGroup.Item>Blah Blah</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>  
                                        </Col>
                                        <Col>
                                            <Stack gap={3}>     
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">URL</ListGroup.Item>
                                                    <ListGroup.Item>Blah Blah</ListGroup.Item>
                                                </ListGroup>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Domain</ListGroup.Item>
                                                    <ListGroup.Item>Blah Blah</ListGroup.Item>
                                                </ListGroup>
                                            </Stack>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info" onClick = {() => editButtonClick()}>Edit Details</Button>
                                            </ListGroup>
                                        </Col>
                                        <Col>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info" onClick={async () => {
                                                    signMessage()
                                                }}>Verify Domain</Button>
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                    </Stack>
                                </Card.Body>
                            </Card>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } 
}

export default Account