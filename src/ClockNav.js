import React from 'react';
import { Navbar, Container, Nav, Button} from 'react-bootstrap';


const ClockNav = (props) => {

    return (
        <Navbar key="navBar" bg="dark" variant="dark" expand="lg">
          <Container key="navContainer" className="clockNav">
            <Navbar.Brand key="navTitle" href="#home">Clocktower</Navbar.Brand>
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