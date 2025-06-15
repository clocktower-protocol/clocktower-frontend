import { useRouteError } from "react-router";
import React from 'react';
import { RouteError } from './types/router';

export default function ErrorPage(): React.ReactElement {
  const error = useRouteError() as RouteError;
  console.error(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}