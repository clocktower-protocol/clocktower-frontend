import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter,RouterProvider} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from './errorPage';
import FutPaymentRoute from './routes/futurepayments';
import Provider from './routes/provider';
//import ProvSubscription from './routes/provsubscription';
import ProvSubHistory from './routes/provsubhistory';
import ProvSubscribers from './routes/provsubscribers';
import PublicSubscription from './routes/publicsubscription';
import SubscriberDash from './routes/subscriberdash';
import SubHistory from './routes/subhistory';
import Admin from './routes/admin';
import AdminSubscriptions from './routes/adminsubscriptions';
import EditDetails from './routes/editdetails';
import AdminHistory from './routes/adminhistory';
import Account from './routes/account';

import {CLIENT_LOCALITY, NODE_ADDRESS} from "./config"
import { WagmiConfig, createConfig, configureChains } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'


//connects to hardhat
const { chains, publicClient, webSocketPublicClient } = configureChains(
[hardhat],
[
  jsonRpcProvider({
    rpc: () => ({
      http: `http://localhost:8545`,
    }),
  }),
],
)

const config = createConfig({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})


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
          path: "account/:a",
          element: <Account />,
        },
        {
          path: "provider/history/:id",
          element: <ProvSubHistory />,
        },
        {
          path: "history/:id",
          element: <ProvSubHistory />,
        },
        {
          path: "subscribers/:id/:a/:t/:p",
          element: <ProvSubscribers />
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
          path: "subscriberdash/subscription/:id",
          element: <SubHistory />
        },
        {
          path: "editdetails/:id",
          element: <EditDetails />
        },
        {
          path: "admin/",
          element: <Admin />
        },
        {
          path: "admin/subscriptions/:t/:s",
          element: <AdminSubscriptions />
        },
        {
          path: "admin/history/:a/:isp",
          element: <AdminHistory />
        }
      ]
    },
  ]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  
  <React.StrictMode>
      <WagmiConfig config={config}>
        <RouterProvider router={router}>
        </RouterProvider>
      </WagmiConfig>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();