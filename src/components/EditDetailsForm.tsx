import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { TOKEN_LOOKUP, FREQUENCY_LOOKUP, DAY_OF_WEEK_LOOKUP } from '../config';
import { formatEther } from 'viem';
import { Subscription, DetailsLog, SubscriptionEditResult } from '../types/subscription';

interface EditDetailsFormProps {
    editSub: Subscription;
    preEditDetails: DetailsLog;
    setEditResult: (result: SubscriptionEditResult) => void;
}

const EditDetailsForm: React.FC<EditDetailsFormProps> = (props) => {
    const [invalidDescription, setInvalidDescription] = useState(false);
    const [invalidUrl, setInvalidUrl] = useState(false);
    const [allValidated, setAllValidated] = useState(false);
    const [subDescription, setSubDescription] = useState(props.preEditDetails.description);
    const [subUrl, setSubUrl] = useState(props.preEditDetails.url);

    //disables submit button if all fields are not validated
    useEffect(() => {
        if (!invalidUrl && !invalidDescription) {
            setAllValidated(true);
        } else {
            setAllValidated(false);
        }
    }, [invalidUrl, invalidDescription]);

    const fetchTokenTicker = (): string => {
        return TOKEN_LOOKUP.find((token) => 
            token.address === props.editSub.token
        )?.ticker || "";
    };

    const fetchFrequency = (): string => {
        return FREQUENCY_LOOKUP.find((frequency) => 
            frequency.index === props.editSub.frequency
        )?.name || "";
    };

    const fetchDueDay = (): string => {
        //weekly
        if (props.editSub.frequency === 0) {
            if (props.editSub.dueDay === 7) {
                return DAY_OF_WEEK_LOOKUP[0].name;
            }
            return DAY_OF_WEEK_LOOKUP[props.editSub.dueDay].name;
        } else {
            return String(props.editSub.dueDay);
        }
    };

    const descriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            if (event.target.value.length > 255) {
                setInvalidDescription(true);
            } else {
                setInvalidDescription(false);
                setSubDescription(event.target.value);
            }
        } else {
            setInvalidDescription(false);
            setSubDescription(event.target.value);
        }
    };

    const urlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            //eslint-disable-next-line
            const regexUrl = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/);
            if (!regexUrl.test(event.target.value)) {
                setInvalidUrl(true);
            } else {
                setInvalidUrl(false);
                setSubUrl(event.target.value);
            }
        } else {
            setInvalidUrl(false);
            setSubUrl(event.target.value);
        }
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;

        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === true && !invalidUrl && !invalidDescription) {
            const formEditDetails = {
                url: subUrl,
                description: subDescription
            };

            const formEditResult: SubscriptionEditResult = {
                details: JSON.stringify(formEditDetails),
                id: props.editSub.id
            };

            props.setEditResult(formEditResult);
        }
    };

    return (
        <Form className="mb-3" noValidate validated={allValidated} onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="tokenSelect">
                        <Form.Label>Token</Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchTokenTicker()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAmount">
                        <Form.Label>Amount</Form.Label>
                        <Form.Control disabled required type="input" placeholder={formatEther(props.editSub.amount)} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect">
                        <Form.Label>Frequency</Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchFrequency()} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect">
                        <Form.Label>Day</Form.Label>
                        <Form.Control disabled required type="input" placeholder={fetchDueDay()} />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription">
                        <Form.Label>Description:</Form.Label>
                        <Form.Control 
                            type="input" 
                            placeholder={props.preEditDetails.description} 
                            defaultValue={props.preEditDetails.description} 
                            onChange={descriptionChange}
                            isInvalid={invalidDescription} 
                            isValid={!invalidDescription}
                        />
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">
                            Note: Description will be publically added to the chain logs
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl">
                        <Form.Label>URL</Form.Label>
                        <Form.Control 
                            type="input" 
                            placeholder={props.preEditDetails.url} 
                            defaultValue={props.preEditDetails.url} 
                            onChange={urlChange}
                            isInvalid={invalidUrl} 
                            isValid={!invalidUrl}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="valid">
                            Note: URL will be publically added to the chain logs
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col className="text-center">
                    <Button type="submit" disabled={!allValidated}>Submit</Button>
                </Col>
            </Row>
        </Form>
    );
};

export default EditDetailsForm; 