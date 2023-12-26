import {React, useState, useEffect} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { ERC20TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE, CLOCKTOWERSUB_ADDRESS, CLOCKTOWERSUB_ABI, DAY_OF_WEEK_LOOKUP} from './config';
import {parseEther, formatEther} from 'viem'
import { readContract } from 'wagmi/actions'

const CreateSubForm2 = (props) => {

    const [validated, setValidated] = useState(false)
    const [invalidToken, setInvalidToken] = useState(true)
    const [invalidFrequency, setInvalidFrequency] = useState(true)
    const [invalidDay, setInvalidDay] = useState(true)
    const [invalidAmount, setInvalidAmount] = useState(true)
    const [invalidDescription, setInvalidDescription] = useState(false)
    const [invalidUrl, setInvalidUrl] = useState(false)
    const [allValidated, setAllValidated] = useState(false)
    const [selectedTokenMinimum, setSelectedTokenMinimum] = useState(parseEther("1"))

    const [token, setToken] = useState("-1")
    const [frequency, setFrequency] = useState("-1")
    const [dueDay, setDueDay] = useState(0)
    const [amount, setAmount] = useState(1)
    const [subDescription, setSubDescription] = useState("")
    const [subUrl, setSubUrl] = useState("")

    
    //disables submit button if all fields are not validated
    useEffect(() => {
        if(!invalidAmount && !invalidUrl && !invalidDescription && !invalidToken && !invalidFrequency && !invalidDay) {
            setAllValidated(true)
        }
    },[invalidAmount, invalidUrl, invalidDay, invalidDescription, invalidDay, invalidFrequency])
    

   // let ff = props.frequency
    let ff = frequency

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
        return DUEDAY_RANGE.map((dayRange) => {
            if(dayRange.frequency == ff) {
                //sets weekname for weekly
                const options = []
                for(let i = dayRange.start; i <= dayRange.stop; i++) {
                    if(dayRange.frequency === 0){
                        options.push(<option value={i} key={DAY_OF_WEEK_LOOKUP[(i-1)].name}>{DAY_OF_WEEK_LOOKUP[(i-1)].name}</option>)
                    } else {
                        options.push(<option value={i} key={i}>{i}</option>)
                    }
                }
                return options
            }
        })
    }

    //gets token minimum from contract
    const setTokenMinimum = async (tokenAddress) => {
        await readContract({
            address: CLOCKTOWERSUB_ADDRESS,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'approvedERC20',
            args: [tokenAddress]
        })
        .then(async function(result) {
            //gets token minimum
            setSelectedTokenMinimum(result[1])
        })
    }

    //event listeners
    const tokenChange = (event) => {

        let tokenAddress = event.target.value

        //sets token
        //props.setToken(event.target.value)
        setToken(event.target.value)

        if(event.target.value === "-1"){
            setInvalidToken(true)
        } else {
            //sets abi and token minimum
            ERC20TOKEN_LOOKUP.map((token) => {
                if(token.address === tokenAddress){
                    setTokenMinimum(token.address)
                    setInvalidToken(false)
                // props.setTokenABI(token.ABI)
                }
                return true
            })
        }
    }

    const amountChange = (event) => {

        if(event.target.value > 0 && event.target.value > formatEther(selectedTokenMinimum)) {
            let wei = parseEther(event.target.value)
            setInvalidAmount(false)
            //props.setAmount(wei)
            setAmount(wei)
        } else {
            setInvalidAmount(true)
          //  props.setAmount(0)
        }
    }

    const frequencyChange = (event) => {

        //resets day 
        setInvalidDay(true)

        //sets frequency 
        //props.setFrequency(event.target.value)
        setFrequency(event.target.value)

        if(event.target.value == -1) {
            setInvalidFrequency(true)
        } else {
            setInvalidFrequency(false)
        }
     }
 
     const dueDayChange = (event) => {
         //sets frequency 
         //props.setDueDay(event.target.value)
        setDueDay(event.target.value)

        if(event.target.value === 0) {
            setInvalidDay(true)
        } else {
            setInvalidDay(false)
        }

         console.log(event.target.value)
     }
 
     const descriptionChange = (event) => {
        if(event.target.value != ""){
            if(event.target.value.length > 255) {
                setInvalidDescription(true)
            } else {
                setInvalidDescription(false)
                 //sets description
                //props.setSubDescription(event.target.value)
                setSubDescription(event.target.value)
            }
        } else {
            setInvalidDescription(false)
            //sets description
            //props.setSubDescription(event.target.value)
            setSubDescription(event.target.value)
        }
     }
 
     const urlChange = (event) => {

        if(event.target.value != ""){
            let regexUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/)
            if(!regexUrl.test(event.target.value)) {
                setInvalidUrl(true)
            } else {
                setInvalidUrl(false)
                 //sets url
                //props.setSubUrl(event.target.value)
                setSubUrl(event.target.value)
            }
        } else {
            setInvalidUrl(false)
            //sets description
            //props.setSubUrl(event.target.value)
            setSubUrl(event.target.value)
        }
     }


    const submitForm = async (event) => {

        const form = event.currentTarget
  
        event.preventDefault();
        event.stopPropagation();

        //TODO: need to remove phone, email and domain once contract is updated
        
        if(form.checkValidity() === true && !invalidAmount && !invalidUrl && !invalidDescription && !invalidToken && !invalidFrequency && !invalidDay) {
            const formCreateDetails = {
                domain: "",
                url: subUrl,
                email: "",
                phone: "",
                description: subDescription
            }

            const formCreateObject = {
                amount: amount, 
                token: token,
                details: formCreateDetails,
                frequency: frequency,
                dueDay: dueDay
            }

            props.setChangedCreateSub(formCreateObject)
            
        } else {
            return
        }
    }

    return (
        <Form className="mb-3" noValidate validated={validated}  onSubmit={submitForm}>
            <Row>
            <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect" value={token} onChange={tokenChange}>
                        <Form.Label>Token *</Form.Label>
                        <Form.Select isValid={!invalidToken} isInvalid={invalidToken}>
                            <option value={"-1"}>Select which token</option>
                            {tokenPulldown()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a token
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group  className="mb-3" controlId="formAmount" value={amount} onChange={amountChange}>
                        <Form.Label>Amount *</Form.Label>
                        <Form.Control required type="input" placeholder="amount" isInvalid={invalidAmount} isValid={!invalidAmount}/>
                        <Form.Control.Feedback type="invalid">
                            Must be greater than token minimum of {formatEther(String(selectedTokenMinimum))}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" value={frequency} onChange={frequencyChange}>
                        <Form.Label>Frequency *</Form.Label>
                        <Form.Select required isInvalid={invalidFrequency} isValid={!invalidFrequency}>
                            <option value={-1}>Select frequency</option>
                            {frequencyPulldown()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a payment frequency
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" value={dueDay} onChange={dueDayChange} >
                    <Form.Label>Day *</Form.Label>
                    <Form.Select required isInvalid={invalidDay} isValid={!invalidDay}>
                        <option value={0}>Select Day</option>
                        {dayPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" value={subDescription} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control type="input" placeholder="description" isInvalid={invalidDescription} isValid={!invalidDescription}/>
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl" value={subUrl} onChange={urlChange} >
                        <Form.Label>URL</Form.Label>
                        <Form.Control type="input" placeholder="url" isInvalid={invalidUrl} isValid={!invalidUrl}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit" disabled={!allValidated}>Submit</Button></Col>
            </Row>
        </Form>
    )
 
}

export default CreateSubForm2