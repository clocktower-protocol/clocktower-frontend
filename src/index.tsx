import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import { createHashRouter, RouterProvider } from "react-router";
import Root from "./routes/root";
import ErrorPage from './errorPage';
import ProvSubHistory from './routes/provsubhistory';
import ProvSubscribers from './routes/provsubscribers';
import PublicSubscription from './routes/publicsubscription';
import SubHistory from './routes/subhistory';
import Admin from './routes/admin';
import AdminSubscriptions from './routes/adminsubscriptions';
import AdminHistory from './routes/adminhistory';
import Account from './routes/account';
import Calendar from './routes/calendar';
import Subscriptions from './routes/subscriptions';
import IframeTest from './routes/iframetest';
import { WagmiProvider } from 'wagmi';
import { config } from './wagmiconfig';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import './css/clocktower.module.css';

const queryClient = new QueryClient();

const router = createHashRouter([
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
        path: "public_subscription/:id/:return_url?",
        element: <PublicSubscription />,
      },
      {
        path: "subscription/:id",
        element: <SubHistory />
      },
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
      },
      {
        path: "iframetest",
        element: <IframeTest />
      }
    ]
  }
], {
  future: {}
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  </React.StrictMode>
); 