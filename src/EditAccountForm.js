import {React, useState } from 'react';
import { Form, Button, Row, Col, FloatingLabel} from 'react-bootstrap';

const EditAccountForm = (props) => {

    //variable to tell if forms are validated or not
    const [validated, setValidated] = useState(false);
    const [invalidDomain, setInvalidDomain] = useState(false)
    const [invalidUrl, setInvalidUrl] = useState(false)
    const [invalidCompany, setInvalidCompany] = useState(false)
    const [invalidDescription, setInvalidDescription] = useState(false)

    //Event listeners-----------------------------
    const descriptionChange = (event) => {
        if(event.target.value != ""){
            if(event.target.value.length > 255) {
                setInvalidDescription(true)
            } else {
                console.log(event.target.value.length)
                setInvalidDescription(false)
                props.setDescription(event.target.value)
            }
        } else {
            props.setDescription(event.target.value)
        }
    }

    const companyChange = (event) => {

        if(event.target.value != ""){
            if(event.target.value.length > 255) {
                setInvalidCompany(true)
            } else {
                setInvalidCompany(false)
                props.setCompany(event.target.value)
            }
        } else {
            props.setCompany(event.target.value)
        }
    }

    const urlChange = (event) => {

        if(event.target.value != ""){
            let regexUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/)
            if(!regexUrl.test(event.target.value)) {
                setInvalidUrl(true)
            } else {
                setInvalidUrl(false)
                props.setUrl(event.target.value)
            }
        } else {
            setInvalidUrl(false)
            props.setUrl(event.target.value)
        }

    }

    const domainChange = (event) => {

        if(event.target.value != ""){

            //(formDomain != ""){
                //let regexDomain = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/)
                //let regexDomain = new RegExp(/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/)
                let regexDomain = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
                if(!regexDomain.test(event.target.value)) {
                    setInvalidDomain(true)
                } else {
                    setInvalidDomain(false)
                    props.setDomain(event.target.value)
                }
        } else {
            setInvalidDomain(false)
            props.setDomain(event.target.value)
        }
    }

    //Form Validation
    /*
    const formValidate = () => {

        let isCorrect = true;

        //checks description length
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
       if(props.domain != ""){

        //(formDomain != ""){
            let regexDomain = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/)
            //let regexDomain = new RegExp(/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/)
            
            if(!regexDomain.test(props.domain)) {
                console.log(
                    "Not a valid domain"
                )
                setInvalidDomain(true)
                isCorrect = false
                props.setAlert(true)
                props.setAlertText("Domain formatted wrong")
                return
            } else {
                setInvalidDomain(false)
                props.setAlert(false)
            }
        }

        return isCorrect
    }
    */

    const submitForm = async (event) => {

        const form = event.currentTarget

        /*
        if (form.checkValidity() === false || !formValidate()) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            const formAccountDetails = {
                domain: props.domain,
                url: props.url,
                company: props.company,
                description: props.description
            }

            props.setChangedAccountDetails(formAccountDetails)
        }
        */

        
        event.preventDefault();
        event.stopPropagation();

        //console.log(formValidate())

        
        if(form.checkValidity() === true && !invalidDomain && !invalidUrl && !invalidCompany && !invalidDescription) {
            const formAccountDetails = {
                domain: props.domain,
                url: props.url,
                company: props.company,
                description: props.description
            }

            props.setChangedAccountDetails(formAccountDetails)
            
        } else {
            return
        }
        
        

    }

    return (
        <Form novalidate validated={validated} className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDescription" defaultValue={props.accountDetails.description} value={props.description} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        {invalidDescription ? 
                        <Form.Control type="input" defaultValue={props.accountDetails.description}  isInvalid/>
                        : 
                        <Form.Control type="input" defaultValue={props.accountDetails.description} isValid />}
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany" defaultValue={props.accountDetails.company} value={props.company} onChange={companyChange}>
                        <Form.Label>Company:</Form.Label>
                        {invalidCompany ? 
                        <Form.Control type="input" defaultValue={props.accountDetails.company}  isInvalid/>
                        : 
                        <Form.Control type="input" defaultValue={props.accountDetails.company} isValid />}
                        <Form.Control.Feedback type="invalid">
                            Company name must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany" defaultValue={props.accountDetails.url} value={props.url} onChange={urlChange}>
                        <Form.Label>URL:</Form.Label>
                        {invalidUrl ? 
                        <Form.Control type="input" defaultValue={props.accountDetails.url}  isInvalid/>
                        : 
                        <Form.Control type="input" defaultValue={props.accountDetails.url} isValid />}
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDomain" defaultValue={props.accountDetails.domain} value={props.domain} onChange={domainChange}>
                        <Form.Label>Domain:</Form.Label>
                        {invalidDomain ? 
                        <Form.Control type="input" defaultValue={props.accountDetails.domain}  isInvalid/>
                        : 
                        <Form.Control type="input" defaultValue={props.accountDetails.domain} isValid />}
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid domain.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit">Submit</Button></Col>
            </Row>
        </Form>
    )
}

export default EditAccountForm