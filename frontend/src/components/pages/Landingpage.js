import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import background from '../assets/img/background.jpg';
import logo from '../assets/img/socialNetworkLogo.png';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Welcome</title>
      </Helmet>
      <div
        className="wrapperDiv"
        style={{ backgroundImage: `url(${background})`, backgroundPosition: 'center', backgroundSize: 'cover', minHeight: '100vh' }}
      >
        <div style={{ marginTop: '5px' }}>
          <h1 className="display-1 text-center">Welcome</h1>
        </div>
        <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
          <div className="row d-md-flex d-lg-flex justify-content-between align-items-md-center align-items-lg-center">
            <div className="col-md-6 text-center">
              <img className="img-fluid border rounded-circle shadow-lg" src={logo} alt="Social Network Logo" style={{ marginTop: '0px' }} />
              <h1>Welcome page</h1>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-around align-items-lg-center">
                <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '200px', marginRight: '10px' }}>
                  Login
                </Link>
                <Link to="/reg" className="btn btn-primary btn-lg" style={{ width: '200px' }}>
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
        <footer className="text-right">
          <span style={{ margin: '5px', padding: '5px' }}>Copyright © alpbal 2023</span>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
