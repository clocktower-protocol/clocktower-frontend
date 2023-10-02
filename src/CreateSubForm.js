import {React, userState} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { ERC20TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE, ZERO_ADDRESS} from './config';
import Web3 from 'web3'

const CreateSubForm = (props) => {

    let ff = props.frequency

    //populates select info for token based on lookup object in config
    const tokenPulldown = () => {
        return ERC20TOKEN_LOOKUP.map((token) => {
            return <option value={token.address} key={token.address}>{token.ticker}</option>;
        });
    }

    //populates select info for frequency based on lookup in config
    const frequencyPulldown = () => {
        return FREQUENCY_LOOKUP.map((frequency) => {
            return <option value={frequency.index} key={frequency.index}>{frequency.name}</option>
        })
    }

    //populates day pulldown based on frequency selection
    const dayPulldown = () => {
        return DUEDAY_RANGE.map((frequency) => {
            if(frequency.frequency == ff) {
                const options = []
                for(let i = frequency.start; i <= frequency.stop; i++) {
                    options.push(<option value={i} key={i}>{i}</option>)
                }
                return options
            }
        })
    }

    
    //event listeners-----------------------------

    const tokenChange = (event) => {

        let tokenAddress = event.target.value

        //sets token
        props.setToken(event.target.value)
        
        //sets abi
        ERC20TOKEN_LOOKUP.map((token) => {
            if(token.address === tokenAddress){
                console.log(token.address)
                props.setTokenABI(token.ABI)
            }
            return true
        })
    }

    const amountChange = (event) => {
        if(event.target.value > 0) {
        let wei = Web3.utils.toWei(event.target.value)
            props.setAmount(wei)
        } else {
            props.setAmount(0)
        }
    }

    const frequencyChange = (event) => {
       //sets frequency 
       props.setFrequency(event.target.value)
    }

    const dueDayChange = (event) => {
        //sets frequency 
        props.setDueDay(event.target.value)
    }

    const descriptionChange = (event) => {
        //sets description
        props.setDescription(event.target.value)
    }

    const domainChange = (event) => {
        //sets description
        props.setDomain(event.target.value)
    }
    
    const urlChange = (event) => {
        //sets description
        props.setUrl(event.target.value)
    }

    const emailChange = (event) => {
        //sets description
        props.setEmail(event.target.value)
    }

    const phoneChange = (event) => {
        //sets description
        props.setPhone(event.target.value)
    }


    //Form validation and submit
     //validates form data
     const formValidate = () => {

        let isCorrect = true;

        //checks amount
        if(props.formAmount <= 0) {
            console.log (
                "amount incorrect"
            )
            isCorrect = false
            props.setAlert(true)
            props.setAlertText("Amount invalid")
            return
        } else {
            props.setAlert(false)
        }

        //checks description
        isCorrect = true;

        //checks amount
        if(props.description.length > 255) {
            console.log (
                "Description too long"
            )
            isCorrect = false
            props.setAlert(true)
            props.setAlertText("Description must be under 256 characters")
            return
        } else {
            props.setAlert(false)
        }

        //checks required values are selected
        if(props.token == ZERO_ADDRESS || props.amount == null || props.frequency == null || props.dueDay == null) {
            console.log (
                "Missing required fields"
            )
            isCorrect = false
            props.setAlert(true)
            props.setAlertText("Missing required fields")
            return
        } else {
            props.setAlert(false)
            console.log(props.token)
        }
    
        return isCorrect
    }

    const submitForm = async (event) => {
        // const target = event.currentTarget;

    
            event.preventDefault();
            event.stopPropagation();

            if(formValidate()) {
                props.createSubscription()
            } else {
                return
            }
    
            /*
            //checks if allowance increase is needed
            if(await enoughAllowance()) {
            console.log("enough")
            await addTransaction()
            } else {
            console.log("not enough")
            await addTransactionPermit()
            }
        
            await getAccountTransactions();
            */
    
    };

    return (
        <Form className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col align="center">* Required</Col>
            </Row>
            <Row>
            <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect" value={props.token} onChange={tokenChange}>
                    <Form.Label>Token *</Form.Label>
                    <Form.Select>
                        <option value={ZERO_ADDRESS}>Select which token</option>
                        {tokenPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group  className="mb-3" controlId="formAmount" value={props.amount} onChange={amountChange}>
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control type="input" placeholder="amount" />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" value={props.frequency} onChange={frequencyChange}>
                    <Form.Label>Frequency *</Form.Label>
                    <Form.Select>
                        <option>Select frequency</option>
                        {frequencyPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" value={props.dueDay} onChange={dueDayChange} >
                    <Form.Label>Day *</Form.Label>
                    <Form.Select>
                        <option>Select Day</option>
                        {dayPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDomain" value={props.domain} onChange={domainChange}>
                    <Form.Label>Domain</Form.Label>
                    <Form.Control type="input" placeholder="domain" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl" value={props.url} onChange={urlChange} >
                    <Form.Label>URL</Form.Label>
                    <Form.Control type="input" placeholder="url" />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formEmail" value={props.email} onChange={emailChange}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="input" placeholder="email" />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formPhone" value={props.phone} onChange={phoneChange} >
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="input" placeholder="phone" />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" value={props.description} onChange={descriptionChange}>
                    <Form.Label>Description:</Form.Label>
                    <Form.Control type="input" placeholder="description" />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit">Submit</Button></Col>
            </Row>
        </Form>
    )
}

export default CreateSubForm