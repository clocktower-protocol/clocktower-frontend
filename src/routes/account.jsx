import { useOutletContext } from "react-router-dom";
import React, {useEffect, useState, useAccount} from 'react'
import {Alert, Row, Col, Container, Card, ListGroup, Button, Stack, Modal} from 'react-bootstrap';
import Avatar from "boring-avatars"


const Account = () => {

    //const { address, connector: activeConnector } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const [alertType, setAlertType] = useState("danger")
    const [showEditWarn, setShowEditWarn] = useState(false);

    const editHandleClose = () => setShowEditWarn(false);
    const editHandleShow = () => setShowEditWarn(true);

    const editButtonClick = () => {
        editHandleShow()
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
                                    While this will help subscribers to verify your information your account will no longer be anonymous.
                                </p>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={editHandleClose}>Close</Button>
                                <Button variant="primary">Continue</Button>
                            </Modal.Footer>
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
                                        <Col>
                                            <Stack gap={3}>
                                                <ListGroup horizontal={'lg'}>
                                                    <ListGroup.Item variant="primary">Status</ListGroup.Item>
                                                    <ListGroup.Item variant="warning">Domain Unverified</ListGroup.Item>
                                                </ListGroup>
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
                                                <Button variant="outline-info">Verify Domain</Button>
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