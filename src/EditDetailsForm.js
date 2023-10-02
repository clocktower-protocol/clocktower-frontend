import {React} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
//import { ERC20TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE} from './config';
//import Web3 from 'web3'

const EditDetailsForm = (props) => {

    //const details = props.details

    //Event listeners-----------------------------
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

    //Form Validation
    const formValidate = () => {

        let isCorrect = true;

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

        //validates domain
        if(props.email != ""){
            let regexDomain = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/)
            if(!regexDomain.test(props.domain)) {
                console.log(
                    "Not a valid domain"
                )
                isCorrect = false
                props.setAlert(true)
                props.setAlertText("Domain formatted wrong")
                return
            } else {
                props.setAlert(false)
            }
        }

        //validates email address
        if(props.email != ""){
            let regexEmail = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            if(!regexEmail.test(props.email)) {
                console.log(
                    "Not a valid email"
                )
                isCorrect = false
                props.setAlert(true)
                props.setAlertText("Email address formatted wrong")
                return
            } else {
                props.setAlert(false)
            }
        }

        return isCorrect
    }

    const submitForm = async (event) => {
        
        
        event.preventDefault();
        event.stopPropagation();
        

        if(formValidate()) {
            props.editDetails()
        } else {
            return
        }
        
      // props.testEncryption()
    
    };

    return (
        <Form className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDomain"  defaultValue={props.details.domain} value={props.domain} onChange={domainChange}>
                    <Form.Label>Domain</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.domain} placeholder={props.details.domain} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl"  defaultValue={props.details.url} value={props.url} onChange={urlChange} >
                    <Form.Label>URL</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.url} placeholder={props.details.url} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formEmail" defaultValue={props.details.email} value={props.email} onChange={emailChange}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.email} placeholder={props.details.email} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formPhone" defaultValue={props.details.phone} value={props.phone} onChange={phoneChange} >
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.phone} placeholder={props.details.phone} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" defaultValue={props.details.description} value={props.description} onChange={descriptionChange}>
                    <Form.Label>Description:</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.description} placeholder={props.details.description} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit">Submit</Button></Col>
            </Row>
        </Form>
    )
}

export default EditDetailsForm