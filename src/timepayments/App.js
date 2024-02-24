import React, { Component, useEffect} from 'react'
import {Alert} from 'react-bootstrap';
import Web3 from 'web3'
import './App.css';
import {CLOCKTOWERSUB_ABI, CLOCKTOWERPAY_ABI, CLOCKTOWERSUB_ADDRESS, CLOCKTOWERPAY_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI, INFINITE_APPROVAL, TOKEN_LOOKUP} from "../config"; 
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import ClockTable from './ClockTable';
import ClockForm from './ClockForm';
import ClockNav from './ClockNav';
import { signERC2612Permit } from "eth-permit";
//import { send } from 'eth-permit/dist/rpc';
/* global BigInt */

class App extends Component {

  componentDidMount() {
    document.title = "Clocktower";
  }

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
      this.setState({alertText: "Amount invalid"})
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

    let tokenAddress = event.target.value

    //sets token
    this.setState({token: event.target.value}, async () => {
        //controls if checkbox is visible or not
        if(this.state.token !== ZERO_ADDRESS) {
          //checks if allowance is infinite. 
          if(await this.checkInfiniteAllowance(this.state.token)) {
            //console.log("Infinite!")
            this.setState({isInfinite: true})
          } else {
            //console.log("Not Infinite")
            //this.setInfiniteAllowance(this.state.token)
            this.setState({isInfinite: false})
          }
        } else {
          this.setState({isInfinite: true})
        }
    });
    
