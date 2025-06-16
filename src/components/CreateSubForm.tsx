import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Dropdown } from 'react-bootstrap';
import { TOKEN_LOOKUP, FREQUENCY_LOOKUP, DUEDAY_RANGE, CLOCKTOWERSUB_ABI, DAY_OF_WEEK_LOOKUP, CHAIN_LOOKUP } from '../config';
import { parseEther, formatEther } from 'viem';
import { readContract } from 'wagmi/actions';
import { useAccount } from 'wagmi';
import { config } from '../wagmiconfig';
import Icon from './Icon';
import { v4 as uuidv4 } from 'uuid';
import { CreateSubscriptionParams } from '../types/subscription';

interface CreateSubFormProps {
    setChangedCreateSub: (params: CreateSubscriptionParams) => void;
}

interface Token {
    address: `0x${string}`;
    ticker: string;
    decimals: number;
    icon: React.ComponentType;
}

const CreateSubForm: React.FC<CreateSubFormProps> = (props) => {
    const { chainId } = useAccount();

    const [invalidToken, setInvalidToken] = useState(true);
    const [invalidFrequency, setInvalidFrequency] = useState(true);
    const [invalidDay, setInvalidDay] = useState(true);
    const [invalidAmount, setInvalidAmount] = useState(true);
    const [invalidDescription, setInvalidDescription] = useState(false);
    const [invalidUrl, setInvalidUrl] = useState(false);
    const [allValidated, setAllValidated] = useState(false);
    const [selectedTokenMinimum, setSelectedTokenMinimum] = useState<bigint>(BigInt(0));

    const [dropdownTitle, setDropdownTitle] = useState("Select Token");

    const [token, setToken] = useState<`0x${string}` | "-1">("-1");
    const [frequency, setFrequency] = useState<number>(-1);
    const [dueDay, setDueDay] = useState<number>(0);
    const [amount, setAmount] = useState<bigint>(BigInt(0));
    const [subDescription, setSubDescription] = useState("");
    const [subUrl, setSubUrl] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tokenOutline, setTokenOutline] = useState<"danger" | "success">("danger");

    //function that gets selected token
    const setTokenSelection = async (token: Token) => {
        setToken(token.address);
        setDropdownTitle(token.ticker);
        setTokenOutline("success");

        if (token.address === "-1" as `0x${string}`) {
            setInvalidToken(true);
        } else {
            const matchingToken = TOKEN_LOOKUP.find((token2) => 
                token2.address === token.address
            );
            if (matchingToken) {
                await setTokenMinimum(matchingToken.address as `0x${string}`);
                setInvalidToken(false);
            }
        }
    };

    //disables submit button if all fields are not validated
    useEffect(() => {
        if (!invalidAmount && !invalidUrl && !invalidDescription && !invalidToken && !invalidFrequency && !invalidDay) {
            setAllValidated(true);
        } else {
            setAllValidated(false);
        }
    }, [invalidAmount, invalidUrl, invalidDay, invalidDescription, invalidFrequency, invalidToken]);

    const tokenPulldown3 = () => {
        return TOKEN_LOOKUP.map((token) => (
            <Dropdown.Item onClick={() => setTokenSelection(token as Token)} key={uuidv4()}>
                <Icon icon={token.icon}></Icon>{token.ticker}
            </Dropdown.Item>
        ));
    };

    //populates select info for frequency based on lookup in config
    const frequencyPulldown = () => {
        return FREQUENCY_LOOKUP.map((frequency) => (
            <option value={frequency.index} key={frequency.index}>{frequency.name}</option>
        ));
    };

    //populates day pulldown based on frequency selection
    const dayPulldown = () => {
        return DUEDAY_RANGE.map((dayRange) => {
            const options: React.ReactElement[] = [];
            if (dayRange.frequency === frequency) {
                //sets weekname for weekly
                for (let i = dayRange.start; i <= dayRange.stop; i++) {
                    if (dayRange.frequency === 0) {
                        options.push(
                            <option value={DAY_OF_WEEK_LOOKUP[(i-1)].index} key={DAY_OF_WEEK_LOOKUP[(i-1)].name}>
                                {DAY_OF_WEEK_LOOKUP[(i-1)].name}
                            </option>
                        );
                    } else {
                        options.push(<option value={i} key={i}>{i}</option>);
                    }
                }
            }
            return options;
        });
    };

    //gets token minimum from contract
    const setTokenMinimum = async (tokenAddress: `0x${string}`) => {
        const chainConfig = CHAIN_LOOKUP.find(item => item.id === chainId);
        if (!chainConfig?.contractAddress) {
            console.error("Contract address not found for chain ID:", chainId);
            return;
        }
        const contractAddress = chainConfig.contractAddress as `0x${string}`;

        const result = await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'approvedERC20',
            args: [tokenAddress]
        }) as [`0x${string}`, number, boolean, bigint];

        setSelectedTokenMinimum(result[3]);
    };

    const amountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        const inputAmount = parseEther(inputValue);
        
        if (inputAmount > BigInt(0) && inputAmount >= selectedTokenMinimum) {
            setInvalidAmount(false);
            setAmount(inputAmount);
        } else {
            setInvalidAmount(true);
        }
    };

    const frequencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        //resets day 
        setInvalidDay(true);

        //sets frequency 
        const newFrequency = Number(event.target.value);
        setFrequency(newFrequency);

        if (newFrequency === -1) {
            setInvalidFrequency(true);
        } else {
            setInvalidFrequency(false);
        }
    };

    const dueDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDueDay = Number(event.target.value);
        setDueDay(newDueDay);

        if (newDueDay === 0) {
            setInvalidDay(true);
        } else {
            setInvalidDay(false);
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
        event.preventDefault();
        event.stopPropagation();

        if (allValidated && !isSubmitting && token !== "-1") {
            setIsSubmitting(true);
            const formCreateDetails = {
                domain: "",
                url: subUrl,
                email: "",
                phone: "",
                description: subDescription
            };

            const formCreateObject: CreateSubscriptionParams = {
                amount,
                token: token as `0x${string}`,
                details: formCreateDetails,
                frequency,
                dueDay
            };

            props.setChangedCreateSub(formCreateObject);
        }
    };

    return (
        <Form noValidate validated={allValidated} className="mb-3" onSubmit={submitForm}>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formSubToken">
                        <Form.Label>Token:</Form.Label>
                        <Dropdown>
                            <Dropdown.Toggle variant={tokenOutline} id="dropdown-basic" style={{ width: "100%", textAlign: "left" }}>
                                {dropdownTitle}
                            </Dropdown.Toggle>
                            <Dropdown.Menu style={{ width: "100%" }}>
                                {tokenPulldown3()}
                            </Dropdown.Menu>
                        </Dropdown>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formSubAmount">
                        <Form.Label>Amount:</Form.Label>
                        <Form.Control 
                            type="number" 
                            isInvalid={invalidAmount} 
                            isValid={!invalidAmount}
                            onChange={amountChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Must be greater than or equal to token minimum {selectedTokenMinimum && selectedTokenMinimum !== BigInt(0) ? "of " + formatEther(selectedTokenMinimum) : ""}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formSubFrequency">
                        <Form.Label>Frequency:</Form.Label>
                        <Form.Select 
                            isInvalid={invalidFrequency} 
                            isValid={!invalidFrequency}
                            onChange={frequencyChange}
                        >
                            <option value="-1">Select Frequency</option>
                            {frequencyPulldown()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a frequency
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formSubDueDay">
                        <Form.Label>Due Day:</Form.Label>
                        <Form.Select 
                            isInvalid={invalidDay} 
                            isValid={!invalidDay}
                            onChange={dueDayChange}
                        >
                            <option value="0">Select Day</option>
                            {dayPulldown()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a day
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formSubDescription">
                        <Form.Label>Description:</Form.Label>
                        <Form.Control 
                            type="input" 
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
                    <Form.Group className="mb-3" controlId="formSubUrl">
                        <Form.Label>URL:</Form.Label>
                        <Form.Control 
                            type="input" 
                            isInvalid={invalidUrl} 
                            isValid={!invalidUrl}
                            onChange={urlChange}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={!allValidated || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
        </Form>
    );
};

export default CreateSubForm; 