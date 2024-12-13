import {React } from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';

const EditDetailsForm = (props) => {

    //Event listeners-----------------------------
    const descriptionChange = (event) => {
        //sets description
        props.setDescription(event.target.value)
    }
    
    const urlChange = (event) => {
        //sets description
        props.setUrl(event.target.value)
    }

    //Form Validation
    const formValidate = () => {

        let isCorrect = true;

        //checks amount
        if(props.description.length > 255) {
            isCorrect = false
            props.setAlert(true)
            props.setAlertText("Description must be under 256 characters")
            return
        } else {
            props.setAlert(false)
        }
       
        return isCorrect
    }

    const submitForm = async (event) => {
        
        
        event.preventDefault();
        event.stopPropagation();
        

        if(formValidate()) {
          
            const formDetails = {
                url: props.url,
                description: props.description
            }

            props.setSubmittedDetails(formDetails)

        } else {
            return
        }
    
    };

    return (
        <Form className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" defaultValue={props.details.description} value={props.description} onChange={descriptionChange}>
                    <Form.Label>Description:</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.description} placeholder={props.details.description} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl"  defaultValue={props.details.url} value={props.url} onChange={urlChange} >
                    <Form.Label>URL</Form.Label>
                    <Form.Control type="input" defaultValue={props.details.url} placeholder={props.details.url} />
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