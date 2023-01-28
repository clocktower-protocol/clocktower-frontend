import React from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { TOKEN_LOOKUP } from './config';

const CreateSubForm = (props) => {

    //populates select info for token based on lookup object in config
    const tokenPulldown = () => {
        return TOKEN_LOOKUP.map((token) => {
        return <option value={token.address} key={token.address}>{token.ticker}</option>;
        });
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
            </Row>
        </Form>
    )
}

export default CreateSubForm