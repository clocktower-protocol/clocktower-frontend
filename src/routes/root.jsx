import {React, useState, useEffect} from 'react';
import { Navbar, Container, Nav, Button, NavDropdown, Row, Modal, Stack} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet} from "react-router-dom";
import {ADMIN_ACCOUNT} from "../config"
//import Web3 from 'web3'

import { useAccount, useConnect } from 'wagmi'

const Root = () => {

    const [buttonClicked, setButtonClicked] = useState(false)
    const [account, setAccount] = useState("-1")
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)

    const [showWalletChoice, setShowWalletChoice] = useState(false);

    const handleClose = () => setShowWalletChoice(false);
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
      },
      onError(error) {
        console.log('Error', error)
      },
    })

    //checks for account change
    useEffect(() => {
      
      setAccount(address)
    
    }, [address])

    
    //creates contract variable
   // const web3 = new Web3("http://localhost:8545")
   // const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS)
    const adminAccount = ADMIN_ACCOUNT
    
    /*
    //connects to metamask wallet
    const connectWallet = async () => {
        try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Please install MetaMask!");
            return;
        }
        
        const accounts = await ethereum.request({
            method: "eth_requestAccounts",
        });

        //NOTE doesn't get account transactions like original function
        setAccount(web3.utils.toChecksumAddress(accounts[0]))

        console.log("Connected", accounts[0]);

        //checks for change of account or change of chain
        window.ethereum.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
            //reloads connection upon wallet change
            connectWallet()
            return
            } else {
            setAccount("-1")
            setButtonClicked(false)
            console.log("Logged Out")
            }
        });

        //checks if chain has changed (only currently allows hardhat network)
        window.ethereum.on("chainChanged", (chainId) => {
            if (chainId !== 31337) {
        
            setAlertText("Clocktower currently only works on Hardhat Network. Please switch back")
            setAlert(true)
            setAccount("-1")
            setButtonClicked(false)
            return
            } else {
            connectWallet()
            setAlert(false)
            return
            }
        });

        } catch (error) {
        console.log(error);
        }
  }

  */

  const walletButtonClick = () => {
    handleShow()
  }

  const injectedButtonClick = () => {
    connect()
    setButtonClicked(true)
    handleClose()
  }

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
              {/*
              <Nav key="subnav">
                <NavDropdown title="Subscriptions" id="nav-sub">
                  <LinkContainer to="/provider">
                    <NavDropdown.Item eventKey="4.1">Provider Dashboard</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/subscriberdash">
                    <NavDropdown.Item eventKey="4.2">Subscriber Dashboard</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item eventKey="4.3">Subscriptions</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav key="futnav">
                <LinkContainer to="/payments">
                  <Nav.Link>Future Payments</Nav.Link>
                </LinkContainer>
              </Nav>
              {account == adminAccount ?
              <Nav key="adminnav">
                <LinkContainer to="/admin">
                  <Nav.Link>Admin</Nav.Link>
                </LinkContainer>
              </Nav>
              : ""
              }   
            */}

            <Container key="navContainer" className="clockNav2">
            <Row></Row>
            <Row>
          <Nav key="nav">
            {isConnected ? (<Navbar.Text>Account: {address}</Navbar.Text>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
            {/*
            <Button variant="outline-success" onClick={this.connectWallet}>Sign in Wallet</Button>
            */}
          </Nav>
          </Row>
        </Container>
      </Navbar>
      </div>
      <div className="sideNav">
        <div className="sideNav2">
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
        <Nav defaultActiveKey="/home" className="flex-column">
          <NavDropdown title="Subscriptions" id="nav-sub">
            <LinkContainer to="/provider">
              <NavDropdown.Item eventKey="4.1">Provider Dashboard</NavDropdown.Item>
            </LinkContainer>
            <LinkContainer to="/subscriberdash">
              <NavDropdown.Item eventKey="4.2">Subscriber Dashboard</NavDropdown.Item>
            </LinkContainer>
            {/*
              <NavDropdown.Item eventKey="4.3">Subscriptions</NavDropdown.Item>
          */}
          </NavDropdown>
          {/*
          <LinkContainer to="/payments">
            <Nav.Link>Future Payments</Nav.Link>
          </LinkContainer>
          */}
        {account == adminAccount ?
        
          <LinkContainer to="/admin">
            <Nav.Link>Admin</Nav.Link>
          </LinkContainer>
        : ""}   
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


    return (
        <>
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
          <Container key="navContainer" className="clockNav">
            <LinkContainer to="/">
              <Navbar.Brand key="navTitle">Clocktower</Navbar.Brand>
            </LinkContainer>
            <Nav key="subnav">
              <NavDropdown title="Subscriptions" id="nav-sub">
                <LinkContainer to="/provider">
                  <NavDropdown.Item eventKey="4.1">Provider Dashboard</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/subscriberdash">
                  <NavDropdown.Item eventKey="4.2">Subscriber Dashboard</NavDropdown.Item>
                </LinkContainer>
                {/*
                <NavDropdown.Item eventKey="4.3">Subscriptions</NavDropdown.Item>
                */}
              </NavDropdown>
            </Nav>
            {/*
            <Nav key="futnav">
              <LinkContainer to="/payments">
                <Nav.Link>Future Payments</Nav.Link>
              </LinkContainer>
            </Nav>
            */}
            {account == adminAccount ?
            <Nav key="adminnav">
              <LinkContainer to="/admin">
                <Nav.Link>Admin</Nav.Link>
              </LinkContainer>
            </Nav>
            : ""
            }   
            <Nav key="nav" className="topNav">
              {buttonClicked ? (<Navbar.Text>Account: {account}</Navbar.Text>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => walletButtonClick()}>Sign in Wallet</Button>)}
              {/*
              <Button variant="outline-success" onClick={this.connectWallet}>Sign in Wallet</Button>
              */}
            </Nav>
          </Container>
        </Navbar>
            <div id="detail">
              <Outlet context={[account, alertText, setAlertText, alert, setAlert, isLoggedIn]}/>
            </div>
      </>
    )

}

export default Root

/*
import ClockNavNew from '../ClockNavNew.js';
import { Outlet} from "react-router-dom";

export default function Root() {
    return (
    <>
        <ClockNavNew />
        <div id="detail">
            <Outlet />
        </div>
    </>
    )
};
*/