import {React, useState, useEffect} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { ERC20TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE, CLOCKTOWERSUB_ADDRESS, CLOCKTOWERSUB_ABI, DAY_OF_WEEK_LOOKUP} from '../config';
import {parseEther, formatEther} from 'viem'
import { readContract } from 'wagmi/actions'
import {config} from '../wagmiconfig'
import {fetchToken} from '../clockfunctions'

const EditDetailsForm2 = (props) => {

    //const [validated, setValidated] = useState(false)
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
        console.log(invalidDay)
        if(!invalidAmount && !invalidUrl && !invalidDescription) {
            setAllValidated(true)
        } else {
            setAllValidated(false)
        }
        console.log(allValidated)
    },[invalidUrl, invalidDescription])
    

    const fetchTokenTicker = () => {
        const array = ERC20TOKEN_LOOKUP.map((token) => {
            if(token.address === props.editSub.token) {
                return token.ticker
            }
        })
        return array[0]
    }


    const fetchFrequency = () => {
        return FREQUENCY_LOOKUP.map((frequency) => { 
            if(frequency.index === props.editSub.frequency){
                
                return frequency.name
            } 
        }).join("")
    }


    const fetchDueDay = () => {
        //weekly
        if(props.editSub.frequency === 0){
            return DAY_OF_WEEK_LOOKUP[props.editSub.dueDay - 1].name
        } else {
            return props.editSub.dueDay
        }
    }

     const descriptionChange = (event) => {
        if(event.target.value !== ""){
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

        if(event.target.value !== ""){
            //eslint-disable-next-line
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

       // console.log("test")

        const form = event.currentTarget
  
        event.preventDefault();
        event.stopPropagation();
        
        if(form.checkValidity() === true && !invalidUrl && !invalidDescription) {
            const formCreateDetails = {
                url: subUrl,
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
        <Form className="mb-3" noValidate validated={false}  onSubmit={submitForm}>
            <Row>
            <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect" defaultValue={props.editSub.token} value={token} >
                        <Form.Label>Token </Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchTokenTicker()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group  className="mb-3" controlId="formAmount" defaultValue={formatEther(props.editSub.amount)} value={amount}>
                        <Form.Label>Amount </Form.Label>
                        <Form.Control disabled required type="input" placeholder={formatEther(props.editSub.amount)} />
                        <Form.Control.Feedback type="invalid">
                            Must be greater than token minimum of {formatEther(String(selectedTokenMinimum))}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" defaultValue={props.editSub.frequency} value={frequency} >
                        <Form.Label>Frequency </Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchFrequency()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" defaultValue={props.editSub.dueDay} value={dueDay}  >
                    <Form.Label>Day </Form.Label>
                    <Form.Control disabled required type="input" placeholder={fetchDueDay()} />
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

export default EditDetailsForm2