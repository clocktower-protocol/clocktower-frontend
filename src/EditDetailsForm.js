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
    }

    const submitForm = async (event) => {
        
        event.preventDefault();
        event.stopPropagation();

        if(formValidate) {
            props.editDetails()
        } else {
            return
        }
    
    };

    return (
        <Form className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDomain" value={props.details.domain} onChange={domainChange}>
                    <Form.Label>Domain</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.domain} placeholder={props.details.domain} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl" value={props.details.url} onChange={urlChange} >
                    <Form.Label>URL</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.url} placeholder={props.details.url} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formEmail" value={props.details.email} onChange={emailChange}>
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.email} placeholder={props.details.email} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formPhone" value={props.details.phone} onChange={phoneChange} >
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.phone} placeholder={props.details.phone} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" value={props.details.description} onChange={descriptionChange}>
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