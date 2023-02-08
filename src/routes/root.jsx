import {React, useState} from 'react';
import { Navbar, Container, Nav, Button, NavDropdown} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'
import { Outlet} from "react-router-dom";
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"
import Web3 from 'web3'

const Root = () => {

    const [buttonClicked, setButtonClicked] = useState(false)
    const [account, setAccount] = useState("-1")
    const [alertText, setAlertText] = useState("")
    const [alert, setAlert] = useState(false)

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
   // const clocktowersub = new web3.eth.Contract(CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS)
    const adminAccount = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    
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

  const walletButtonClick = () => {
    connectWallet();
    setButtonClicked(true)
  }

  //checks if user is logged in 
  const isLoggedIn = () => {
    return(account === "-1" ? false : true) 
  }

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