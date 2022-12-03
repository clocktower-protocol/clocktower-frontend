import React, { Component } from 'react'
import { Form, Navbar, Container, Nav, Button, Table, Row, Col } from 'react-bootstrap';
import Web3 from 'web3'
import './App.css';
import {CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS} from "./config"; 
import {HourSelect} from "./hourSelect.js";
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'

class App extends Component {
  
  //Metamask-----------------------------------------

  //changes wallet button based on status
  walletButtonClick() {
    this.connectWallet();
    this.setState({buttonClicked: true});
  }

  
  //connects to metamask wallet
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

      this.setState({account: accounts[0]})

      console.log("Connected", accounts[0]);

    } catch (error) {
      console.log(error);
    }
  }

  //Validation-----------------------------

  //checks if user is logged in 
  isLoggedIn() {
    return(this.state.account == "-1" ? false : true) 
  }

  formValidate() {

    let isCorrect = true;

    //checks address is formatted correctly
    if(!Web3.utils.isAddress(this.state.formAddress)) {
      console.log(
        "account input error"
      )
      isCorrect = false
    }

    //checks ethereum amount
    if(this.state.formAmount <= 0) {
      console.log (
        "amount incorrect"
      )
      isCorrect = false
    }

    //checks date is in proper format
    dayjs.extend(customParseFormat)
    if(!dayjs(this.state.formDate, 'MM/DD/YYYY').isValid()) {
      console.log(
        "date incorrectly formatted"
      )
      isCorrect = false
    }

    //checks date is in the future
    if((dayjs().unix()) > (dayjs(this.state.timeString).unix())) {
      isCorrect = false
    }

    return isCorrect
  }

  //Form------------------------------------------------
  receiverChange(event) {
    this.setState({formAddress: event.target.value});
  }
  dateChange(event) {
    this.setState({formDate: event.target.value});

    //adjusts time string
    let stringArray = this.state.timeString.split(" ")
    this.setState({timeString: event.target.value + " " + stringArray[1]})

  }
  amountChange(event) {
    if(event.target.value > 0) {
      let wei = Web3.utils.toWei(event.target.value)
      this.setState({formAmount: wei});
    } else {
      this.setState({formAmount: 0})
    }
  }
  hourChange(event) {

    this.setState({hour: event.target.value});

    //adjusts time string
    let stringArray = this.state.timeString.split(" ")
    this.setState({timeString: stringArray[0] + " " + event.target.value + ":00"})
  }


  submitForm(event) {
    const form = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();
    
    //const outcome = this.addTransaction()
    this.getAccountTransactions();

  };

  //Contract functions-----------------------------------------------
  async addTransaction() {

    console.log (
      "click"
    )

    //validates data
    if(!this.formValidate()) {
      return {status: "Form data incorrect"}
    }

    //converts to UTC Epoch time
    dayjs.extend(utc)
    let time = dayjs(this.state.timeString).utc().unix()

    let receiver = this.state.formAddress
    let amount = this.state.formAmount
    let sendAmount = Web3.utils.toWei("6")
    //metamask needs sent wei converted to hex
    sendAmount = Web3.utils.toHex(sendAmount)
    let account = this.state.account


    //set up transaction parameters
    const transactionParameters = {
      to: CLOCKTOWER_ADDRESS, // Required except during contract publications.
      from: account, // must match user's active address.
      value: sendAmount,
      data: this.state.clocktower.methods.addTransaction(receiver,time,amount).encodeABI(),
    };
    
    //get metamask to sign transaction
    try {
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
      //increments transaction count
      //this.setState({transactions: (this.state.transactions + 1)})
      return {
        status: "transaction sent!"
      };
      
    } catch (error) {
      return {
        status: error.message
      }
    }
   
  }

  async getAccountTransactions() {

    console.log(
      this.state.account
    )

    //checks if user is logged into account
    if(!this.isLoggedIn()) {
      console.log(
        "Not Logged in"
      )
      return
    }

    /*
    //checks if no transaction has been sent yet
    if(this.state.transactions == 0){
      console.log(
        "no transactions"
      )
      return
    }
    */
    //variable to pass scope so that the state can be set
    var that = this

    //calls contract
    await this.state.clocktower.methods.getAccountTransactions().call({from: this.state.account})
    .then(function(result){
      let accountTransactions = result
      //resets transaction list in state
      that.setState({transactionArray: accountTransactions})
      
      const transaction = accountTransactions[0];
      console.log(
        transaction.payload
      )
      
    });
  }

  //Table function
  //FIXME:
  tableMaker(event) {
    
    //checks for empty array
    if(!Array.isArray(this.state.transactionArray) || !this.state.transactionArray.length) {
      console.log(
        "Array is empty"
      )
      return
    }

    const transactionArray = this.state.transactionArray

    let table = [];

    //loops through array to create table
    for(let i = 0; i < transactionArray.length; i++) {
      console.log(
        i
      )
      let row = []
      row.push(<td>{transactionArray[i].receiver}</td>, <td>Date</td>, <td>Amount</td>, <td>Cancel</td>)
      table.push(<tr>{row}</tr>)
    }

    return table
  }

  
  //initializes values
  constructor(props) {
    super(props)
    
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktower = new web3.eth.Contract(CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS);

    //creates empty array for table
    const transactionArray = [];
    

    //initializes state variables
    this.state = {
      web3: web3,
      clocktower: clocktower,
      account: "-1",
      buttonClicked: false,
      formAddress: "0x0", 
      formDate: "947462400", 
      formAmount: 0.00, 
      hour: "0",
      timeString: "00/00/0000 00:00",
      transactionArray: transactionArray,
      transactions: 0
    }

    //form methods
    this.receiverChange = this.receiverChange.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.amountChange = this.amountChange.bind(this);
    this.hourChange = this.hourChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    //contract methods
    this.addTransaction = this.addTransaction.bind(this);
    this.getAccountTransactions = this.getAccountTransactions.bind(this)
    //metamask methods
    this.connectWallet = this.connectWallet.bind(this);
    

  }

  render() {
    return (
      <div className="clockMeta">
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container className="clockNav">
            <Navbar.Brand href="#home">Clocktower</Navbar.Brand>
            <Nav className="topNav">
              {this.state.buttonClicked ? (<Navbar.Brand>Account: {this.state.account}</Navbar.Brand>) : (<Button variant="outline-success" className = "walletButton" onClick = {() => {this.walletButtonClick()} }>Sign in Wallet</Button>)}
              {/*
              <Button variant="outline-success" onClick={this.connectWallet}>Sign in Wallet</Button>
              */}
            </Nav>
          </Container>
        </Navbar>
    
      <div className="clockBody">
      <div className="clockFormDiv">
        <Form className="mb-3" onSubmit={this.submitForm}>
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formAddress" value={this.state.formAddress} onChange={this.receiverChange}>
            <Form.Label>Address to Send to:</Form.Label>
            <Form.Control type="input" placeholder="receiver" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formAmount" value={this.state.formAmount} onChange={this.amountChange}>
              <Form.Label>Amount:</Form.Label>
              <Form.Control type="input" placeholder="amount" />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formDate" value={this.state.formDate} onChange={this.dateChange}>  
              <Form.Label>Date: (MM/DD/YYYY)</Form.Label>
              <Form.Control type="input" placeholder="date" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formSelect" value={this.state.formSelect} onChange={this.hourChange}>
            <Form.Label>Hour:</Form.Label>
            <Form.Select>
                <option>Select which hour</option>
                <option value="1">1:00 AM</option>
                <option value="2">2:00 AM</option>
                <option value="3">3:00 AM</option>
                <option value="4">4:00 AM</option>
                <option value="5">5:00 AM</option>
                <option value="6">6:00 AM</option>
                <option value="7">7:00 AM</option>
                <option value="8">8:00 AM</option>
                <option value="9">9:00 AM</option>
                <option value="10">10:00 AM</option>
                <option value="11">11:00 AM</option>
                <option value="12">12:00 AM</option>
                <option value="13">1:00 PM</option>
                <option value="14">2:00 PM</option>
                <option value="15">3:00 PM</option>
                <option value="16">4:00 PM</option>
                <option value="17">5:00 PM</option>
                <option value="18">6:00 PM</option>
                <option value="19">7:00 PM</option>
                <option value="20">8:00 PM</option>
                <option value="21">9:00 PM</option>
                <option value="22">10:00 PM</option>
                <option value="23">11:00 PM</option>
                <option value="24">12:00 PM</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col align="center"><Button type="submit">Submit</Button></Col>
        </Row>
        </Form>
        </div>
        {/*
        <div className="clockFormDiv">
          <Form className="mb-3" onSubmit={this.submitForm}>
          <Form.Group className="mb-3" controlId="formAddress" value={this.state.formAddress} onChange={this.receiverChange}>
            <Form.Label>Address to Send to:</Form.Label>
            <Form.Control type="input" placeholder="receiver" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDate" value={this.state.formDate} onChange={this.dateChange}>  
            <Form.Label>Date:</Form.Label>
            <Form.Control type="input" placeholder="date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formAmount" value={this.state.formAmount} onChange={this.amountChange}>
            <Form.Label>Amount:</Form.Label>
            <Form.Control type="input" placeholder="amount" />
          </Form.Group>
          <Button type="submit">Submit form</Button>
          </Form>
        </div>
            */}
        
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
              {this.tableMaker()}
            {/*
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
          */}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
    );
  }
}

export default App;
