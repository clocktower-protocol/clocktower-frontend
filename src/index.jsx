import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import reportWebVitals from './reportWebVitals';
//import {createBrowserRouter,RouterProvider} from "react-router-dom-dom";
import {BrowserRouter, Routes, Route, Outlet, HashRouter} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from './errorPage';
//import FutPaymentRoute from './timepayments/futurepayments';
//import Provider from './routes/provider';
//import ProvSubscription from './routes/provsubscription';
import ProvSubHistory from './routes/provsubhistory';
import ProvSubscribers from './routes/provsubscribers';
import PublicSubscription from './routes/publicsubscription';
//import SubscriberDash from './routes/subscriberdash';
import SubHistory from './routes/subhistory';
import Admin from './routes/admin';
import AdminSubscriptions from './routes/adminsubscriptions';
//import EditDetails from './routes/editdetails';
import AdminHistory from './routes/adminhistory';
import Account from './routes/account';
import Calendar from './routes/calendar';
import Subscriptions from './routes/subscriptions'

//import {CLIENT_LOCALITY, NODE_ADDRESS} from "./config"
import { WagmiProvider} from 'wagmi'
import {config} from './wagmiconfig'
//import { hardhat } from 'wagmi/chains'
//import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
//import { jsonRpcProvider } from 'viem'
//import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
//import { InjectedConnector } from 'wagmi/connectors/injected'
//import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
//import { coinbaseWallet, injected} from 'wagmi/connectors' 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'


const queryClient = new QueryClient() 

//const CachedSubscriptions = withKeepAlive(Subscriptions, 'subscriptions');
/*
const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
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
          path: "subscription/:id",
          element: <SubHistory />
        },
        /*
        {
          path: "editdetails/:id",
          element: <EditDetails />
        },
        *//*
        {
          path: "calendar",
          element: <Calendar />
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
        },
        {
          path: "subscriptions/:t",
          element: <Subscriptions />
        }
      ]
    },
  ], 
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  });
  */
  

  
const root = ReactDOM.createRoot(document.getElementById('root'));

/*
root.render(
  <React.StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider future={{
                          v7_startTransition: true,
                           }}router={router}>
          </RouterProvider>
        </QueryClientProvider>
      </WagmiProvider>
  </React.StrictMode>
);
*/
/*
 <BrowserRouter  
            future={{
              v7_relativeSplatPath: true,
              v7_startTransition: true
            }}
          >
*/



root.render(
  <React.StrictMode>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
         <HashRouter>
            <Routes>
                <Route path="/" element={<Root />}>
                  <Route path="account/:a" element={<Account />} />
                  <Route path="provider/history/:id" element={<ProvSubHistory />} />
                  <Route path="history/:id" element={<ProvSubHistory />} />
                  <Route path="subscribers/:id/:a/:t/:p" element={<ProvSubscribers />} />
                  <Route path="public_subscription/:id/:f/:d" element={<PublicSubscription />} />
                  <Route path="subscription/:id" element={<SubHistory />} />
                  {/*
                  <Route path="editdetails/:id" element={<EditDetails />} />
                  */}
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="admin/" element={<Admin />} />
                  <Route path="admin/subscriptions/:t/:s" element={<AdminSubscriptions />} />
                  <Route path="admin/history/:a/:isp" element={<AdminHistory />} />
                  <Route path="subscriptions/:t" element={<Subscriptions />} />
                  <Route path="*" element={<ErrorPage />} />
                </Route>
            </Routes>
          </HashRouter>
        </QueryClientProvider>
      </WagmiProvider>
  </React.StrictMode>
);



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();