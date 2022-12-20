import React from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import {CLOCKTOWER_ABI, CLOCKTOWER_ADDRESS, ZERO_ADDRESS, CLOCKTOKEN_ADDRESS, CLOCKTOKEN_ABI} from "./config"; 


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
                <option>Select which hour</option>
                <option value={ZERO_ADDRESS}>ETH</option>
                <option value={CLOCKTOKEN_ADDRESS}>CLOCK</option>
              </Form.Select>
            </Form.Group>
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
                <option value="1">1:00 AM</option>
                <option value="2">2:00 AM</option>
                <option value="3">3:00 AM</option>
                <option value="4">4:00 AM</option>
                <option value="5">5:00 AM</option>
                <option value="6">6:00 AM</option>
                <option value="7">7:00 AM</option>
                <option value="8">8:00 AM</option>
                <option value="9">9:00 AM</option>
                <option value="10">10:00 AM</option>
                <option value="11">11:00 AM</option>
                <option value="12">12:00 AM</option>
                <option value="13">1:00 PM</option>
                <option value="14">2:00 PM</option>
                <option value="15">3:00 PM</option>
                <option value="16">4:00 PM</option>
                <option value="17">5:00 PM</option>
                <option value="18">6:00 PM</option>
                <option value="19">7:00 PM</option>
                <option value="20">8:00 PM</option>
                <option value="21">9:00 PM</option>
                <option value="22">10:00 PM</option>
                <option value="23">11:00 PM</option>
                <option value="24">12:00 PM</option>
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