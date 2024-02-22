import {React, useState, useEffect, useCallback} from 'react';
import { Navbar, Container, Nav, Button, Row, Modal, Stack, Alert} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet, useNavigate} from "react-router-dom";
import {ADMIN_ACCOUNT} from "../config"
import {config} from '../wagmiconfig'
import axios from 'axios'
import {jwtDecode} from 'jwt-decode'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
//import Web3 from 'web3'

import { useAccount, useConnect, useConnectors, useAccountEffect, useConnectorClient, useConnections} from 'wagmi'

dayjs.extend(utc)

const Root = () => {

    const {connector: activeConnector, address, isConnected, isDisconnected } = useAccount({config})

    //const [buttonClicked, setButtonClicked] = useState(false)
    const [account, setAccount] = useState("")
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)
    const [loggedIn2, setLoggedIn2] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    //functions for links
    const navigate = useNavigate();
    //const handleOnClickProv = useCallback(() => navigate('/provider', {replace: true}), [navigate])
    //const handleOnClickSub = useCallback(() => navigate('/subscriberdash', {replace: true}), [navigate])
    const handleOnClickCalendar = useCallback(() => navigate('/calendar', {replace: true}), [navigate])
    const handleOnClickAccount = () => {navigate('/account/'+ account, {replace: true})}
    const handleOnClickAdmin = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
    //const sendToAccountPage = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
    const accountSwitch = useCallback((passedAddress) => navigate('/account/'+passedAddress), [navigate])
    const linkToMain = useCallback(() => navigate('/', {replace: true}), [navigate])

    //gets connections from wagmiconfig
    //const connectors2 = useConnectors()
    
    /*
    //checks local storage for current jwt if empty fetchs token
    useEffect(() => {

      //if empty
      if(localStorage.getItem("clockAccess") === null) {
        console.log("not set")
        /*
        let config = {
          headers: {
            'Access-Control-Allow-Origin': 'http://localhost:3000'
            }
        }
        */
    /*
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
    */

    const fetchToken = () => {
       //if empty
       if(localStorage.getItem("clockAccess") === null) {
        console.log("not set")
    
        let data = {
          "id": 4
         }
        //gets token
        axios.post('http://138.197.26.60:3000/api/requesttoken', data, {headers: {
          'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          console.log(response.data.token);
          //stores token in local storage
          localStorage.setItem("clockAccess", response.data.token)
          console.log("token set")
        })
        .catch(function (error) {
          console.log(error);
        })
      } else {
        //checks if its expired
        const savedToken = localStorage.getItem("clockAccess")
        const decodedToken = jwtDecode(savedToken)
        console.log("current utc time  " + dayjs().utc().unix())
        console.log("token expiry  " + decodedToken.exp)
        console.log("difference  " + (decodedToken.exp - dayjs().utc().unix()))
        console.log(decodedToken)
        console.log("got existing token")
      }
    }
    

    const handleClose = () => {
      setShowWalletChoice(false);
    }
    const handleShow = () => setShowWalletChoice(true);

    //WAGMI
    
    //const {connector: activeConnector, address, isConnected } = useAccount()

    //const connections = useConnections()


    useAccountEffect({config, 
      onConnect() {
        console.log('Connected!')
      },
      onDisconnect() {
        console.log('Disconnected!')
        setLoggedIn2(false)
        linkToMain()
      },
    })

    const { connect, connectors, isLoading, pendingConnector } = useConnect({config})

    //checks for account change
    
    useEffect(() => {
     
      console.log("address loop")
      setAccount(address)
      ///address reset
      if(address !== undefined){
        console.log("address empty here")
        setLoggedIn2(true)
        accountSwitch(address)
      }
      
      
    }, [address])
    

    /*
    useEffect(() => {
      if(address == undefined) {
        setAccount(address)
        linkToMain()
      } else {
        setAccount(address)
        accountSwitch()
      }

    },[account])
    */
    

    /*
    //checks for change in connection status
    useEffect(() => {
      if(isDisconnected) {
        console.log("disconnected")
      }
      if(isConnected) {
        console.log("connected!!")
      }
    }, [isDisconnected, isConnected])
    */

    /*
    //sends to account page once logged in
    useEffect(() => {
      if(typeof address !== "undefined") {
        setAccount(address)
        console.log(address)
        handleOnClickAccount()
      } else {
        linkToMain()
      }
    }, [loggedIn])
    */
    

    
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
                    //disabled={!connector2.ready}
                    key={connector.id}
                    onClick={() => {
                    console.log(connector)
                    //connect({ connector2 })
                    connect({connector})
                    handleClose()
                    }}
                  >
                    {connector.name}
                    {//!connector2.ready && ' (unsupported)'
                    }
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      ' (connecting)'
                    }
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
            {isConnected && !isDisconnected ? (<Navbar.Text>Account: {address}</Navbar.Text>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
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
            <Button variant="outline-info" onClick={fetchToken}>Fetch Token</Button>{' '}
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
          
          {!loggedIn2? <Alert align="center" variant="info">Please Connect Wallet</Alert>: <Outlet context={[account, alertText, setAlertText, alert, setAlert, isLoggedIn]}/>}
        
        </div>
      </div>
    </div>
  </>
  )

}

export default Root
