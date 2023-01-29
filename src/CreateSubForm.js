import {React, userState} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE} from './config';

const CreateSubForm = (props) => {

    let ff = props.formFrequency

    //populates select info for token based on lookup object in config
    const tokenPulldown = () => {
        return TOKEN_LOOKUP.map((token) => {
            return <option value={token.address} key={token.address}>{token.ticker}</option>;
        });
    }

    //populates select info for frequency based on lookup in config
    const frequencyPulldown = () => {
        return FREQUENCY_LOOKUP.map((frequency) => {
            return <option value={frequency.index} key={frequency.index}>{frequency.name}</option>
        })
    }

    //populates day pulldown based on frequency selection
    const dayPulldown = () => {
        return DUEDAY_RANGE.map((frequency) => {
            if(frequency.frequency == ff) {
                const options = []
                for(let i = frequency.start; i <= frequency.stop; i++) {
                    options.push(<option value={i} key={i}>{i}</option>)
                }
                return options
            }
        })
    }

    return (
        <Form className="mb-3" onSubmit={props.submitForm}>
            <Row>
            <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect" value={props.token} onChange={props.tokenChange}>
                    <Form.Label>Token</Form.Label>
                    <Form.Select>
                        <option>Select which token</option>
                        {tokenPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAmount" value={props.formAmount} onChange={props.amountChange}>
                    <Form.Label>Amount:</Form.Label>
                    <Form.Control type="input" placeholder="amount" />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" value={props.frequency} onChange={props.frequencyChange}>
                    <Form.Label>Frequency</Form.Label>
                    <Form.Select>
                        <option>Select frequency</option>
                        {frequencyPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" value={props.dueDay} onChange={props.dueDayChange} >
                    <Form.Label>Day</Form.Label>
                    <Form.Select>
                        <option>Select Day</option>
                        {dayPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    )
}

export default CreateSubForm