import {React, useState, useEffect} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { ERC20TOKEN_LOOKUP , TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP} from '../config';
import { formatEther} from 'viem'

const EditDetailsForm2 = (props) => {

    const [invalidDescription, setInvalidDescription] = useState(false)
    const [invalidUrl, setInvalidUrl] = useState(false)
    const [allValidated, setAllValidated] = useState(false)
    const [subDescription, setSubDescription] = useState("")
    const [subUrl, setSubUrl] = useState("")

    
    //disables submit button if all fields are not validated
    useEffect(() => {
        if(!invalidUrl && !invalidDescription) {
            setAllValidated(true)
        } else {
            setAllValidated(false)
        }
        console.log(allValidated)
    },[invalidUrl, invalidDescription])
    

    const fetchTokenTicker = () => {
        const array = TOKEN_LOOKUP.map((token) => {
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
            return DAY_OF_WEEK_LOOKUP[props.editSub.dueDay].name
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
                setSubDescription(event.target.value)
            }
        } else {
            setInvalidDescription(false)
            //sets description
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
                setSubUrl(event.target.value)
            }
        } else {
            setInvalidUrl(false)
            //sets description
            setSubUrl(event.target.value)
        }
     }


    const submitForm = async (event) => {

       // console.log("test")

        const form = event.currentTarget
  
        event.preventDefault();
        event.stopPropagation();
        
        if(form.checkValidity() === true && !invalidUrl && !invalidDescription) {
            const formEditDetails = {
                url: subUrl,
                description: subDescription
            }

            const formEditResult = {
                details: formEditDetails,
                id: props.editSub.id
            }

            props.setEditResult(formEditResult)
            
        } else {
            return
        }
    }

    return (
        <Form className="mb-3" noValidate validated={allValidated}  onSubmit={submitForm}>
            <Row>
            <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect" defaultValue={props.editSub.token} value={props.editSub.token} >
                        <Form.Label>Token </Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchTokenTicker()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group  className="mb-3" controlId="formAmount" defaultValue={formatEther(props.editSub.amount)} value={formatEther(props.editSub.amount)}>
                        <Form.Label>Amount </Form.Label>
                        <Form.Control disabled required type="input" placeholder={formatEther(props.editSub.amount)} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" defaultValue={props.editSub.frequency} value={props.editSub.frequency} >
                        <Form.Label>Frequency </Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchFrequency()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" defaultValue={props.editSub.dueDay} value={props.editSub.dueDay}  >
                    <Form.Label>Day </Form.Label>
                    <Form.Control disabled required type="input" placeholder={fetchDueDay()} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" value={props.preEditDetails.description} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control type="input" placeholder={props.preEditDetails.description} defaultValue={props.preEditDetails.description} isInvalid={invalidDescription} isValid={!invalidDescription}/>
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl" value={props.preEditDetails.url} onChange={urlChange} >
                        <Form.Label>URL</Form.Label>
                        <Form.Control type="input" placeholder={props.preEditDetails.url} defaultValue={props.preEditDetails.url} isInvalid={invalidUrl} isValid={!invalidUrl}/>
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