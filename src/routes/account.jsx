import { useOutletContext } from "react-router-dom";
import React, {useEffect, useState, useAccount} from 'react'
import {Alert, Row, Col, Container} from 'react-bootstrap';
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
                                <Container>
                                    <Row>
                                        <Col>
                                        <Avatar
                                            size={75}
                                            name={account}
                                            variant="ring"
                                            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                        />
                                        </Col>
                                        <Col>
                                            {account}
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } 
}

export default Account