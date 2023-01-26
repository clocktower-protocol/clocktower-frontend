import React from 'react';
import { Navbar, Container, Nav, Button, NavDropdown} from 'react-bootstrap';


const ClockNav = (props) => {

    return (
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
          <Container key="navContainer" className="clockNav">
            <Navbar.Brand key="navTitle" href="#home">Clocktower</Navbar.Brand>
            <Nav key="subnav">
              <NavDropdown title="Subscriptions" id="nav-sub">
                <NavDropdown.Item eventKey="4.1">Provider Dashboard</NavDropdown.Item>
                <NavDropdown.Item eventKey="4.2">Subscriber Dashboard</NavDropdown.Item>
                <NavDropdown.Item eventKey="4.3">Subscriptions</NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav key="futnav">
              <Nav.Link href="#futurepayments">Future Payments</Nav.Link>
            </Nav>
            <Nav key="nav" className="topNav">
              {props.buttonClicked ? (<Navbar.Brand>Account: {props.account}</Navbar.Brand>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => props.walletButtonClick()}>Sign in Wallet</Button>)}
              {/*
              <Button variant="outline-success" onClick={this.connectWallet}>Sign in Wallet</Button>
              */}
            </Nav>
          </Container>
        </Navbar>
    )

}

export default ClockNav