import {React } from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';

const EditAccountForm = (props) => {

    //Event listeners-----------------------------
    const descriptionChange = (event) => {
        //sets description
        props.setDescription(event.target.value)
    }

    const companyChange = (event) => {
        //sets description
        props.setCompany(event.target.value)
    }

    const urlChange = (event) => {
        //sets description
        props.setUrl(event.target.value)
    }

    const domainChange = (event) => {
        //sets description
        props.setDomain(event.target.value)
    }

    //Form Validation
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
           // let regexDomain = new RegExp(/^(?!-)[A-Za-z0-9-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,6}$/)
            let regexDomain = new RegExp(/^(((?!-))(xn--|_)?[a-z0-9-]{0,61}[a-z0-9]{1,1}\.)*(xn--)?([a-z0-9][a-z0-9\-]{0,60}|[a-z0-9-]{1,30}\.[a-z]{2,})$/)
            
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

        return isCorrect
    }

    const submitForm = async (event) => {

        event.preventDefault();
        event.stopPropagation();

        if(formValidate()) {
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
        <Form className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDescription" defaultValue={props.accountDetails.description} value={props.description} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.description} placeholder={props.accountDetails.description} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany" defaultValue={props.accountDetails.company} value={props.company} onChange={companyChange}>
                        <Form.Label>Company:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.company} placeholder={props.accountDetails.company}  />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany" defaultValue={props.accountDetails.url} value={props.url} onChange={urlChange}>
                        <Form.Label>URL:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.url} placeholder={props.accountDetails.url} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDomain" defaultValue={props.accountDetails.domain} value={props.domain} onChange={domainChange}>
                        <Form.Label>Domain:</Form.Label>
                        <Form.Control type="input" defaultValue={props.accountDetails.domain} placeholder={props.accountDetails.domain} />
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