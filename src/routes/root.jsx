import {React, useState, useEffect, useCallback} from 'react';
import { Navbar, Container, Nav, Button, Row, Modal, Stack, Alert, NavDropdown} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet, useNavigate, useLocation} from "react-router-dom";
import {ADMIN_ACCOUNT} from "../config"
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'
import { CHAIN_LOOKUP } from '../config';
import Icon from '../components/Icon'
//import '../App.css'

//images
//import {ReactComponent as HardhatLogo} from "../images/hardhat.svg"

import { useAccount, useConnect, useAccountEffect, useWatchPendingTransactions, useChains, useChainId, useSwitchChain} from 'wagmi'

const Root = () => {

    const {connector: activeConnector, address, isConnected, isDisconnected } = useAccount({config})

    //const chains = useChains({config})
    //const chainId = useChainId({config})
    const { chains, switchChain } = useSwitchChain()

    //gets current url
    const location = useLocation();

    //const [buttonClicked, setButtonClicked] = useState(false)
    const [account, setAccount] = useState("")
    //const [alertText, setAlertText] = useState("")
    //const [alert, setAlert] = useState(false)
    //const [loggedIn, setLoggedIn] = useState(false)
    const [loggedIn, setLoggedIn] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    //functions for links
    const navigate = useNavigate();
    const handleOnClickCalendar = useCallback(() => navigate('/calendar', {replace: true}), [navigate])
    const handleOnClickAccount = () => {navigate('/account/'+ account, {replace: true})}
    const handleOnClickAdmin = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
    //const sendToAccountPage = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
    const accountSwitch = useCallback((passedAddress) => navigate('/account/'+passedAddress), [navigate])
    const linkToMain = useCallback(() => navigate('/', {replace: true}), [navigate])


    const handleClose = () => {
      setShowWalletChoice(false);
    }
    const handleShow = () => setShowWalletChoice(true);

    //WAGMI
   
    useAccountEffect({config, 
      onConnect() {
        console.log('Connected!')
      },
      onDisconnect() {
        console.log('Disconnected!')
        setLoggedIn(false)
        linkToMain()
      },
    })

    useWatchPendingTransactions({
      onError(error) { 
        console.log('Error', error) 
      }, 
      onTransactions(transactions) {
        console.log('New transactions!', transactions)
      },
    })

    const { connect, connectors, isLoading, pendingConnector } = useConnect({config})

    //checks for account change
    
    useEffect(() => {
     
      console.log(chains)
      console.log("address loop")
      setAccount(address)
      //address reset
      if(address !== undefined){
        //checks/resets token
        fetchToken()
        setLoggedIn(true)
        if(location.pathname.slice(0,20) !== "/public_subscription") {
          accountSwitch(address)
        }
        //accountSwitch(address)
      }
      console.log(location.pathname.slice(0,20))
    }, [address])
    
 
  const adminAccount = ADMIN_ACCOUNT
    

  const walletButtonClick = () => {
    handleShow()
  }


  /*
  //checks if user is logged in 
  const isLoggedIn = () => {
    return(account === "-1" ? false : true) 
  }
  */
  

  
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
          <Navbar key="navBar" bg="dark" variant="dark" expand="lg" >
            <Container key="navContainer1">
              <LinkContainer to="/">
                <Navbar.Brand key="navTitle">Clocktower</Navbar.Brand>
              </LinkContainer>
            </Container>
            <Container key="navContainer" style={{justifyContent:"flex-end", gap:"50px"}}>
                  {chains.length > 1 ? 
                  <NavDropdown title={chains[0].name} id="basic-nav-dropdown">
                    {chains.map((chain) => (
                        <NavDropdown.Item>
                    
                          {CHAIN_LOOKUP.map((lchain) => {
                            if(lchain.id === chain.id){
                              return <Icon icon={lchain.icon}></Icon>
                            }
                          })
                          }
                          
                          <Button variant="outline-info" key={chain.id} onClick={() => switchChain({ chainId: chain.id })}>
                            {chain.name}
                          </Button>
                        </NavDropdown.Item>
                      ))}
                  </NavDropdown>
                  : <Navbar.Text><Icon icon={CHAIN_LOOKUP[0].icon}></Icon></Navbar.Text>}
            
                  <Nav key="nav">
                    {isConnected && !isDisconnected ? (<Navbar.Text>Account: {address.slice(0,5)+"..."+address.slice(37, 42)}</Navbar.Text>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
                  </Nav>
              </Container>
      </Navbar>
      </div>
      <div className="sideNav">
        <div className="sideNav2">
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg" style={{justifyContent: "center"}}>
        <Nav defaultActiveKey="/home" className="flex-column">
          
          <div className='sideButtons'>
          <Stack gap={3}>
            <Button variant="outline-info" onClick={handleOnClickAccount}>Account</Button>{' '}
            <Button variant="outline-info" onClick={handleOnClickCalendar}>Calendar</Button>{' '}
            {account === adminAccount ?
            <Button variant="outline-info" onClick={handleOnClickAdmin}>Admin</Button>
            : ""}
          </Stack>
          </div>
        </Nav>
        </Navbar>
        </div>
        <div id="detail" className="mainDiv">
          
          {!loggedIn? <Alert align="center" variant="info">Please Connect Wallet</Alert>: <Outlet context={[account]}/>}
        
        </div>
      </div>
    </div>
  </>
  )

}

export default Root
