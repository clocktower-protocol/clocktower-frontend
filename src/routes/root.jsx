import {React, useState, useEffect, useCallback} from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Modal, Stack, Alert, NavDropdown, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet, useNavigate, useLocation} from "react-router-dom";
import {ADMIN_ACCOUNT} from "../config"
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'
import { CHAIN_LOOKUP, WALLET_LOOKUP } from '../config';
import Icon from '../components/Icon'
import { v4 as uuidv4 } from 'uuid';
import styles from '../css/clocktower.module.css';


import { useAccount, useConnect, useAccountEffect, useWatchPendingTransactions, useSwitchChain} from 'wagmi'

const Root = () => {

    const {address, isConnected, isDisconnected } = useAccount({config})

    
    const { chains, switchChain } = useSwitchChain()

    //gets current url
    const location = useLocation();

    const [account, setAccount] = useState("")
  
    const [loggedIn, setLoggedIn] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    const { selectedChain, setSelectedChain} = useState(CHAIN_LOOKUP[0])

    //functions for links
    const navigate = useNavigate();
    const handleOnClickCalendar = useCallback(() => navigate('/calendar', {replace: true}), [navigate])
    const handleOnClickAccount = () => {navigate('/account/'+ account, {replace: true})}
    const handleOnClickSubscriptions = useCallback(() => navigate(`/subscriptions/created`, {replace: true}), [navigate]);
    const handleOnClickAdmin = useCallback(() => navigate('/admin', {replace: true}), [navigate]);
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
      }
    })

    const { connect, connectors, isLoading, pendingConnector } = useConnect({config})

    //checks for account change
    
    useEffect(() => {
     
      setAccount(address)
      //address reset
      if(address !== undefined && address !== account){
        //checks/resets token
        //await fetchToken()
        setLoggedIn(true)
        if(location.pathname.slice(0,20) !== "/public_subscription") {
          accountSwitch(address)
        }
        //accountSwitch(address)
      }
    }, [address, chains, accountSwitch, location, account])
    
 
  const adminAccount = ADMIN_ACCOUNT
    

  const walletButtonClick = () => {
    handleShow()
  }

  
   return (
        <>
        <div key={"root"}>
          <Modal show={showWalletChoice} onHide={handleClose} className={styles.wallet_modal} >
          <Modal.Header closeButton>
            <Modal.Title>Choose a Wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Stack gap={3}>
              {connectors.map((connector) => (
              <Row key={uuidv4()}  >
                  <Col key={uuidv4()} md="auto" >
                    {
                      WALLET_LOOKUP.map((lWallet) => {
                          if(lWallet.id === connector.id){
                            return <Icon key={uuidv4()} icon={lWallet.icon}></Icon>
                          } else {
                            return ""
                          }
                      })
                    }
                  </Col>
                  <Col key={uuidv4()} >
                    <Button 
                      style={{width:"100%"}}
                      variant="info"
                      key={uuidv4()}
                      onClick={() => {
                      connect({connector})
                      handleClose()
                      }}
                    >
                      {connector.name}
                      {
                      }
                      {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'
                      }
                    </Button>
                  </Col>
              </Row>
              ))}
              </Stack>
            </Container>
          </Modal.Body>
         
        </Modal>
        </div>
        <div key={"topDiv"}>
          <div key={"navBarKey"} className="navBar">
          <Navbar key="navBar" bg="dark" variant="dark" expand="lg" className={styles.navbar} >
            <Container key="navContainer1" style={{width: "250px"}}>
              <LinkContainer to="/" style={{paddingLeft: "20px"}}>
                <Navbar.Brand key="navTitle"><div className={styles.clocktower_brand}>Clocktower</div></Navbar.Brand>
              </LinkContainer>
            </Container>
            <Container style={{justifyContent: "flex-start"}}>
              <Button variant="outline-info" className={styles.account_button} onClick={handleOnClickAccount}>Account</Button>{' '}
              <Button variant="outline-info" className={styles.subscriptions_button} onClick={handleOnClickSubscriptions}>Subscriptions</Button>{' '}
              <Button variant="outline-info" className={styles.calendar_button} onClick={handleOnClickCalendar}>Calendar</Button>{' '}
              {account === adminAccount ?
              <Button variant="outline-info"  style={{margin: "5px"}} onClick={handleOnClickAdmin}>Admin</Button>
              : ""}
            </Container>
            <Container key="navContainer" style={{justifyContent:"flex-end", gap:"50px"}}>
                  {chains.length > 1 ? 
                  <NavDropdown title={<span className={styles.chain_pulldown}><Icon icon={CHAIN_LOOKUP[1].icon}></Icon> {chains[1].name} </span>} id="basic-nav-dropdown">
                    {chains.map((chain) => (
                        <NavDropdown.Item>
                    
                          {CHAIN_LOOKUP.map((lchain) => {
                            if(lchain.id === chain.id){
                              return <Icon icon={lchain.icon}></Icon>
                            } else {
                              return ""
                            }
                          })
                          }
                          
                          <Button variant="outline-info" key={chain.id} onClick={() => switchChain({ chainId: chain.id }) }>
                            { chain.name }
                          </Button>
                        </NavDropdown.Item>
                      ))}
                  </NavDropdown>
                  : 
                    <OverlayTrigger
                      placement="left"
                      delay={{ show: 250, hide: 400 }}
                      overlay={
                        <Tooltip id={`tooltip-1`}>
                            {CHAIN_LOOKUP[0].displayName}
                        </Tooltip>
                      }
                    >
                    <Navbar.Text>
                      <Icon icon={CHAIN_LOOKUP[0].icon}></Icon>
                    </Navbar.Text>
                    </OverlayTrigger>
                 }
                  
                  <Nav key="nav">
                    {isConnected && !isDisconnected ? (<Navbar.Text className={styles.account_text_nav}>Account: {address.slice(0,5)+"..."+address.slice(37, 42)}</Navbar.Text>) : (<Button variant="outline-success" className={styles.wallet_button} onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
                  </Nav>
              </Container>
      </Navbar>
      </div>
        <div key={"mainDiv"} id="detail" className="mainDiv">
          
          {!loggedIn? <Alert align="center" variant="info" className={styles.connect_wallet_alert}>Please Connect Wallet</Alert>: <Outlet context={[account]}/>}
        
        </div>
    </div>
  </>
  )

}

export default Root
