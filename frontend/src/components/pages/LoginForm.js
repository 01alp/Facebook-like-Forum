import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../store/auth-context';
import backgroundImage from '../assets/img/dogs/image3.jpeg';
import Layout from '../layouts/Layout';

const LoginForm = () => {
  const [enteredEmailOrUsername, setEnteredEmailOrUsername] = useState('');
  const [enteredPw, setEnteredPw] = useState('');
  const [loginErrMsg, setLoginErrMsg] = useState('');
  const navigate = useNavigate();
  const AuthCtx = useContext(AuthContext);

  useEffect(() => {
    setLoginErrMsg(AuthCtx.errMsg);
    navigate('/login', { replace: true });
  }, [AuthCtx.errMsg]);

  const emailOrUsernameChangeHandler = (e) => {
    setEnteredEmailOrUsername(e.target.value);
    // console.log(enteredEmail);
  };
  const pwChangeHandler = (e) => {
    setEnteredPw(e.target.value);
    // console.log(enteredPw);
  };

  const submitHandler = (e) => {
    // console.log('login');
    e.preventDefault();
    const loginPayloadObj = {
      emailOrUsername: enteredEmailOrUsername,
      pw: enteredPw,
    };
    console.log(loginPayloadObj);
    AuthCtx.onLogin(loginPayloadObj);
    setEnteredEmailOrUsername('');
    setEnteredPw('');

    AuthCtx.setErrMsg('');
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>
      <div className="bg-gradient-primary" style={{ minHeight: '100vh' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-9 col-lg-12 col-xl-10">
              <div className="card shadow-lg o-hidden border-0 my-5">
                <div className="card-body p-0">
                  <div className="row">
                    <div className="col-lg-6 d-none d-lg-flex" style={{ minHeight: '50vh' }}>
                      <div
                        className="flex-grow-1 bg-login-image"
                        style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                      ></div>
                    </div>
                    <div className="col-lg-6">
                      <div className="p-5">
                        <div className="text-center">
                          <h4 className="text-dark mb-4">Welcome Back!</h4>
                          <h2>{loginErrMsg}</h2>
                        </div>
                        <form className="user" onSubmit={submitHandler}>
                          <div className="mb-3">
                            <input
                              className="form-control form-control-user"
                              // type="email"
                              id="emailOrUsername"
                              // aria-describedby="emailHelp"
                              placeholder="Enter Email Address or Username..."
                              name="emailOrUsername"
                              value={enteredEmailOrUsername}
                              onChange={emailOrUsernameChangeHandler}
                            />
                          </div>
                          <div className="mb-3">
                            <input
                              className="form-control form-control-user"
                              type="password"
                              id="password"
                              placeholder="Password"
                              name="password"
                              value={enteredPw}
                              onChange={pwChangeHandler}
                            />
                          </div>
                          <div className="mb-3">
                            <div className="custom-control custom-checkbox small">
                              <div className="form-check">
                                <input
                                  className="form-check-input custom-control-input"
                                  type="checkbox"
                                  id="formCheck-1"
                                  //   checked={rememberMe}
                                  //   onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label custom-control-label" htmlFor="formCheck-1">
                                  Remember Me
                                </label>
                              </div>
                            </div>
                          </div>
                          <button className="btn btn-primary d-block btn-user w-100" type="submit">
                            Login
                          </button>
                        </form>
                        <div className="text-center">
                          {/* Replace with Link if using client-side routing */}
                          <p>
                            Don't have an account? <Link to={'/reg'}>Create an Account!</Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
