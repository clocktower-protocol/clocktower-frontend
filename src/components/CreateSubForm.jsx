import {React, useState, useEffect} from 'react';
import { Form, Button, Row, Col, Modal, ListGroup, Dropdown} from 'react-bootstrap';
import { TOKEN_LOOKUP, FREQUENCY_LOOKUP, DUEDAY_RANGE, CLOCKTOWERSUB_ADDRESS, CLOCKTOWERSUB_ABI, DAY_OF_WEEK_LOOKUP, CHAIN_LOOKUP} from '../config';
import {parseEther, formatEther} from 'viem'
import { readContract } from 'wagmi/actions'
import {useAccount} from 'wagmi'
import {config} from '../wagmiconfig'
//import {fetchToken} from '../clockfunctions'
import Icon from './Icon'
import styles from '../css/clocktower.module.css';
import { v4 as uuidv4 } from 'uuid'

const CreateSubForm = (props) => {

    const { chainId } = useAccount()

    const [invalidToken, setInvalidToken] = useState(true)
    const [invalidFrequency, setInvalidFrequency] = useState(true)
    const [invalidDay, setInvalidDay] = useState(true)
    const [invalidAmount, setInvalidAmount] = useState(true)
    const [invalidDescription, setInvalidDescription] = useState(false)
    const [invalidUrl, setInvalidUrl] = useState(false)
    const [allValidated, setAllValidated] = useState(false)
    const [selectedTokenMinimum, setSelectedTokenMinimum] = useState("-1")

    const [dropdownTitle, setDropdownTitle] = useState("Select Token")

    const [token, setToken] = useState("-1")
    const [frequency, setFrequency] = useState("-1")
    const [dueDay, setDueDay] = useState(0)
    const [amount, setAmount] = useState(1)
    const [subDescription, setSubDescription] = useState("")
    const [subUrl, setSubUrl] = useState("")

    //modal control
    const [showTokenMenu, setShowTokenMenu] = useState(false);

    const [tokenOutline, setTokenOutline] = useState("danger")

    //const tokenMenuShow = () => setShowTokenMenu(true)
    const hideTokenMenu = () => setShowTokenMenu(false)
    

    //function that gets selected token
    const setTokenSelection = (token) => {
       
        setToken(token.address)
        //setDecimals(token.decimals)
        setDropdownTitle(token.ticker)
        setTokenOutline("success")

        if(token.address === "-1"){
            setInvalidToken(true)
        } else {

            /*
            //sets abi and token minimum
            TOKEN_LOOKUP.map((token2) => {
                if(token2.address === token.address){
                    setTokenMinimum(token2.address)
                    setInvalidToken(false)

                }
                return true
            })
            */
            const matchingToken = TOKEN_LOOKUP.find((token2) => 
                token2.address === token.address
            );
            if (matchingToken) {
                setTokenMinimum(matchingToken.address);
                setInvalidToken(false);
            }
            
        }
    }

    
    //disables submit button if all fields are not validated
    useEffect(() => {
        if(!invalidAmount && !invalidUrl && !invalidDescription && !invalidToken && !invalidFrequency && !invalidDay) {
            setAllValidated(true)
        } else {
            setAllValidated(false)
        }
    },[invalidAmount, invalidUrl, invalidDay, invalidDescription, invalidFrequency, invalidToken])
    

   
    let ff = frequency


    const tokenPulldown2 = () => {
        return TOKEN_LOOKUP.map((token) => {
            return (
                <ListGroup.Item key={uuidv4()}>
                     <Icon icon={token.icon}></Icon>{token.ticker}
                </ListGroup.Item>
            )
        })
    }

    const tokenPulldown3 = () => {
        return TOKEN_LOOKUP.map((token) => {
            return (
                <Dropdown.Item onClick={() => setTokenSelection(token)} key={uuidv4()}>
                     <Icon icon={token.icon}></Icon>{token.ticker}
                </Dropdown.Item>
            )
        })
    }

    //populates select info for frequency based on lookup in config
    const frequencyPulldown = () => {
        return FREQUENCY_LOOKUP.map((frequency) => {
            return <option value={frequency.index} key={frequency.index}>{frequency.name}</option>
        })
    }

    //populates day pulldown based on frequency selection
    const dayPulldown = () => {
        return DUEDAY_RANGE.map((dayRange) => {
            const options = []
            if(dayRange.frequency === Number(ff)) {
                //sets weekname for weekly
                for(let i = dayRange.start; i <= dayRange.stop; i++) {
                    if(dayRange.frequency === 0){
                        options.push(<option value={DAY_OF_WEEK_LOOKUP[(i-1)].index} key={DAY_OF_WEEK_LOOKUP[(i-1)].name}>{DAY_OF_WEEK_LOOKUP[(i-1)].name}</option>)
                    } else {
                        options.push(<option value={i} key={i}>{i}</option>)
                    }
                }
            }
            return options
        })

    }

    //gets token minimum from contract
    const setTokenMinimum = async (tokenAddress) => {

       const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress
       
        await readContract(config, {
            address: contractAddress,
            abi: CLOCKTOWERSUB_ABI,
            functionName: 'approvedERC20',
            args: [tokenAddress]
        })
        .then(async function(result) {
            //gets token minimum
            setSelectedTokenMinimum(result[3])
        })
    }


    const amountChange = (event) => {

        if((Number(event.target.value) > 0) && (Number(event.target.value) >= Number(formatEther(selectedTokenMinimum)))) {
            let wei = parseEther(event.target.value)
            setInvalidAmount(false)
            setAmount(wei)
        } else {
            setInvalidAmount(true)
        }
    }

    const frequencyChange = (event) => {

        //resets day 
        setInvalidDay(true)

        //sets frequency 
        setFrequency(event.target.value)

        if(Number(event.target.value) === -1) {
            setInvalidFrequency(true)
        } else {
            setInvalidFrequency(false)
        }
     }
 
     const dueDayChange = (event) => {
         //sets frequency 
        setDueDay(event.target.value)

        if(Number(event.target.value) === 0) {
            setInvalidDay(true)
        } else {
            setInvalidDay(false)
        }
     }
 
     const descriptionChange = (event) => {
        if(event.target.value !== ""){
            if(event.target.value.length > 255) {
                setInvalidDescription(true)
            } else {
                setInvalidDescription(false)
                 //sets description
                setSubDescription(event.target.value)
            }
        } else {
            setInvalidDescription(false)
            //sets description
            setSubDescription(event.target.value)
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
                 //sets url
                setSubUrl(event.target.value)
            }
        } else {
            setInvalidUrl(false)
            //sets description
            setSubUrl(event.target.value)
        }
     }


    const submitForm = async (event) => {

        const form = event.currentTarget
  
        event.preventDefault();
        event.stopPropagation();
        
        if(form.checkValidity() === true && !invalidAmount && !invalidUrl && !invalidDescription && !invalidToken && !invalidFrequency && !invalidDay) {
            const formCreateDetails = {
                domain: "",
                url: subUrl,
                email: "",
                phone: "",
                description: subDescription
            }

            const formCreateObject = {
                amount: amount, 
                token: token,
                details: formCreateDetails,
                frequency: frequency,
                dueDay: dueDay
            }

            props.setChangedCreateSub(formCreateObject)
            
        } else {
            return
        }
    }

    return (
        <div className={styles.top_level_create_sub}>
        <Modal show={showTokenMenu} size="l" onHide={hideTokenMenu}>
            <Modal.Header closeButton>
                <Modal.Title>Choose a Token</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {tokenPulldown2()}
            </Modal.Body>
        </Modal>
        <Form className="mb-3" noValidate validated={allValidated}  onSubmit={submitForm}>
        
            <Row>
            <Col>
            <Form.Label>Token *</Form.Label>
                <Dropdown className={styles.dropdown_menu_create_sub}>
                    <Dropdown.Toggle variant={tokenOutline} id="dropdown-basic" style={{width:"100%", color:"black", backgroundColor:"white", textAlign:"left"}} className={styles.dropdown_toggle_create_sub}>
                        {dropdownTitle}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className={styles.dropdown_menu_create_sub}>
                        {tokenPulldown3()}
                    </Dropdown.Menu>
            </Dropdown>
                </Col>
                <Col>
                    <Form.Group  className="mb-3" controlId="formAmount" value={amount} onChange={amountChange}>
                        <Form.Label>Amount *</Form.Label>
                        <Form.Control required type="input" placeholder="amount" isInvalid={invalidAmount} isValid={!invalidAmount}/>
                        <Form.Control.Feedback type="invalid">
                            Must be greater than or equal to token minimum {selectedTokenMinimum !== "-1" ? "of " + formatEther(String(selectedTokenMinimum)) : ""}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="frequencySelect" value={frequency} onChange={frequencyChange}>
                        <Form.Label>Frequency *</Form.Label>
                        <Form.Select required isInvalid={invalidFrequency} isValid={!invalidFrequency}>
                            <option value={-1}>Select frequency</option>
                            {frequencyPulldown()}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            Please select a payment frequency
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="daySelect" value={dueDay} onChange={dueDayChange} >
                    <Form.Label>Day *</Form.Label>
                    <Form.Select required isInvalid={invalidDay} isValid={!invalidDay}>
                        <option value={0}>Select Day</option>
                        {dayPulldown()}
                    </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" controlId="formDescription" value={subDescription} onChange={descriptionChange}>
                        <Form.Label>Description:</Form.Label>
                        <Form.Control type="input" placeholder="description" isInvalid={invalidDescription} isValid={!invalidDescription}/>
                        <Form.Control.Feedback type="invalid">
                            Description must be under 255 characters
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" controlId="formUrl" value={subUrl} onChange={urlChange} >
                        <Form.Label>URL</Form.Label>
                        <Form.Control type="input" placeholder="url" isInvalid={invalidUrl} isValid={!invalidUrl}/>
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid URL.
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col align="center"><Button type="submit" disabled={!allValidated}>Submit</Button></Col>
            </Row>
        </Form>
        </div>
    )
 
}

export default CreateSubForm