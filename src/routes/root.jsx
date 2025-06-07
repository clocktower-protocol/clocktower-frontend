import {React, useState, useEffect, useCallback} from 'react';
import { Navbar, Container, Nav, Button, Row, Col, Modal, Stack, Alert, NavDropdown} from 'react-bootstrap';
import { Outlet, useNavigate, useLocation, Link } from "react-router";
import {ADMIN_ACCOUNT} from "../config"
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'
import { CHAIN_LOOKUP, WALLET_LOOKUP } from '../config';
import Icon from '../components/Icon'
import { v4 as uuidv4 } from 'uuid';
import styles from '../css/clocktower.module.css';
import ThemeToggle from '../components/ThemeToggle';
//import {fetchToken} from '../clockfunctions'


import { useAccount, useConnect, useAccountEffect, useWatchPendingTransactions, useSwitchChain} from 'wagmi'
import { apolloClient, createApolloClient } from '../apolloclient';
import { ApolloProvider } from '@apollo/client';


const Root = () => {

    const {address, isConnected, isDisconnected, chainId } = useAccount({config})
    const [client, setClient] = useState(() => createApolloClient(chainId));

    useEffect(() => {
        if (chainId) {
            setClient(createApolloClient(chainId));
        }
    }, [chainId]);

    
    const { chains, switchChain } = useSwitchChain()

    //const chainId = useChainId();

    //gets current url
    const location = useLocation();

    const [account, setAccount] = useState("")
  
    const [loggedIn, setLoggedIn] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    const [ selectedChain, setSelectedChain] = useState(0)

    //const [jwt, setJwt] = useState(sessionStorage.getItem("clockAccess"))

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

    //console.log(chainId)
    
    //gets supported chains
    const supportedChainIds = config.chains.map(chain => chain.id);

    /*
    //checks for jwt change
    useEffect(() => {
      async function getToken() {
        await fetchToken()
      }
      getToken()
      setJwt(sessionStorage.getItem("clockAccess"))
      console.log("SET JWT")

    },[jwt])
    */

    //checks for account change
    
    useEffect(() => {


      //|| location.pathname.slice(0,8) !== "/history"
     
      setAccount(address)
      //address reset
      if(address !== undefined && address !== account){
        
        //checks does not redirect if user is accessing public link address or is back button on etherscan transactions
        setLoggedIn(true)
        if((location.pathname.slice(0,20) !== "/public_subscription") && (location.pathname.slice(0,8) !== "/history")) {
          accountSwitch(address)
        }
    
      }
    }, [address, chains, accountSwitch, location, account])
    
 
  const adminAccount = ADMIN_ACCOUNT
    

  const walletButtonClick = () => {
    handleShow()
  }

  const changeChain = function (chain_id) {

    switchChain({ chainId: chain_id })

    
    CHAIN_LOOKUP.map((lchain,  index) => {
      if(lchain.id === chain_id){
        return setSelectedChain(index)
      } else {
        return ""
      }
    })


  }
  
  //makes sure user is on approved chain
   return (
        <ApolloProvider client={client}>
        <div key={"root"}>
          <Modal show={showWalletChoice} onHide={handleClose} className={styles.wallet_modal} >
          <Modal.Header closeButton>
            <Modal.Title className="w-100 text-center">Choose a Wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Stack gap={3}>
              {connectors.map((connector) => (
              <Row key={uuidv4()}  >
                  <Col key={uuidv4()} md="auto">
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
          <Navbar key="navBar" bg="dark" variant="dark" expand="lg" className={styles.navbar}>
            <Container fluid>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', height: '100%' }}>
                <div style={{ flex: '0 0 200px', display: 'flex', alignItems: 'center' }}>
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <Navbar.Brand key="navTitle" style={{ margin: 0, padding: 0 }}>
                      <div className={styles.clocktower_brand}>Clocktower</div>
                    </Navbar.Brand>
                  </Link>
                </div>
                <div style={{ flex: '1', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingLeft: '20px' }}>
                  <Button variant="outline-info" className={styles.account_button} onClick={handleOnClickAccount}>Account</Button>
                  <Button variant="outline-info" className={styles.subscriptions_button} onClick={handleOnClickSubscriptions}>Subscriptions</Button>
                  <Button variant="outline-info" className={styles.calendar_button} onClick={handleOnClickCalendar}>Calendar</Button>
                  {account === adminAccount && <Button variant="outline-info" style={{margin: "5px"}} onClick={handleOnClickAdmin}>Admin</Button>}
                </div>
                <div style={{ flex: '0 0 400px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', paddingRight: '20px' }}>
                  {chains.length > 1 ? 
                    <NavDropdown title={<span className={styles.chain_pulldown}>Chain: <Icon key={uuidv4()} icon={CHAIN_LOOKUP[selectedChain].icon}></Icon> {CHAIN_LOOKUP[selectedChain].displayName} </span>} id="basic-nav-dropdown" style={{ marginRight: 'auto' }}>
                      {chains.map((chain) => (
                        <NavDropdown.Item key={uuidv4()} className={styles.chain_pulldown2}>
                          {CHAIN_LOOKUP.map((lchain) => {
                            if(lchain.id === chain.id){
                              return <Icon key={uuidv4()} className={styles.chain_icon} icon={lchain.icon}></Icon>
                            } else {
                              return ""
                            }
                          })}
                          <Button variant="outline-info" key={chain.id} onClick={() => changeChain(chain.id)}> 
                            { chain.name }
                          </Button>
                        </NavDropdown.Item>
                      ))}
                    </NavDropdown>
                    : 
                    <Navbar.Text style={{ margin: 0, whiteSpace: 'nowrap', marginRight: 'auto' }}>
                      <span className={styles.chain_pulldown}>Chain: <Icon key={uuidv4()} icon={CHAIN_LOOKUP[0].icon}></Icon> {CHAIN_LOOKUP[0].displayName} </span>
                    </Navbar.Text>
                  }
                  <ThemeToggle />
                  <Nav key="nav" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                    {isConnected && !isDisconnected ? 
                      (<Navbar.Text className={styles.account_text_nav} style={{ margin: 0 }}>Account: {address.slice(0,5)+"..."+address.slice(37, 42)}</Navbar.Text>) 
                      : 
                      (<Button variant="outline-success" className={styles.wallet_button} onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)
                    }
                  </Nav>
                </div>
              </div>
            </Container>
          </Navbar>
          </div>
        <div key={"mainDiv"} id="detail" className="mainDiv">
          
          {!isConnected ? (
            <Alert align="center" variant="info" className={styles.connect_wallet_alert}>Please Connect Wallet</Alert>
          ) : supportedChainIds.includes(chainId) ? (
            <Outlet context={[account]}/>
          ) : (
            <div className="alertDiv">
              <Alert variant="danger" align="center">Please Connect Back to Supported Chain</Alert>
            </div>
          )}
        
        </div>
    </div>
  </ApolloProvider>
  )


}

export default Root
