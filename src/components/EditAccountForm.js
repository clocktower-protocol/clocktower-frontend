import {React, useState , useEffect} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';

const EditAccountForm = (props) => {

    //variable to tell if forms are validated or not
    //const [validated, setValidated] = useState(false);
    const [invalidDomain, setInvalidDomain] = useState(false)
    const [invalidUrl, setInvalidUrl] = useState(false)
    const [invalidCompany, setInvalidCompany] = useState(false)
    const [invalidDescription, setInvalidDescription] = useState(false)
    const [isChecked, setIsChecked] = useState(false)
    const [allValidated, setAllValidated] = useState(false)

    const [description, setDescription] = useState("")
    const [company, setCompany] = useState("")
    const [url, setUrl] = useState("")
    const [domain, setDomain] = useState("")

    
    useEffect(() => {
        //if this is an edit it sets the initial values
        setDescription(props.accountDetails.description)
        setCompany(props.accountDetails.company)
        setUrl(props.accountDetails.url)
        setDomain(props.accountDetails.domain)
    },[props.accountDetails.description, props.accountDetails.company, props.accountDetails.url, props.accountDetails.domain])

    useEffect(() => {

        setAllValidated(false)        
        if(!invalidCompany && !invalidDescription && !invalidDomain && !invalidUrl && isChecked) {
            setAllValidated(true)
        } else {
            setAllValidated(false)
        }

    },[invalidCompany, invalidDescription, invalidDomain, invalidUrl, isChecked])
    

    //Event listeners-----------------------------
    const descriptionChange = (event) => {
        if(event.target.value !== ""){
            if(event.target.value.length > 255) {
                setInvalidDescription(true)
            } else {
                console.log(event.target.value.length)
                setInvalidDescription(false)
                setDescription(event.target.value)
            }
        } else {
            setDescription(event.target.value)
        }
    }

    const companyChange = (event) => {

        if(event.target.value !== ""){
            if(event.target.value.length > 255) {
                setInvalidCompany(true)
            } else {
                setInvalidCompany(false)
                setCompany(event.target.value)
            }
        } else {
            setCompany(event.target.value)
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
                setUrl(event.target.value)
            }
        } else {
            setInvalidUrl(false)
            setUrl(event.target.value)
        }

    }
//
    const domainChange = (event) => {

        if(event.target.value !== ""){

            //(formDomain != ""){
                //let regexDomain = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/)
                //let regexDomain = new RegExp(/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/)
                //eslint-disable-next-line
                let regexDomain = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/)
                if(!regexDomain.test(event.target.value)) {
                    setInvalidDomain(true)
                } else {
                    setInvalidDomain(false)
                    setDomain(event.target.value)
                }
        } else {
            setInvalidDomain(false)
            setDomain(event.target.value)
        }
    }

    const checkChange = () => {

        setIsChecked(!isChecked)

    }

   
    const submitForm = async (event) => {

        const form = event.currentTarget

        
        event.preventDefault();
        event.stopPropagation();
        
        if(form.checkValidity() === true && !invalidDomain && !invalidUrl && !invalidCompany && !invalidDescription) {
            const formAccountDetails = {
                domain: domain,
                url: url,
                company: company,
                description: description
            }

            props.setChangedAccountDetails(formAccountDetails)
            
        } else {
            return
        }
    }

    return (
        <Form noValidate validated={false} className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDescription" defaultValue={props.accountDetails.description} value={props.description} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.description}  isInvalid={invalidDescription} isValid={!invalidDescription}/>
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany" defaultValue={props.accountDetails.company} value={props.company} onChange={companyChange}>
                        <Form.Label>Company:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.company}  isInvalid={invalidCompany} isValid={!invalidCompany}/>
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
                        <Form.Control type="input" defaultValue={props.accountDetails.url}  isInvalid={invalidUrl} isValid={!invalidUrl}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDomain" defaultValue={props.accountDetails.domain} value={props.domain} onChange={domainChange}>
                        <Form.Label>Domain:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.domain}  isInvalid={invalidDomain} isValid={!invalidDomain}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid domain.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center">
                <Form.Group className="mb-3">
                    <Form.Check
                        required
                        name="terms"
                        label="I understand that this information will be permanently and publicly associated with this account"
                        feedbackType="invalid"
                        id="accountDetailsWarning"
                        onChange={checkChange}
                        checked={isChecked}
                        isInvalid={!isChecked}
                        isValid={isChecked}
                    />
                </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit" disabled={!allValidated}>Submit</Button></Col>
            </Row>
        </Form>
    )
}

export default EditAccountForm