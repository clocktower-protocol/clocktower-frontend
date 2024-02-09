
import { useOutletContext } from "react-router-dom";
import {React, useEffect, useState }from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { readContract } from 'wagmi/actions'
import { useAccount } from "wagmi"
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import dayjs from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
dayjs.extend(quarterOfYear)


const Calendar = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    const { address } = useAccount()

    let emptyArray = []
    
    const [provSubscriptionArray, setProvSubscriptionArray] = useState(emptyArray)
    const [eventsArray, setEventsArray] = useState(emptyArray)

    //loads provider subscription list upon login
    useEffect(() => {

        getProviderSubs()
    }, []);

    //gets created subscriptions
    const getProviderSubs = async () => {
        //checks if user is logged into account
       
        if(!isLoggedIn() || typeof address === "undefined") {
           console.log("Not Logged in")
           return
       }

       //variable to pass scope so that the state can be set
       let accountSubscriptions = []
       let tempEventsArray = []

       try{
       await readContract({
           address: CLOCKTOWERSUB_ADDRESS,
           abi: CLOCKTOWERSUB_ABI,
           functionName: 'getAccountSubscriptions',
           args: [false, account]
       })
       .then(async function(result) {
           accountSubscriptions = result

           //loops through each subscription
           for (var i = 0; i < accountSubscriptions.length; i++) {


                if(accountSubscriptions[i].status === 0) {
                    //gets time information from each subscription
                    let dueDay = accountSubscriptions[i].subscription.dueDay
                    let frequency = accountSubscriptions[i].subscription.frequency
                    let now = dayjs()
                    //console.log(now.day())
                    //console.log(dueDay)

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
                            tempEventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD'), backgroundColor: "green"})
                            //increments event by a week for the next two years and saves to array
                            for (var j = 0; j < 105; j++) {
                                nextEvent = nextEvent.add(7, 'd')
                                //eventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD')})
                                tempEventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD'), backgroundColor: "green"})
                            }
                            break
                        //monthly
                        case 1:
                            let year
                            let month
                            let monthEvent
                            //day is next month
                            if(dueDay < now.day()) {
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
                            tempEventsArray.push({title: accountSubscriptions[i].subscription.id, date: monthEvent.format('YYYY-MM-DD'), backgroundColor: "pink"})

                            //increments event by a month for the next two years and saves to array
                            for (var j = 0; j < 25; j++) {
                                monthEvent = monthEvent.add(1, 'M')
                                tempEventsArray.push({title: accountSubscriptions[i].subscription.id, date: monthEvent.format('YYYY-MM-DD'), backgroundColor: "pink"})
                            }
                            break
                        //quarterly
                        case 2: 
                            
                            let nowMonth
                            let nowYear

                            //converts now to quarter day (1 -- 90)
                            const maxMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                            const leapMaxMonthDays = [31, 29, 30, 31, 30, 31, 31, 30, 31, 30, 31]
                            const daysInQuarter = [90, 91, 92, 92]
                            const leapDaysInQuarter = [91, 91, 92, 92]

                           // console.log(now.quarter())

                            //gets current quarter day
                            const monthAtEndOfQuarter = now.quarter() * 3
                            const monthAtBeginningOfQuarter = monthAtEndOfQuarter - 3
                            
                            /*
                            let counter = 0
                            for (var m = 3; m > 0; m--) {
                                counter += maxMonthDays[monthAtEndOfQuarter - m]
                            }
                            */
                           // console.log(counter)

                            let counter2 = 0
                            let quarterDay = 0
                            for(var m = monthAtBeginningOfQuarter; m <= now.month(); m++) {
                                for(var d = 1; d <= maxMonthDays[m]; d++) {
                                    counter2 += 1
                                    console.log(d)
                                    if(m == now.month() && d == now.date()) {
                                        quarterDay = counter2
                                        break
                                    }
                                }
                            }

                            console.log(quarterDay)

                            break
                        //yearly
                        case 3:
                            break
                        
                    }
                }
           }

           setEventsArray(tempEventsArray)
     
       })
    
   } catch(Err) {
       console.log(Err)
   }
}

    return (
        <FullCalendar
        plugins={[ dayGridPlugin ]}
        initialView="dayGridMonth"
        events={eventsArray}
      />
    )
}

export default Calendar