    //sets abi
    TOKEN_LOOKUP.map((token) => {
      if(token.address === tokenAddress){
        console.log(token.address)
        this.setState({tokenABI: token.ABI}, () => {
          console.log(this.state.tokenABI)
        })
      }
    })
  }

  checkboxChange(event) {
    this.setState({checkboxChecked: event.target.checked}, async () => {
      if(this.state.checkboxChecked){
        //disables button
        this.setState({checkboxDisabled: true})
        await this.setInfiniteAllowance()
      } 
    })  
  }

  getABI(tokenAddress) {
    TOKEN_LOOKUP.map((token) => {
      if(token.address === tokenAddress){
        console.log(token.address)
        return token.ABI
      }
    })
  }

  //populates select info for token based on lookup object in config
  tokenPulldown() {
    return TOKEN_LOOKUP.map((token) => {
      return <option value={token.address} key={token.address}>{token.ticker}</option>;
    });
  }

  hoursPulldown() {
    const optionArray = [];
      for(let i = 1; i <= 24; i++) {
        if(i < 13) {
          optionArray[i-1] = <option value={String(i)} key={String(i)}>{i}:00 AM</option>
        } else {
          optionArray[i-1] = <option value={String(i)} key={String(i)}>{i - 12}:00 PM</option>
        }
      }

    return optionArray.map((option) => {
      return option;
    })
   
  }

  async submitForm(event) {
   // const target = event.currentTarget;

    event.preventDefault();
    event.stopPropagation();


    //checks if allowance increase is needed
    if(await this.enoughAllowance()) {
      console.log("enough")
      await this.addTransaction()
    } else {
      console.log("not enough")
      await this.addTransactionPermit()
    }
  
    await this.getAccountTransactions();

  };

  //Contract functions-----------------------------------------------
  async checkInfiniteAllowance(token_address) {

    //console.log(token_address);
    let allowance = 0n

    
    if(token_address !== ZERO_ADDRESS) {
      allowance = BigInt(await this.state.clocktoken.methods.allowance(this.state.account, CLOCKTOWERPAY_ADDRESS).call({from: this.state.account}))
    }
    
    return (allowance === INFINITE_APPROVAL) ? true : false
  }

  //FIXME: has weird calls to token that are not recognized as a method
  async setInfiniteAllowance() {
    let transactionParameters = {};
    let account = this.state.account
    let token = this.state.token
    const web3 = new Web3(this.state.node)
    const contract = new web3.eth.Contract(this.state.tokenABI, this.state.token);

    if(token !== ZERO_ADDRESS) {
      //let contract = new this.state.web3.eth.Contract(CLOCKTOKEN_ABI, token)
      console.log("here");
    
      transactionParameters = {
        to: token, // Required except during contract publications.
        from: account, // must match user's active address.
        data: contract.methods.approve(CLOCKTOWERPAY_ADDRESS, INFINITE_APPROVAL).encodeABI()
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
            
            await this.confirmTransaction(txhash)

            this.setState({checkboxChecked: false})
            this.setState({checkboxDisabled: false})
            this.setState({isInfinite: true})
            
          })

          return {
            status: "transaction cancelled!"
          };
          
        } catch (error) {
          this.setState({checkboxChecked: false})
          this.setState({checkboxDisabled: false})
          return {
            status: error.message
          }
        } 
      
    }
  }

  //check existing balance of claims per token
  async enoughAllowance() {
    let claims = BigInt(await this.state.clocktowerpay.methods.getTotalClaims(this.state.token).call({from: this.state.account}))

    let allowance = BigInt(await this.state.clocktoken.methods.allowance(this.state.account, CLOCKTOWERPAY_ADDRESS).call({from: this.state.account}))

    console.log(String(allowance));
    return (allowance >= claims + BigInt(Web3.utils.toWei(this.state.formAmount)) ? true : false)    
  }

  async addTransaction() {
    let transactionParameters = {};
    let account = this.state.account
    //let fee = this.state.fee
    let amount = this.state.formAmount;
    let fee = Web3.utils.toHex(Web3.utils.toWei(String(this.state.fee)))
    let receiver = this.state.formAddress
    //converts to UTC Epoch time
    dayjs.extend(utc)
    let time = dayjs(this.state.timeString).utc().unix()    
    let token = this.state.token;


     //validates data
     if(!this.formValidate()) {
      return {status: "Form data incorrect"}
    }

    transactionParameters = {
      to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
      from: account, // must match user's active address.
      value: fee,
      data: this.state.clocktowerpay.methods.addPayment(receiver,time,amount, token).encodeABI(),
    };

    const txhash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });
  
      //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
      this.setState({alertType: "warning"})
      this.setState({alert:true})
      this.setState({alertText: "Transaction Pending..."})
              
      await this.confirmTransaction(txhash)

  }

  async addTransactionPermit() {

    //validates data
    if(!this.formValidate()) {
      return {status: "Form data incorrect"}
    }

    let account = this.state.account
    //gets allocation from token
    let allocation = Number(Web3.utils.fromWei(await this.state.clocktoken.methods.allowance(account, CLOCKTOWERPAY_ADDRESS).call({from: this.state.account})));
  
    let amount = this.state.formAmount;
    let numberAmount = Number(Web3.utils.fromWei(amount));
    let totalNumber = allocation + numberAmount
    let total = String(totalNumber)

    //converts to UTC Epoch time
    dayjs.extend(utc)
    let time = dayjs(this.state.timeString).utc().unix()
    let token = this.state.token;
    let tokenFee = Web3.utils.toWei(String(this.state.fee))
    tokenFee = Web3.utils.toHex(tokenFee);
    let receiver = this.state.formAddress
    //let sendAmount = Web3.utils.toWei(String(Number(Web3.utils.fromWei(amount)) + this.state.fee))
    //metamask needs sent wei converted to hex
    //sendAmount = Web3.utils.toHex(sendAmount)
    let transactionParameters = {};

    //makes permit
    let permit = await this.setPermit(total, 1766556423, token)

    transactionParameters = {
        to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
        from: account, // must match user's active address.
        value: tokenFee,
        data: this.state.clocktowerpay.methods.addPermitPayment(receiver,time,amount, token, permit).encodeABI(),
    };

      const txhash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });
    
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        this.setState({alertType: "warning"})
        this.setState({alert:true})
        this.setState({alertText: "Transaction Pending..."})
                
        await this.confirmTransaction(txhash)
    
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
    await this.state.clocktowerpay.methods.getAccountPayments().call({from: this.state.account})
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
    let token = this.state.token;

     //set up transaction parameters
     const transactionParameters = {
      to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
      from: account, // must match user's active address.
      data: this.state.clocktowerpay.methods.cancelTransaction(id, timeTrigger, token).encodeABI(),
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
        CLOCKTOWERPAY_ADDRESS,
        _value,
        deadline
    );

    let _permit = {
        owner: this.state.account, 
        spender: CLOCKTOWERPAY_ADDRESS, 
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
    //const clocktower = new web3.eth.Contract(CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS);
    const clocktowerpay = new web3.eth.Contract(CLOCKTOWERPAY_ABI, CLOCKTOWERPAY_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);
    //TODO:
    //const clocktowerpay = new web3.eth.Contract(CLOCKTOWERPAY_ABI, CLOCK)

    //creates empty array for table
    let transactionArray = [];
    
    //initializes state variables
    this.state = {
      node: "http://localhost:8545",
      web3: web3,
      //clocktower: clocktower,
      clocktowerpay: clocktowerpay,
      clocktoken: clocktoken,
      //&&
      tokenABI: {},
      //
      account: "-1",
      buttonClicked: false,
      checkboxChecked: false,
      checkboxDisabled: false,
      isInfinite: true,
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

    //utility methods
    //this.getABI = this.getABI.bind(this);
    //form methods
    this.receiverChange = this.receiverChange.bind(this);
    this.dateChange = this.dateChange.bind(this);
    this.amountChange = this.amountChange.bind(this);
    this.hourChange = this.hourChange.bind(this);
    this.tokenChange = this.tokenChange.bind(this);
    this.checkboxChange = this.checkboxChange.bind(this);
    this.tokenPulldown = this.tokenPulldown.bind(this);
    this.hoursPulldown = this.hoursPulldown.bind(this);
    this.submitForm = this.submitForm.bind(this);
    //contract methods
    this.addTransactionPermit = this.addTransactionPermit.bind(this);
    this.getAccountTransactions = this.getAccountTransactions.bind(this)
    this.cancelTransaction = this.cancelTransaction.bind(this)
    this.checkInfiniteAllowance = this.checkInfiniteAllowance.bind(this)
    this.setInfiniteAllowance = this.setInfiniteAllowance.bind(this)
    this.enoughAllowance = this.enoughAllowance.bind(this)
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
            isInfinite = {this.state.isInfinite}
            setInfiniteAllowance = {this.setInfiniteAllowance}
            checkboxChange = {this.checkboxChange}
            checkboxChecked = {this.state.checkboxChecked}
            checkboxDisabled = {this.state.checkboxDisabled}
            tokenPulldown = {this.tokenPulldown}
            hoursPulldown = {this.hoursPulldown}
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
