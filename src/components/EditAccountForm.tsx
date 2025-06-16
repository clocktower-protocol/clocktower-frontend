import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { AccountDetails } from '../types/account';

interface EditAccountFormProps {
    accountDetails: AccountDetails;
    setChangedAccountDetails: (details: AccountDetails) => Promise<void>;
}

const EditAccountForm: React.FC<EditAccountFormProps> = (props) => {
    //variable to tell if forms are validated or not
    const [invalidDomain, setInvalidDomain] = useState(false);
    const [invalidUrl, setInvalidUrl] = useState(false);
    const [invalidCompany, setInvalidCompany] = useState(false);
    const [invalidDescription, setInvalidDescription] = useState(false);
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidMisc, setInvalidMisc] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [allValidated, setAllValidated] = useState(false);

    const [description, setDescription] = useState("");
    const [company, setCompany] = useState("");
    const [url, setUrl] = useState("");
    const [domain, setDomain] = useState("");
    const [email, setEmail] = useState("");
    const [misc, setMisc] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        //if this is an edit it sets the initial values
        setDescription(props.accountDetails?.description || '');
        setCompany(props.accountDetails?.company || '');
        setUrl(props.accountDetails?.url || '');
        setDomain(props.accountDetails?.domain || '');
        setEmail(props.accountDetails?.email || '');
        setMisc(props.accountDetails?.misc || '');
    }, [
        props.accountDetails?.description,
        props.accountDetails?.company,
        props.accountDetails?.url,
        props.accountDetails?.domain,
        props.accountDetails?.email,
        props.accountDetails?.misc
    ]);

    useEffect(() => {
        setAllValidated(false);
        if (!invalidCompany && !invalidDescription && !invalidDomain && !invalidUrl && isChecked) {
            setAllValidated(true);
        } else {
            setAllValidated(false);
        }
    }, [invalidCompany, invalidDescription, invalidDomain, invalidUrl, isChecked]);

    //Event listeners-----------------------------
    const descriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            if (event.target.value.length > 255) {
                setInvalidDescription(true);
            } else {
                setInvalidDescription(false);
                setDescription(event.target.value);
            }
        } else {
            setDescription(event.target.value);
        }
    };

    const companyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            if (event.target.value.length > 255) {
                setInvalidCompany(true);
            } else {
                setInvalidCompany(false);
                setCompany(event.target.value);
            }
        } else {
            setCompany(event.target.value);
        }
    };

    const emailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            const regexEmail = new RegExp(/^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/);
            if (!regexEmail.test(event.target.value)) {
                setInvalidEmail(true);
            } else {
                setInvalidEmail(false);
                setEmail(event.target.value);
            }
        } else {
            setInvalidEmail(false);
            setEmail(event.target.value);
        }
    };

    const miscChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            if (event.target.value.length > 255) {
                setInvalidMisc(true);
            } else {
                setInvalidMisc(false);
                setMisc(event.target.value);
            }
        } else {
            setMisc(event.target.value);
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
                setUrl(event.target.value);
            }
        } else {
            setInvalidUrl(false);
            setUrl(event.target.value);
        }
    };

    const domainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value !== "") {
            const regexDomain = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/);
            if (!regexDomain.test(event.target.value)) {
                setInvalidDomain(true);
            } else {
                setInvalidDomain(false);
                setDomain(event.target.value);
            }
        } else {
            setInvalidDomain(false);
            setDomain(event.target.value);
        }
    };

    const checkChange = () => {
        setIsChecked(!isChecked);
    };

    const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (allValidated && !isSubmitting) {
            setIsSubmitting(true);
            const formAccountDetails: AccountDetails = {
                description: description || '',
                company: company || '',
                url: url || '',
                domain: domain || '',
                email: email || '',
                misc: misc || ''
            };

            try {
                await props.setChangedAccountDetails(formAccountDetails);
                console.log("change Account Details called successfully");
            } catch (error) {
                console.error("Error in set Account Details:", error);
                setIsSubmitting(false);
            }
        }
    };

    return (
        <Form noValidate validated={allValidated} className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDescription">
                        <Form.Label>Description:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.description} 
                            isInvalid={invalidDescription} 
                            isValid={!invalidDescription}
                            onChange={descriptionChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountCompany">
                        <Form.Label>Company:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.company} 
                            isInvalid={invalidCompany} 
                            isValid={!invalidCompany}
                            onChange={companyChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Company name must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountEmail">
                        <Form.Label>Email:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.email} 
                            isInvalid={invalidEmail} 
                            isValid={!invalidEmail}
                            onChange={emailChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid email address.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountMisc">
                        <Form.Label>Misc:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.misc} 
                            isInvalid={invalidMisc} 
                            isValid={!invalidMisc}
                            onChange={miscChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Misc entry must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountUrl">
                        <Form.Label>URL:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.url} 
                            isInvalid={invalidUrl} 
                            isValid={!invalidUrl}
                            onChange={urlChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formAccountDomain">
                        <Form.Label>Domain:</Form.Label>
                        <Form.Control 
                            type="input" 
                            defaultValue={props.accountDetails.domain} 
                            isInvalid={invalidDomain} 
                            isValid={!invalidDomain}
                            onChange={domainChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid domain.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Form.Group className="mb-3 text-center" controlId="formBasicCheckbox">
                <Form.Check 
                    type="checkbox" 
                    label="I understand that this information will be permanently and publicly associated with this account" 
                    onChange={checkChange}
                    className="d-flex justify-content-center align-items-center"
                    style={{ gap: '0.5rem' }}
                />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={!allValidated || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </Form>
    );
};

export default EditAccountForm; 