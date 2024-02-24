import React, { Component, useEffect, useState, useCallback} from 'react'
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
import { useOutletContext } from "react-router-dom";
//import { send } from 'eth-permit/dist/rpc';
/* global BigInt */

const FuturePayments = () => {

    const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert] = useOutletContext();

    //creates contract variable
    const web3 = new Web3("http://localhost:8545")
     
    //gets contract interface
    const clocktowerpay = new web3.eth.Contract(CLOCKTOWERPAY_ABI, CLOCKTOWERPAY_ADDRESS);
    const clocktoken = new web3.eth.Contract(CLOCKTOKEN_ABI, CLOCKTOKEN_ADDRESS);

     //creates empty array for table
    let emptytransactionArray = [];

    const [node, setNode] = useState("http://localhost:8545")
    const [tokenABI, setTokenABI] = useState({})
    const [checkboxChecked, setCheckboxChecked] = useState(false)
    const [checkboxDisabled, setCheckboxDisabled] = useState(false)
    const [isInfinite, setIsInfinite] = useState(true)
    const [formAddress, setFormAddress] = useState("0x0")
    const [formDate, setFormDate] = useState("947462400")    
    const [formAmount, setFormAmount] = useState(0.00)
    const [hour, setHour] = useState("0")
    const [token, setToken] = useState(ZERO_ADDRESS)
    const [fee, setFee] = useState(0.1)
    const [timeString, setTimeString] = useState("00/00/0000 00:00")
    const [transactionArray, setTransactionArray] = useState(emptytransactionArray)
    const [transactions, setTransactions] = useState(0)
    const [alertType, setAlertType] = useState("danger")


 /*
  componentDidMount() {
    document.title = "Clocktower";
  }
*/

  //Metamask-----------------------------------------

  /*
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
  */

    //confirms transaction by looping until it gets confirmed
    const confirmTransaction = async (txHash) => {

        //gets transaction details
        const trx = await web3.eth.getTransaction(txHash)

        //console.log(txHash)

        let isDone = false;
        
        //trys every five seconds to see if transaction is confirmed
        isDone = setTimeout(async () => {

        // console.log(trx.blockNumber)
        if(trx.blockNumber) {
            //turns off alert and loads/reloads table
            setAlert(false)
            setAlertType("danger")
            getAccountTransactions()
            return true
        }

        //return await this.confirmTransaction(txHash)
        await confirmTransaction(txHash)
        return false
        },5*1000)

        
        if(isDone) {
        return true
        } 
    }

    //Validation-----------------------------

    //checks if user is logged in 
    const isLoggedIn = () => {
        return(account === "-1" ? false : true) 
    }

    const formValidate = () => {

        let isCorrect = true;

        //checks address is formatted correctly
        if(!Web3.utils.isAddress(formAddress)) {
        console.log(
            "account input error"
        )
        isCorrect = false
        setAlert(true)
        setAlertText("Receiving address formatted wrong")
        return
        } else {
            setAlert(false)
        }

        //checks ethereum amount
        if(formAmount <= 0) {
        console.log (
            "amount incorrect"
        )
        isCorrect = false
        setAlert(true)
        setAlertText("Amount invalid")
        return
        } else {
            setAlert(false)
        }

        //checks date is in proper format
        dayjs.extend(customParseFormat)
        if(!dayjs(formDate, 'MM/DD/YYYY').isValid()) {
        console.log(
            "date incorrectly formatted"
        )
        isCorrect = false
        setAlert(true)
        setAlertText("Date incorrectly formatted")
        return
        } else {
            setAlert(false)
        }

        //checks date is in the future
        if((dayjs().unix()) > (dayjs(timeString).unix())) {
        isCorrect = false
        setAlert(true)
        setAlertText("Date must be in the future")
        return
        } else {
            setAlert(false)
        }

        return isCorrect
    }

    //Form------------------------------------------------
    const receiverChange = (event) => {
       setFormAddress(event.target.value)
    }
    const dateChange = (event) => {
        setFormDate(event.target.value)

        //adjusts time string
        let stringArray = timeString.split(" ")
        setTimeString(event.target.value + " " + stringArray[1])
    }
    const amountChange = (event) => {
        if(event.target.value > 0) {
        let wei = Web3.utils.toWei(event.target.value)
        setFormAmount(wei)
        } else {
            setFormAmount(0)
        }
    }
    const hourChange = (event) => {
        setHour(event.target.value)

        //adjusts time string
        let stringArray = timeString.split(" ")
        setTimeString(stringArray[0] + " " + event.target.value + ":00")
    }
    const tokenChange = (event) => {

        let tokenAddress = event.target.value

        //sets token
        setToken(event.target.value)
        
        //sets abi
        TOKEN_LOOKUP.map((token) => {
            if(token.address === tokenAddress){
                console.log(token.address)
                setTokenABI(token.ABI)
            }
            return true
        })
    }

    //listens for token change and adjusts state variables
    useEffect( () => {
        const changeAllowance = async (account, clocktoken) => {
            const checkInfiniteAllowance = async (token_address) => {

                //console.log(token_address);
                let allowance = 0n
        
                
                if(token_address !== ZERO_ADDRESS) {
                allowance = BigInt(await clocktoken.methods.allowance(account, CLOCKTOWERPAY_ADDRESS).call({from: account}))
                }
                
                return (allowance === INFINITE_APPROVAL) ? true : false
            }
        
            //controls if checkbox is visible or not
            if(token !== ZERO_ADDRESS) {
            //checks if allowance is infinite. 
            if(await checkInfiniteAllowance(token)) {
                setIsInfinite(true)
            } else {
                setIsInfinite(false)
            }
            } else {
                setIsInfinite(true)
            }
        }
        changeAllowance()
     }, [token]);
     
     //FIXME: has weird calls to token that are not recognized as a method.
    //TODO: check that memoizing this function doesn't cause issues
    const setInfiniteAllowance = useCallback(async () => {
        let transactionParameters = {};
       // let account = account
       // let token = token
        const web3 = new Web3(node)
        const contract = new web3.eth.Contract(tokenABI, token);

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
                setAlertType("warning")
                setAlert(true)
                setAlertText("Transaction Pending...")
                
                //FIXME: this wont work in callback hook. 
               // await confirmTransaction(txhash)

                setCheckboxChecked(false)
                setCheckboxDisabled(false)
                setIsInfinite(true)
            })

            return {
                status: "transaction cancelled!"
            };
            
            } catch (error) {
            setCheckboxChecked(false)
            setCheckboxDisabled(false)
            return {
                status: error.message
            }
            } 
        
        }
    }, [account, node, setAlert, setAlertText, token, tokenABI]
    )

    const checkboxChange = (event) => {
        setCheckboxChecked(event.target.checked)
    }

    useEffect(() => {
            
        const changeCheckbox = async () => {
            if(checkboxChecked){
                //disables button
                setCheckboxDisabled(true)
                await setInfiniteAllowance()
            }       
        }   
        changeCheckbox()
    }, [checkboxChecked, setInfiniteAllowance]);
    

    /*
    const getABI = (tokenAddress) => {
        TOKEN_LOOKUP.map((token) => {
        if(token.address === tokenAddress){
            console.log(token.address)
            return token.ABI
        }
        })
    }
    */

    //populates select info for token based on lookup object in config
    const tokenPulldown = () => {
        return TOKEN_LOOKUP.map((token) => {
        return <option value={token.address} key={token.address}>{token.ticker}</option>;
        });
    }

    const hoursPulldown = () => {
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

    const submitForm = async (event) => {
    // const target = event.currentTarget;

        event.preventDefault();
        event.stopPropagation();


        //checks if allowance increase is needed
        if(await enoughAllowance()) {
        console.log("enough")
        await addTransaction()
        } else {
        console.log("not enough")
        await addTransactionPermit()
        }
    
        await getAccountTransactions();

    };

    //Contract functions-----------------------------------------------
    /*
    const checkInfiniteAllowance = async (token_address) => {

        //console.log(token_address);
        let allowance = 0n

        
        if(token_address !== ZERO_ADDRESS) {
        allowance = BigInt(await clocktoken.methods.allowance(account, CLOCKTOWERPAY_ADDRESS).call({from: account}))
        }
        
        return (allowance === INFINITE_APPROVAL) ? true : false
    }
    */

    //check existing balance of claims per token
    const enoughAllowance = async () => {
        let claims = BigInt(await clocktowerpay.methods.getTotalClaims(token).call({from: account}))

        let allowance = BigInt(await clocktoken.methods.allowance(account, CLOCKTOWERPAY_ADDRESS).call({from: account}))

        console.log(String(allowance));
        return (allowance >= claims + BigInt(Web3.utils.toWei(formAmount)) ? true : false)    
    }

    const addTransaction = async () => {
        let transactionParameters = {};
       // let account = account
        //let fee = this.state.fee
        let amount = formAmount;
        let feeHex = Web3.utils.toHex(Web3.utils.toWei(String(fee)))
        let receiver = formAddress
        //converts to UTC Epoch time
        dayjs.extend(utc)
        let time = dayjs(timeString).utc().unix()    
       // let token = token;


        //validates data
        if(!formValidate()) {
        return {status: "Form data incorrect"}
        }

        transactionParameters = {
        to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
        from: account, // must match user's active address.
        value: feeHex,
        data: clocktowerpay.methods.addPayment(receiver,time,amount, token).encodeABI(),
        };

        const txhash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
        });
    
        //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
        setAlertType("warning")
        setAlert(true)
        setAlertText("Transaction Pending...")
                
        await confirmTransaction(txhash)
    }

    const addTransactionPermit = async () => {

        //validates data
        if(!formValidate()) {
        return {status: "Form data incorrect"}
        }

        //let account = account
        //gets allocation from token
        let allocation = Number(Web3.utils.fromWei(await clocktoken.methods.allowance(account, CLOCKTOWERPAY_ADDRESS).call({from: account})));
    
        let amount = formAmount;
        let numberAmount = Number(Web3.utils.fromWei(amount));
        let totalNumber = allocation + numberAmount
        let total = String(totalNumber)

        //converts to UTC Epoch time
        dayjs.extend(utc)
        let time = dayjs(timeString).utc().unix()
        //let token = token;
        let tokenFee = Web3.utils.toWei(String(fee))
        tokenFee = Web3.utils.toHex(tokenFee);
        let receiver = formAddress
        //let sendAmount = Web3.utils.toWei(String(Number(Web3.utils.fromWei(amount)) + this.state.fee))
        //metamask needs sent wei converted to hex
        //sendAmount = Web3.utils.toHex(sendAmount)
        let transactionParameters = {};

        //makes permit
        let permit = await setPermit(total, 1766556423, token)

        transactionParameters = {
            to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
            from: account, // must match user's active address.
            value: tokenFee,
            data: clocktowerpay.methods.addPermitPayment(receiver,time,amount, token, permit).encodeABI(),
        };

        const txhash = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParameters],
        });
        
            //turns on alert ahead of confirmation check loop so user doesn't see screen refresh
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
                    
            await confirmTransaction(txhash)
        
    }

    const getAccountTransactions = async () => {

        //checks if user is logged into account
        if(!isLoggedIn()) {
        console.log(
            "Not Logged in"
        )
        return
        }
        
        //variable to pass scope so that the state can be set
        let accountTransactions = []
        //var that = this;


        //calls contract 
        await clocktowerpay.methods.getAccountPayments().call({from: account})
        .then(function(result) {
        accountTransactions = result

        //that.setState({transactionArray: accountTransactions})
        setTransactionArray(accountTransactions)
        })
    
    }

    const cancelTransaction = async (transaction) => {

        console.log("Cancel Transaction Called")

        //gets id and timeTrigger from transaction
        let id = transaction.id
        let timeTrigger = transaction.timeTrigger
        //let account = account
       // let token = token;

        //set up transaction parameters
        const transactionParameters = {
        to: CLOCKTOWERPAY_ADDRESS, // Required except during contract publications.
        from: account, // must match user's active address.
        data: clocktowerpay.methods.cancelTransaction(id, timeTrigger, token).encodeABI(),
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
            setAlertType("warning")
            setAlert(true)
            setAlertText("Transaction Pending...")
            
            confirmTransaction(txhash)
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
    const setPermit = async (value, deadline, token_address) => {
        
        let _value = String(Web3.utils.toWei(value))
        
        //signs permit
        const result = await signERC2612Permit(
            window.ethereum,
            token_address,
            account,
            CLOCKTOWERPAY_ADDRESS,
            _value,
            deadline
        );

        let _permit = {
            owner: account, 
            spender: CLOCKTOWERPAY_ADDRESS, 
            value: result.value, 
            deadline: result.deadline, 
            v: result.v, r: result.r , s: result.s};

        return _permit
    }

    //Creates alert
    const alertMaker = () => {
        if(alert) {
        return (
        <div className="alertDiv">
        <Alert variant={alertType} align="center" onClose={() => setAlert(false)} dismissible>{alertText}</Alert>
        </div>
        )
        }
    }

  //initializes values
  /*
  constructor(props) {
    super(props)

    //gets props from navbar/root
    //const [buttonClicked, setButtonClicked, account, setAccount, alertText, setAlertText, alert, setAlert] = useOutletContext();
    
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
    /*
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
    */
    //metamask methods
   // this.connectWallet = this.connectWallet.bind(this);
   // this.walletButtonClick = this.walletButtonClick.bind(this);

  //}
  

  //render() {
    //checks that user has logged in 
    if(account == "-1") {
        return (
            <Alert align="center" variant="info">Please Login</Alert>
        )
    } else {
        return (
        <div className="clockMeta">
            
            {/*
            <div>
            <ClockNav 
                buttonClicked = {this.state.buttonClicked}
                account = {this.state.account}
                walletButtonClick = {this.walletButtonClick}
            ></ClockNav>
            </div>
        */}
            {alertMaker()}
            <div className="clockBody">
            <div className="clockFormDiv">
                <ClockForm 
                submitForm = {submitForm} 
                formAddress = {formAddress} 
                receiverChange = {receiverChange}
                formAmount = {formAmount}
                amountChange = {amountChange}
                formDate = {formDate}
                dateChange = {dateChange}
                formSelect = {hour}
                hourChange = {hourChange}
                tokenSelect = {token}
                tokenChange = {tokenChange}
                isInfinite = {isInfinite}
                setInfiniteAllowance = {setInfiniteAllowance}
                checkboxChange = {checkboxChange}
                checkboxChecked = {checkboxChecked}
                checkboxDisabled = {checkboxDisabled}
                tokenPulldown = {tokenPulldown}
                hoursPulldown = {hoursPulldown}
                ></ClockForm>
            
            </div> 
            <div className="clockTableDiv">
                <ClockTable transactionArray={transactionArray} cancelTransaction={cancelTransaction}></ClockTable>
            </div>
        </div>
        </div>
        );
    }
  }
//}

export default FuturePayments;
