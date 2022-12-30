import React, { Component } from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import './App.css';
import {CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, EMPTY_PERMIT} from "./config"; 
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import ClockTable from './ClockTable';
import ClockForm from './ClockForm';
import ClockNav from './ClockNav';
import { signERC2612Permit } from "eth-permit";

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
      
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      //sets the account and loads the table of transactions if any
      this.setState({account: accounts[0]}, async function() {
        await this.getAccountTransactions();
      });

      console.log("Connected", accounts[0]);

      //checks for change of account or change of chain
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          //reloads connection upon wallet change
          this.connectWallet()
          return
        } else {
          this.setState({account: "-1"})
          this.setState({buttonClicked: false})
          console.log("Logged Out")
        }
      });

      //checks if chain has changed (only currently allows hardhat network)
      window.ethereum.on("chainChanged", (chainId) => {
        if (chainId !== 31337) {
          this.setState({alertText: "Clocktower currently only works on Hardhat Network. Please switch back"})
          this.setState({alert:true})
          this.setState({account: "-1"})
          this.setState({buttonClicked: false})
          return
        } else {
          this.connectWallet()
          this.setState({alert:false})
          return
        }
      });

    } catch (error) {
      console.log(error);
    }
  }

  //confirms transaction by looping until it gets confirmed
  async confirmTransaction(txHash) {

    //gets transaction details
    const trx = await this.state.web3.eth.getTransaction(txHash)

    //console.log(txHash)

   // console.log("Yo boyee!");

    let isDone = false;
    
    //trys every five seconds to see if transaction is confirmed
    isDone = setTimeout(async () => {

     // console.log(trx.blockNumber)
      if(trx.blockNumber) {
        //turns off alert and loads/reloads table
        this.setState({alert:false})
        this.setState({alertType: "danger"})
        this.getAccountTransactions()
        return true
      }

      //return await this.confirmTransaction(txHash)
      await this.confirmTransaction(txHash)
      return false
    },5*1000)

    
    if(isDone) {
      return true
    } 
  }

  //Validation-----------------------------

  //checks if user is logged in 
  isLoggedIn() {
    return(this.state.account === "-1" ? false : true) 
  }

  formValidate() {

    let isCorrect = true;

    //checks address is formatted correctly
    if(!Web3.utils.isAddress(this.state.formAddress)) {
      console.log(
        "account input error"
      )
      isCorrect = false
      this.setState({alert: true})
      this.setState({alertText: "Receiving address formatted wrong"})
      return
    } else {
      this.setState({alert: false})
    }

    //checks ethereum amount
    if(this.state.formAmount <= 0) {
      console.log (
        "amount incorrect"
      )
      isCorrect = false
      this.setState({alert: true})
      this.setState({alertText: "Ethereum amount invalid"})
      return
    } else {
      this.setState({alert: false})
    }

    //checks date is in proper format
    dayjs.extend(customParseFormat)
    if(!dayjs(this.state.formDate, 'MM/DD/YYYY').isValid()) {
      console.log(
        "date incorrectly formatted"
      )
      isCorrect = false
      this.setState({alert: true})
      this.setState({alertText: "Date incorrectly formatted"})
      return
    } else {
      this.setState({alert: false})
    }

    //checks date is in the future
    if((dayjs().unix()) > (dayjs(this.state.timeString).unix())) {
      isCorrect = false
      this.setState({alert:true})
      this.setState({alertText: "Date must be in the future"})
      return
    } else {
      this.setState({alert:false})
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
  tokenChange(event) {
    this.setState({token: event.target.value});
    console.log(event.target.value);
  }

  async submitForm(event) {
    const target = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();
    
    await this.addTransaction()
    //await this.getAccountTransactions();

  };

  //Contract functions-----------------------------------------------
  async addTransaction() {

    //validates data
    if(!this.formValidate()) {
      return {status: "Form data incorrect"}
    }

    //converts to UTC Epoch time
    dayjs.extend(utc)
    let time = dayjs(this.state.timeString).utc().unix()
    let token = this.state.token;
    let tokenFee = Web3.utils.toWei(String(this.state.fee))
    tokenFee = Web3.utils.toHex(tokenFee);
    let receiver = this.state.formAddress
    let amount = this.state.formAmount
    let sendAmount = Web3.utils.toWei(String(Number(Web3.utils.fromWei(amount)) + this.state.fee))
    //metamask needs sent wei converted to hex
    sendAmount = Web3.utils.toHex(sendAmount)
    let account = this.state.account
    let transactionParameters = {};


    //set up transaction parameters
    if(token == ZERO_ADDRESS) {

      let byteArray = []
      //creates empty 32 byte array
      for(let i = 0; i < 32; i++) {
        byteArray[i] = 0x0
      }

    //empty permit
    let permit2 = {owner: ZERO_ADDRESS, spender: ZERO_ADDRESS, value: 0, deadline: 0, v:0, r: byteArray , s: byteArray};

      //let permit = await this.setPermit(amount, 1766556423, token)
      console.log(amount);
      transactionParameters = {
        to: CLOCKTOWER_ADDRESS, // Required except during contract publications.
        from: account, // must match user's active address.
        value: sendAmount,
        data: this.state.clocktower.methods.addTransaction(receiver,time,amount, token, permit2).encodeABI(),
      };

      const txhash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
    
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        this.setState({alertType: "warning"})
        this.setState({alert:true})
        this.setState({alertText: "Transaction Pending..."})
                
        const isDone = await this.confirmTransaction(txhash)
    } else {

      //makes permit
      let permit = await this.setPermit(amount, 1766556423, token)

      transactionParameters = {
        to: CLOCKTOWER_ADDRESS, // Required except during contract publications.
        from: account, // must match user's active address.
        value: tokenFee,
        data: this.state.clocktower.methods.addTransaction(receiver,time,amount, token, permit).encodeABI(),
      };

      const txhash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
    
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        this.setState({alertType: "warning"})
        this.setState({alert:true})
        this.setState({alertText: "Transaction Pending..."})
                
        const isDone = await this.confirmTransaction(txhash)
    }
  }

  async getAccountTransactions() {

    //checks if user is logged into account
    if(!this.isLoggedIn()) {
      console.log(
        "Not Logged in"
      )
      return
    }
    
    //variable to pass scope so that the state can be set
    let accountTransactions = []
    var that = this;


    //calls contract 
    await this.state.clocktower.methods.getAccountTransactions().call({from: this.state.account})
    .then(function(result) {
      accountTransactions = result

      that.setState({transactionArray: accountTransactions})
    })
  
  }

  async cancelTransaction(transaction) {

    console.log("Cancel Transaction Called")

    //gets id and timeTrigger from transaction
    let id = transaction.id
    let timeTrigger = transaction.timeTrigger
    let account = this.state.account

     //set up transaction parameters
     const transactionParameters = {
      to: CLOCKTOWER_ADDRESS, // Required except during contract publications.
      from: account, // must match user's active address.
      data: this.state.clocktower.methods.cancelTransaction(id,timeTrigger).encodeABI(),
    };

    //get metamask to sign transaction 
    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      })
      .then (async (txhash) => {
        console.log(txhash)
        
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        this.setState({alertType: "warning"})
        this.setState({alert:true})
        this.setState({alertText: "Transaction Pending..."})
        
        this.confirmTransaction(txhash)
     })

      return {
        status: "transaction cancelled!"
      };
      
    } catch (error) {
      return {
        status: error.message
      }
    } 
  }

  //Creates permit
  async setPermit(value, deadline, token_address) {
      
    let _value = String(Web3.utils.toWei(value))
    
    //signs permit
    const result = await signERC2612Permit(
        window.ethereum,
        token_address,
        this.state.account,
        CLOCKTOWER_ADDRESS,
        _value,
        deadline
    );

    let _permit = {
        owner: this.state.account, 
        spender: CLOCKTOWER_ADDRESS, 
        value: result.value, 
        deadline: result.deadline, 
        v: result.v, r: result.r , s: result.s};

    return _permit
  }

  //Creates alert
  alertMaker() {
    if(this.state.alert) {
    return (
    <div className="alertDiv">
    <Alert variant={this.state.alertType} align="center" onClose={() => this.setState({alert: false})} dismissible>{this.state.alertText}</Alert>
    </div>
    )
    }
  }

  //initializes values
  constructor(props) {
    super(props)
    
    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktower = new web3.eth.Contract(CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

    //creates empty array for table
    let transactionArray = [];
    
    //initializes state variables
    this.state = {
      web3: web3,
      clocktower: clocktower,
      clocktoken: clocktoken,
      account: "-1",
      buttonClicked: false,
      formAddress: "0x0", 
      formDate: "947462400",
      formAmount: 0.00, 
      hour: "0",
      token: ZERO_ADDRESS,
      fee: 0.1,
      timeString: "00/00/0000 00:00",
      transactionArray: transactionArray,
      transactions: 0,
      alert: false,
      alertText: "",
      alertType: "danger"
    }

    //form methods
    this.receiverChange = this.receiverChange.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.amountChange = this.amountChange.bind(this);
    this.hourChange = this.hourChange.bind(this);
    this.tokenChange = this.tokenChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    //contract methods
    this.addTransaction = this.addTransaction.bind(this);
    this.getAccountTransactions = this.getAccountTransactions.bind(this)
    this.cancelTransaction = this.cancelTransaction.bind(this)
    //metamask methods
    this.connectWallet = this.connectWallet.bind(this);
    this.walletButtonClick = this.walletButtonClick.bind(this);

  }

  render() {
    return (
      <div className="clockMeta">
        <div>
          <ClockNav 
            buttonClicked = {this.state.buttonClicked}
            account = {this.state.account}
            walletButtonClick = {this.walletButtonClick}
          ></ClockNav>
        </div>
        {this.alertMaker()}
        <div className="clockBody">
          <div className="clockFormDiv">
            <ClockForm 
            submitForm = {this.submitForm} 
            formAddress = {this.state.formAddress} 
            receiverChange = {this.receiverChange}
            formAmount = {this.state.formAmount}
            amountChange = {this.amountChange}
            formDate = {this.state.formDate}
            dateChange = {this.dateChange}
            formSelect = {this.state.hour}
            hourChange = {this.hourChange}
            tokenSelect = {this.state.token}
            tokenChange = {this.tokenChange}
            ></ClockForm>
           
          </div> 
          <div className="clockTableDiv">
            <ClockTable transactionArray={this.state.transactionArray} cancelTransaction={this.cancelTransaction}></ClockTable>
          </div>
      </div>
    </div>
    );
  }
}

export default App;
