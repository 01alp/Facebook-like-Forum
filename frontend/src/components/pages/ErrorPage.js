import React, { useEffect, useState } from 'react';
import { useRouteError } from 'react-router-dom';
import Helmet from 'react-helmet';

/**
 * Renders an error page with an error message and error code.
 * @param {string} props.errorMessage - The error message to be displayed. If not provided, a default message will be shown.
 * @param {number} props.errorCode - The error code to be displayed. If not provided, a default code of 404 will be shown.
 */
const ErrorPage = (props) => {
  let errorMessage;
  if (props.errorMessage) {
    errorMessage = props.errorMessage;
  } else {
    errorMessage = 'Page not found';
  }
  let errorCode;
  if (props.errorCode) {
    errorCode = props.errorCode;
  } else {
    errorCode = 404;
  }
  return (
    <>
      <Helmet>
        <title>{errorMessage}</title>
      </Helmet>
      <div id="wrapper">
        <div className="d-flex flex-column" id="content-wrapper">
          <div id="content">
            <div className="container-fluid">
              <div className="text-center mt-5">
                <div className="error mx-auto" data-text={errorCode}>
                  <p className="m-0">{errorCode}</p>
                </div>
                <p className="text-dark mb-5 lead">{errorMessage}</p>
                <p className="text-black-50 mb-0">It looks like you found a glitch in the matrix...</p>
                <a href="/">← Back to Home</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
