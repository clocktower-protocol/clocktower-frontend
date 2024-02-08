
import { useOutletContext } from "react-router-dom";
import {React, useEffect, useState }from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { readContract } from 'wagmi/actions'
import { useAccount } from "wagmi"
import {CLOCKTOWERSUB_ABI, CLOCKTOWERSUB_ADDRESS} from "../config"; 
import dayjs from 'dayjs'


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
                            tempEventsArray.push({title: "test", date: nextEvent.format('YYYY-MM-DD'), backgroundColor: "green"})
                            //increments event by a week for the next two years and saves to array
                            for (var j = 0; j < 105; j++) {
                                nextEvent = nextEvent.add(7, 'd')
                                //eventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD')})
                                tempEventsArray.push({title: accountSubscriptions[i].subscription.id, date: nextEvent.format('YYYY-MM-DD'), backgroundColor: "green"})
                            }
                            break
                        //monthly
                        case 1:
                            break
                        //quarterly
                        case 2: 
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