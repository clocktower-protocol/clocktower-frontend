import App from '../App.js';
import ClockNavNew from '../ClockNavNew.js';
import { Outlet} from "react-router-dom";

export default function Root() {
    return (
    <>
        <ClockNavNew />
        <div id="detail">
            <Outlet />
        </div>
    </>
    )
};