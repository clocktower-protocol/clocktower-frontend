import {React, useState} from 'react';
import { Form, Button, Row, Col} from 'react-bootstrap';
import { ERC20TOKEN_LOOKUP , FREQUENCY_LOOKUP, DUEDAY_RANGE, ZERO_ADDRESS} from './config';
import {parseEther} from 'viem'

const CreateSubForm2 = (props) => {

    const [invalidAmount, setInvalidAmount] = useState(false)

    let ff = props.frequency

    //populates select info for token based on lookup object in config
    const tokenPulldown = () => {
        return ERC20TOKEN_LOOKUP.map((token) => {
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
        return DUEDAY_RANGE.map((dayRange) => {
            if(dayRange.frequency == ff) {
                const options = []
                for(let i = dayRange.start; i <= dayRange.stop; i++) {
                    options.push(<option value={i} key={i}>{i}</option>)
                }
                return options
            }
        })
    }

    //event listeners
    const tokenChange = (event) => {

        let tokenAddress = event.target.value

        //sets token
        props.setToken(event.target.value)
        
        //sets abi
        ERC20TOKEN_LOOKUP.map((token) => {
            if(token.address === tokenAddress){
                console.log(token.address)
                props.setTokenABI(token.ABI)
            }
            return true
        })
    }

    //TODO: set minimum
    const amountChange = (event) => {
        if(event.target.value > 0) {
            let wei = parseEther(event.target.value)
            props.setAmount(wei)
        } else {
            props.setAmount(0)
        }
    }

}

export default CreateSubForm2