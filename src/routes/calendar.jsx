
import { useOutletContext } from "react-router-dom";


const Calendar = () => {

    const [account, alertText, setAlertText, alert, setAlert, isLoggedIn] = useOutletContext();

    return (
        <div>
            Test
        </div>
    )
}

export default Calendar