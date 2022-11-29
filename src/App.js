import React, { Component } from 'react'
import { Form, Navbar, Container, Nav, Button, Table, H1 } from 'react-bootstrap';
import Web3 from 'web3'
import './App.css';
import {ClOCKTOWER_ABI, CLOCKTOWER_ADDRESS} from "./config"; 

class App extends Component {



  componentWillMount() {
    //const web3 = new Web3("http://localhost:8545")
    //this.loadBlockchainData()
  }

  
  async loadBlockchainData() {
    //connects to hardhat network and sets the default state
    const web3 = new Web3("http://localhost:8545")
    this.setState({web3: web3})
    //const accounts = await web3.eth.getAccounts()
    //this.setState({ account: accounts[0] })

    //gets contract interface
    //const clocktower = new web3.eth.Contract(ClOCKTOWER_ABI, CLOCKTOWER_ADDRESS);
    //this.setState({clocktower});
  }

  async connectWallet() {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask!");
        return;
      }

      console.log(
        "connectWallet called"
      )

      
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const web3 = new Web3("http://localhost:8545")
     // const accounts = await web3.ethereum.getAccounts()


      this.setState({account: accounts[0]})

       //gets contract interface
      const clocktower = new web3.ethereum.Contract(ClOCKTOWER_ABI, CLOCKTOWER_ADDRESS);
      this.setState({clocktower});

      console.log("Connected", accounts[0]);

      //this.state.clicked = true;

    } catch (error) {
      console.log(error);
    }
  }
  

  constructor(props) {
    super(props)
    //hardhat test account
    this.state = { account: '' }
    this.state = {buttonClicked: false}
    this.connectWallet = this.connectWallet.bind(this);
  }

  render() {
    return (
      <div className="clockMeta">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container className="clockNav">
            <Navbar.Brand href="#home">Clocktower</Navbar.Brand>
            <Nav className="topNav">
              {this.state.buttonClicked ? (<Navbar.Brand>Clicked</Navbar.Brand>) : (<Button variant="outline-success" className = "walletButton" onClick = {this.setState({buttonClicked: true}) }>Sign in Wallet</Button>)}
              {/*
              <Button variant="outline-success" onClick={this.connectWallet}>Sign in Wallet</Button>
              */}
            </Nav>
          </Container>
        </Navbar>
      <div className="clockBody">
        <div className="clockFormDiv">
          <Form className="mb-3">
          <Form.Group className="mb-3" controlId="formAddress">
            <Form.Label>Address to Send to:</Form.Label>
            <Form.Control type="input" placeholder="receiver" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDate">  
            <Form.Label>Date:</Form.Label>
            <Form.Control type="input" placeholder="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formAmount">
            <Form.Label>Amount:</Form.Label>
            <Form.Control type="input" placeholder="amount" />
          </Form.Group>
          <Button type="submit">Submit form</Button>
          </Form>
        </div>
        <div className="clockTableDiv">
          <Table striped bordered hover size="sm" className="clockTable">
            <thead>
              <tr align="center">
                <th>Receiver</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Cancel</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Mark</td>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>2</td>
                <td>Jacob</td>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <td>3</td>
                <td colSpan={2}>Larry the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    </div>
      /*
      <div className="container">
        <h1>Hello, World!</h1>
        <p>Your account: {this.state.account}</p>
      </div>
      */
    );
  }
}

export default App;
