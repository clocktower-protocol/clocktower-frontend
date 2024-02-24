import React from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
//import {ZERO_ADDRESS, CLOCKTOKEN_ADDRESS} from "./config"; 


const ClockForm = (props) => {

    

    return (
        <Form className="mb-3" onSubmit={props.submitForm}>
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formAddress" value={props.formAddress} onChange={props.receiverChange}>
            <Form.Label>Address to Send to:</Form.Label>
            <Form.Control type="input" placeholder="receiver" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formAmount" value={props.formAmount} onChange={props.amountChange}>
              <Form.Label>Amount:</Form.Label>
              <Form.Control type="input" placeholder="amount" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="tokenSelect" value={props.token} onChange={props.tokenChange}>
              <Form.Label>Token</Form.Label>
              <Form.Select>
                <option>Select which token</option>
                {props.tokenPulldown()}
              </Form.Select>
            </Form.Group>
            {props.isInfinite ? null : props.checkboxDisabled ? <Form.Check type="checkbox"  disabled checked={props.checkboxChecked} label="Max Approval (Recommended)" onChange={props.checkboxChange} /> : <Form.Check type="checkbox"  checked={props.checkboxChecked} label="Max Approval (Recommended)" onChange={props.checkboxChange} />}
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-3" controlId="formDate" value={props.formDate} onChange={props.dateChange}>  
              <Form.Label>Date: (MM/DD/YYYY)</Form.Label>
              <Form.Control type="input" placeholder="date" />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-3" controlId="formSelect" value={props.formSelect} onChange={props.hourChange}>
            <Form.Label>Hour:</Form.Label>
            <Form.Select>
                <option>Select which hour</option>
                {props.hoursPulldown()}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col align="center"><Button type="submit">Submit</Button></Col>
        </Row>
        </Form>

    )

}

export default ClockForm