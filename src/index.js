import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from './errorPage';
import FutPaymentRoute from './routes/futurepayments';
import Provider from './routes/provider';
import ProvSubscription from './routes/provsubscription';
import PublicSubscription from './routes/publicsubscription';
import SubscriberDash from './routes/subscriberdash';
import SubHistory from './routes/subhistory';

const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "payments/",
          element: <FutPaymentRoute />,
        },
        {
          path: "provider/",
          element: <Provider />,
        },
        {
          path: "provider/subscription/:id",
          element: <ProvSubscription />,
        },
        {
          path: "public_subscription/:id/:f/:d",
          element: <PublicSubscription />,
        },
        {
          path: "subscriberdash/",
          element: <SubscriberDash />
        },
        {
          path: "subscriberdash/subscription/:id/:s",
          element: <SubHistory />
        }
      ]
    },
  ]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();