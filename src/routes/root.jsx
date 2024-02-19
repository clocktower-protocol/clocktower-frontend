import {React, useState, useEffect, useCallback} from 'react';
import { Navbar, Container, Nav, Button, Row, Modal, Stack} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet, useNavigate} from "react-router-dom";
import {ADMIN_ACCOUNT} from "../config"
import axios from 'axios'
//import Web3 from 'web3'

import { useAccount, useConnect } from 'wagmi'

const Root = () => {

    //const [buttonClicked, setButtonClicked] = useState(false)
    const [account, setAccount] = useState("-1")
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    //functions for links
    const navigate = useNavigate();
    //const handleOnClickProv = useCallback(() => navigate('/provider', {replace: true}), [navigate])
    //const handleOnClickSub = useCallback(() => navigate('/subscriberdash', {replace: true}), [navigate])
    const handleOnClickCalendar = useCallback(() => navigate('/calendar', {replace: true}), [navigate])
    const handleOnClickAccount = () => {navigate('/account/'+ account, {replace: true})}
    const handleOnClickAdmin = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
    //const sendToAccountPage = useCallback(() => navigate('/admin', {replace: true}), [navigate]);

    
    //checks local storage for current jwt if empty fetchs token
    useEffect(() => {

      //if empty
      if(localStorage.getItem("clockAccess") === null) {
        console.log("not set")
        let config = {
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000'
            }
        }

        let data = {
          "id": 4
         }
        //gets token
        axios.post('http://138.197.26.60:3000/api/createtoken', data)
        .then(function (response) {
          console.log(response.data);
          //stores token in local storage
          localStorage.setItem("clockAccess", response.data)
        })
        .catch(function (error) {
          console.log(error);
        })
      } else {
        console.log(localStorage.getItem("clockAccess"))
        console.log("set")
      }
    }, [])
    

    const handleClose = () => {
      setShowWalletChoice(false);
    }
    const handleShow = () => setShowWalletChoice(true);

    //WAGMI
    const {connector: activeConnector, address, isConnected } = useAccount({
      onConnect({ address, connector, isReconnected }) {
        console.log('Connected', { address, connector, isReconnected })
      },
    })

    const { connect, connectors, isLoading, pendingConnector } = useConnect({
      //connector: new InjectedConnector(),
      onSuccess(data) {
        console.log('Connect', data.account)
        setLoggedIn(true)
      },
      onError(error) {
        console.log('Error', error)
      },
    })

    //checks for account change
    useEffect(() => {
      
      setAccount(address)


    
    }, [address])

    
    //sends to account page once logged in
    useEffect(() => {
      if(typeof address !== "undefined") {
        handleOnClickAccount()
      }
    }, [loggedIn])
    

    
  const adminAccount = ADMIN_ACCOUNT
    

  const walletButtonClick = () => {
    handleShow()
  }

  /*
  const injectedButtonClick = () => {
    connect()
    //setButtonClicked(true)
    handleClose()
  }
  */

  //checks if user is logged in 
  const isLoggedIn = () => {
    return(account === "-1" ? false : true) 
  }

  
   return (
        <>
        <div>
          <Modal show={showWalletChoice} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Choose a Wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Stack gap={3}>
              {connectors.map((connector) => (
              <Row key={connector.id+1}>
                  <Button 
                    variant="info"
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => {connect({ connector })
                    handleClose()
                    }}
                  >
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      ' (connecting)'}
                  </Button>
              </Row>
              ))}
              </Stack>
            </Container>
          </Modal.Body>
         
        </Modal>
        </div>
        <div className="topDiv">
          <div className="navBar">
          <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
            <Container key="navContainer1" className="clockNav">
              <LinkContainer to="/">
                <Navbar.Brand key="navTitle">Clocktower</Navbar.Brand>
              </LinkContainer>
            </Container>
            <Container key="navContainer" className="clockNav2">
            <Row></Row>
            <Row>
          <Nav key="nav">
            {isConnected ? (<Navbar.Text>Account: {address}</Navbar.Text>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
          </Nav>
          </Row>
        </Container>
      </Navbar>
      </div>
      <div className="sideNav">
        <div className="sideNav2">
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
        <Nav defaultActiveKey="/home" className="flex-column">
          
          <div className='sideButtons'>
          <Stack gap={3}>
            <Button variant="outline-info" onClick={handleOnClickAccount}>Account</Button>{' '}
            <Button variant="outline-info" onClick={handleOnClickCalendar}>Calendar</Button>{' '}
            {/*
            <Button variant="outline-info" onClick={handleOnClickProv}>Provider Dash</Button>{' '}
            <Button variant="outline-info" onClick={handleOnClickSub}>Subscriber Dash</Button>{' '}
            */}
            {account === adminAccount ?
            <Button variant="outline-info" onClick={handleOnClickAdmin}>Admin</Button>
            : ""}
          </Stack>
          </div>
        </Nav>
        </Navbar>
        </div>
        <div id="detail" className="mainDiv">
          <Outlet context={[account, alertText, setAlertText, alert, setAlert, isLoggedIn]}/>
        </div>
      </div>
    </div>
  </>
  )

}

export default Root
