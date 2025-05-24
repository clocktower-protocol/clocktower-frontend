
import { useOutletContext, useNavigate } from "react-router";
import {React, useEffect, useState, useCallback }from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { readContract } from 'wagmi/actions'
import { useAccount } from "wagmi"
import {formatEther} from 'viem'
import {config} from '../wagmiconfig'
import {CLOCKTOWERSUB_ABI, TOKEN_LOOKUP, CHAIN_LOOKUP} from "../config"; 
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import dayOfYear from 'dayjs/plugin/dayOfYear'
//import {fetchToken} from '../clockfunctions'
import styles from '../css/clocktower.module.css';

dayjs.extend(quarterOfYear)
dayjs.extend(isLeapYear)
dayjs.extend(dayOfYear)


const Calendar = () => {

    const [account] = useOutletContext();

    const { address, chainId } = useAccount()

    let emptyArray = []

    const navigate = useNavigate()
    
    const [eventsArray, setEventsArray] = useState(emptyArray)

    //event handlers for tooltip
    const handleMouseEnter = (info) => {
        
    }

    const handleMouseLeave = (info) => {
        
    }
    
    //link functions
    const eventClick = useCallback((info) => {
        navigate('/public_subscription/'+info.event.extendedProps.id+"/"+info.event.extendedProps.frequency+"/"+info.event.extendedProps.dueDay, {replace: false})
    }, [navigate])
    

    //converts dueDay and frequency to cal events
    const convertToCalEvents = useCallback((subscriptions, color, isSubscriber) => {

        let tempEventsArray = []
        const accountSubscriptions = subscriptions

        //loops through each subscription
        for (let i = 0; i < accountSubscriptions.length; i++) {

            /*
            //gets token ticker
            let ticker = TOKEN_LOOKUP.map((token) => {
                if(token.address === accountSubscriptions[i].subscription.token){
                 console.log(token.ticker)
                return token.ticker
                } else {
                    return ""
                }
            })
            */
            let ticker = TOKEN_LOOKUP.find((token) => 
                token.address === accountSubscriptions[i].subscription.token
            )?.ticker || "";
            //console.log(ticker);

            //gets total 
            let total = ""
            if(isSubscriber) {
                total = String(Number(formatEther(accountSubscriptions[i].subscription.amount)))
            } else {
                if(Number(accountSubscriptions[i].totalSubscribers) > 0) {
                    total = String(Number(formatEther(accountSubscriptions[i].subscription.amount)) * Number(accountSubscriptions[i].totalSubscribers))
                } else {
                    total = "No Subs Yet"
                    ticker = ""
                }
            }

            if(accountSubscriptions[i].status === 0) {
                //gets time information from each subscription
                let dueDay = accountSubscriptions[i].subscription.dueDay
                let frequency = accountSubscriptions[i].subscription.frequency
                let now = dayjs()

                //creates calendar events based on frequency and dueDay
                switch (frequency) {
                    //weekly
                    case 0:
                        //adjusts for Sunday being 7
                        if(dueDay === 7) {
                            dueDay = 0
                        }

                        let difference

                        //first due day is next week
                        if(dueDay < now.day()){
                            difference = (7 - now.day()) + dueDay
                        } else {
                            //first due date is this week
                            difference = dueDay - now.day()
                        }
                        //adds the days to the next event
                        let nextEvent = now.add(difference, 'day')
                        //saves info to array
                        tempEventsArray.push({title: total + " " + ticker, extendedProps: accountSubscriptions[i].subscription, date: nextEvent.format('YYYY-MM-DD'), backgroundColor: color})
                        //increments event by a week for the next two years and saves to array
                        for (let j = 0; j < 105; j++) {
                            nextEvent = nextEvent.add(7, 'd')
                            //eventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD')})
                            tempEventsArray.push({title: total + " " + ticker, extendedProps: accountSubscriptions[i].subscription, date: nextEvent.format('YYYY-MM-DD'), backgroundColor: color})
                        }
                        break
                    //monthly
                    case 1:
                        let year
                        let month
                        let monthEvent
                        //day is next month
                        if(dueDay < now.date()) {
                            //gets month number and increments it
                            month = now.month()
                            month += 1
                            year = now.year()
                            //month goes into next year
                            if(month === 12) {
                                month = 0
                                year += 1
                            }
                        } else {
                            month = now.month()
                            year = now.year()
                        }
                        
                        monthEvent = dayjs(String(year)+"-"+String(month + 1)+"-"+dueDay)
                        //pushs first date to array
                        tempEventsArray.push({title: total+" "+ticker, extendedProps: accountSubscriptions[i].subscription, date: monthEvent.format('YYYY-MM-DD'), backgroundColor: color})

                        //increments event by a month for the next two years and saves to array
                        for (let k = 0; k < 25; k++) {
                            monthEvent = monthEvent.add(1, 'M')
                            tempEventsArray.push({title: total+" "+ticker, extendedProps: accountSubscriptions[i].subscription, date: monthEvent.format('YYYY-MM-DD'), backgroundColor: color})
                        }
                        break
                    //quarterly
                    case 2: 

                        //converts now to quarter day (1 -- 90)
                        let maxMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                        const leapMaxMonthDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                       
                        if(now.isLeapYear) {
                            maxMonthDays = leapMaxMonthDays
                        } 
                        
                        //gets current quarter day
                        const monthAtEndOfQuarter = now.quarter() * 3
                        const monthAtBeginningOfQuarter = monthAtEndOfQuarter - 3

                        //converts current day to quarter day
                        let counter2 = 0
                        let currentQuarterDay = 0
                        //increments each month of quarter
                        for(let m = monthAtBeginningOfQuarter; m <= now.month(); m++) {
                            //increments the days inside the quarter until current day is found
                            for(let d = 1; d <= maxMonthDays[m]; d++) {
                                counter2 += 1
                                if(m === now.month() && d === now.date()) {
                                    currentQuarterDay = counter2
                                    break
                                }
                            }
                        }

                        let eventYear = now.year()
                        let eventMonth
                        let eventDay
                        let beginningMonth = monthAtBeginningOfQuarter
                        let quarterEvent

                        //checks if next scheduled quarter event is in current quarter or next quarter
                        if(currentQuarterDay > dueDay){
                            //checks if we are in quarter 4. If so increments the year and quarter 
                            if(now.quarter() === 4) {
                                eventYear += 1
                                beginningMonth = 0
                            } else {
                                beginningMonth += 3
                            }
                        } 
                        
                        //converts dueDay to date object

                        let counter3 = 0

                        //gets first date of sequence 

                        //increments each month of quarter
                        for(let m2 = beginningMonth; m2 <= (beginningMonth + 2); m2++) {
                            //increments the days inside the quarter until current day is found
                            for(let d2 = 1; d2 <= maxMonthDays[m2]; d2++) {
                                counter3 += 1
                                if(counter3 === dueDay) {
                                    eventDay = d2
                                    eventMonth = m2
                                    quarterEvent = dayjs(String(eventYear)+"-"+String(eventMonth + 1)+"-"+eventDay)
                                    //pushs first date to array
                                    tempEventsArray.push({title: total+" "+ticker, extendedProps: accountSubscriptions[i].subscription, date: quarterEvent.format('YYYY-MM-DD'), backgroundColor: color})
                                    break
                                }
                            }
                        }

                        //increments sequence by seven more quarters
                        for(let q = 0; q <= 6; q++) {
                            let quarter = quarterEvent.quarter()
                            //increments quarter
                            if(quarter === 4) {
                                quarter = 1
                                eventYear += 1
                            } else {
                                quarter += 1
                            }
                            
                            //gets begining month
                            beginningMonth = quarter * 3 - 3

                            //increments through days of quarter to get month and day
                            let counter4 = 0
                            for(let m3 = beginningMonth; m3 <= (beginningMonth + 2); m3++) {
                                //increments the days inside the quarter until current day is found
                                for(let d3 = 1; d3 <= maxMonthDays[m3]; d3++) {
                                    counter4 += 1
                                    if(counter4 === dueDay) {
                                        eventDay = d3
                                        eventMonth = m3
                                        quarterEvent = dayjs(String(eventYear)+"-"+String(eventMonth + 1)+"-"+eventDay)
                                        //pushs date to array
                                        tempEventsArray.push({title: total+" "+ticker, extendedProps: accountSubscriptions[i].subscription, date: quarterEvent.format('YYYY-MM-DD'), backgroundColor: color})
                                        break
                                    }
                                }
                            }
                        }
                        break
                    //yearly
                    case 3:
                        let y = now.year()
                        //checks if current day of year is after dueDay
                        if(now.dayOfYear() > dueDay) {
                            //increments year
                            y += 1
                        }

                        //loops through two years
                        for(let l = y; l <= (y + 1); l++) {
                            //gets date from day of year
                            let yearStartObject = dayjs(String(l)+"-01-01")
                            let yearEvent = dayjs(yearStartObject.format('YYYY-MM-DD')).dayOfYear(dueDay)

                            //pushs date to array
                            tempEventsArray.push({title: total+" "+ticker, extendedProps: accountSubscriptions[i].subscription, date: yearEvent.format('YYYY-MM-DD'), backgroundColor: color})
                        }

                        break
                    default: 
                        break
                    
                }
            }
       }
       return tempEventsArray
    },[])

    //gets created subscriptions
    const setCalEvents = useCallback(async () => {
        //checks if user is logged into account
       
        if(typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }

       //gets contract address from whatever chain is selected
       const contractAddress = CHAIN_LOOKUP.find(item => item.id === chainId).contractAddress

       //variable to pass scope so that the state can be set
       //let accountSubscriptions = []
       let tempEventsArray = []

       //await fetchToken()
       try{
       await readContract(config, {
           address: contractAddress,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, account]
       })
       .then(async function(result) {
        
            tempEventsArray = convertToCalEvents(result, "green", false)
            await readContract(config, {
                address: contractAddress,
                abi: CLOCKTOWERSUB_ABI,
                functionName: 'getAccountSubscriptions',
                args: [true, account]
            })
            .then(async function(result2) {
                const tempEventsArray2 = convertToCalEvents(result2, "blue", true)
                Array.prototype.push.apply(tempEventsArray,tempEventsArray2)
                setEventsArray(tempEventsArray)
            })
     
       })
    
   } catch(Err) {
       console.log(Err)
   }
},[account, address, convertToCalEvents])

useEffect(() => {
    setCalEvents()
   // setCalEvents(true)
}, [setCalEvents]);


    return (
        <div className={styles.top_level_calendar}>
        <FullCalendar
            plugins={[ dayGridPlugin, bootstrap5Plugin ]}
            initialView="dayGridMonth"
            events={eventsArray}
            eventClick={eventClick}
            themeSystem="bootstrap5"
            eventMouseEnter={handleMouseEnter}
            eventMouseLeave={handleMouseLeave}
        />
        </div>
    )
}

export default Calendar