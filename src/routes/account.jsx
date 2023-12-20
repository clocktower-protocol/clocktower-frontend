import { useOutletContext } from "react-router-dom";
import React, {useEffect, useState, useAccount} from 'react'
import {Alert, Row, Col, Container, Card, ListGroup, Button, Stack} from 'react-bootstrap';
import Avatar from "boring-avatars"


const Account = () => {

    //const { address, connector: activeConnector } = useAccount()

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const [alertType, setAlertType] = useState("danger")
    const [avatarText, setAvatarText] = useState("")

    useEffect(() => {

        setAvatarText(account)
        
    },[account])

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
                                            <ListGroup horizontal={'lg'}>
                                                <ListGroup.Item variant="primary">Domain</ListGroup.Item>
                                                <ListGroup.Item>Blah Blah</ListGroup.Item>
                                            </ListGroup>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info">Verify Domain</Button>
                                            </ListGroup>
                                            <ListGroup horizontal={'lg'}>
                                                <ListGroup.Item variant="primary">URL</ListGroup.Item>
                                                <ListGroup.Item>Blah Blah</ListGroup.Item>
                                            </ListGroup>
                                            <ListGroup horizontal={'lg'}>
                                                <ListGroup.Item variant="primary">Status</ListGroup.Item>
                                                <ListGroup.Item variant="success">Domain Verified</ListGroup.Item>
                                            </ListGroup>
                                            <ListGroup horizontal={'lg'}>
                                                <Button variant="outline-info">Edit Details</Button>
                                            </ListGroup>
                                            </Stack>
                                           
                                        </Col>
                                    </Row>
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