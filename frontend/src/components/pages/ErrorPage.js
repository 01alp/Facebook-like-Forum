import React, { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import Helmet from 'react-helmet';

const ErrorPage = () => {
  return (
    <>
      <Helmet>
        <title>Error</title>
      </Helmet>
      <div id="wrapper">
        <div className="d-flex flex-column" id="content-wrapper">
          <div id="content">
            <div className="container-fluid">
              <div className="text-center mt-5">
                <div className="error mx-auto" data-text="404">
                  <p className="m-0">404</p>
                </div>
                <p className="text-dark mb-5 lead">Page Not Found</p>
                <p className="text-black-50 mb-0">It looks like you found a glitch in the matrix...</p>
                <a href="/">← Back to Home</a>
              </div>
            </div>
          </div>
          <footer className="bg-white sticky-footer">
            <div className="container my-auto">
              <div className="text-center my-auto copyright">
                <span>Copyright © alpbal 2023</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default ErrorPage;
