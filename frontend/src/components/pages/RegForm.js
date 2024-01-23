import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthContext } from '../store/auth-context';
import backgroundImage from '../assets/img/dogs/image2.jpeg';

const RegForm = () => {
  // const imageSrc = '../../images';
  // let defaultImagePath = 'default_avatar.jpg';

  const ctx = useContext(AuthContext);

  const [enteredEmail, setEnteredEmail] = useState('');
  const [enteredPw, setEnteredPw] = useState('');
  const [enteredRepeatPw, setEnteredRepeatPw] = useState('');
  const [enteredFName, setEnteredFName] = useState('');
  const [enteredLName, setEnteredLName] = useState('');
  const [enteredDob, setEnteredDob] = useState('');
  const [uploadedImg, setUploadedImg] = useState('');
  const [enteredNickname, setEnteredNickname] = useState('');
  const [enteredAbout, setEnteredAbout] = useState('');
  const [regErrMsg, setRegErrMsg] = useState('');
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    setRegErrMsg(ctx.errMsg);
  }, [ctx.errMsg]);

  const emailChangeHandler = (e) => {
    setEnteredEmail(e.target.value);
    // console.log(enteredEmail);
  };
  const fNameChangeHandler = (e) => {
    setEnteredFName(e.target.value);
    // console.log(enteredFName);
  };
  const lNameChangeHandler = (e) => {
    setEnteredLName(e.target.value);
    // console.log(enteredLName);
  };
  const dobChangeHandler = (e) => {
    setEnteredDob(e.target.value);
    // console.log(enteredDob);
  };
  const avatarHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', () => {
      // console.log(reader.result);
      setUploadedImg(reader.result);
    });

    setUploadedImg(e.target.value);
    // console.log(uploadedImg);
  };
  const nicknameChangeHandler = (e) => {
    setEnteredNickname(e.target.value);
  };
  const aboutChangeHandler = (e) => {
    setEnteredAbout(e.target.value);
  };

  // password stuff
  const pwChangeHandler = (e) => {
    setEnteredPw(e.target.value);
    // console.log(enteredPw);
  };
  const handlePasswordMatch = (value) => {
    if (value === '') {
      setRegErrMsg('');
    } else if (enteredPw !== value) {
      setRegErrMsg('Passwords do not match');
    } else {
      setRegErrMsg('');
    }
  };
  const pwRepeatChangeHandler = (e) => {
    const value = e.target.value;

    // Clear any existing timeout
    clearTimeout(timeoutIdRef.current);

    // Set a new timeout to trigger the function after 500ms of inactivity
    timeoutIdRef.current = setTimeout(() => {
      handlePasswordMatch(value);
    }, 500);

    setEnteredRepeatPw(value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const regPayloadObj = {
      email: enteredEmail,
      password: enteredPw,
      fname: enteredFName,
      lname: enteredLName,
      dob: new Date(enteredDob),
      avatar: uploadedImg,
      nname: enteredNickname,
      about: enteredAbout,
    };
    console.log(regPayloadObj);

    ctx.onReg(regPayloadObj);
  };

  const resetValues = () => {
    setEnteredEmail('');
    setEnteredPw('');
    setEnteredRepeatPw('');
    setEnteredFName('');
    setEnteredLName('');
    setEnteredDob('');
    setUploadedImg('');
    setEnteredNickname('');
    setEnteredAbout('');
    setRegErrMsg('');
  };
  // reset values on successful registration
  useEffect(() => {
    if (ctx.regSuccess) {
      resetValues();
    }
  }, [ctx.regSuccess]);

  return (
    <>
      <Helmet>
        <title>Register</title>
      </Helmet>
      <div className="container-fluid" style={{ minHeight: '100vh' }}>
        <div className="container">
          <div className="card shadow-lg o-hidden border-0 my-5">
            <div className="card-body p-0">
              <div className="row">
                <div className="col-lg-5 d-none d-lg-flex">
                  <div className="flex-grow-1 bg-register-image" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
                </div>
                <div className="col-lg-7">
                  <div className="p-5">
                    <div className="text-center">
                      <h4 className="text-dark mb-4">Create an Account!</h4>
                      <h2>{regErrMsg}</h2>
                    </div>
                    <form className="user" onSubmit={submitHandler}>
                      <div className="row mb-3">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <input
                            className="form-control form-control-user"
                            type="text"
                            id="exampleFirstName"
                            placeholder="First Name*"
                            name="first_name"
                            value={enteredFName}
                            onChange={fNameChangeHandler}
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <input
                            className="form-control form-control-user"
                            type="text"
                            id="exampleLastName"
                            placeholder="Last Name*"
                            name="last_name"
                            value={enteredLName}
                            onChange={lNameChangeHandler}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <input
                          className="form-control form-control-user"
                          type="email"
                          id="exampleInputEmail"
                          aria-describedby="emailHelp"
                          placeholder="Email Address*"
                          name="email"
                          value={enteredEmail}
                          onChange={emailChangeHandler}
                          required
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col-sm-6 mb-3 mb-sm-0">
                          <input
                            className="form-control form-control-user"
                            type="password"
                            id="examplePasswordInput"
                            placeholder="Password*"
                            name="password"
                            value={enteredPw}
                            onChange={pwChangeHandler}
                            required
                          />
                        </div>
                        <div className="col-sm-6">
                          <input
                            className="form-control form-control-user"
                            type="password"
                            placeholder="Repeat Password*"
                            value={enteredRepeatPw}
                            onChange={pwRepeatChangeHandler}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ margin: '10px', padding: '5px' }}>
                        <p>Date of Birth*</p>
                        <input
                          className="border rounded-pill form-control"
                          type="date"
                          name="Dob"
                          value={enteredDob}
                          onChange={dobChangeHandler}
                          required
                        />
                      </div>
                      <div style={{ margin: '10px', padding: '5px' }}>
                        <p>Choose Avatar:</p>
                        <div className="text-center">
                          <img
                            className="rounded-circle img-fluid"
                            style={{ width: '150px', margin: '10px' }}
                            src={uploadedImg || require('../images/default_avatar.jpg')}
                            alt="Avatar Preview"
                          />
                        </div>
                        <input className="form-control" type="file" name="avatar" onChange={avatarHandler} />
                      </div>
                      <div style={{ margin: '10px', padding: '5px' }}>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Username"
                          name="nname"
                          value={enteredNickname}
                          onChange={nicknameChangeHandler}
                        />
                      </div>
                      <div style={{ margin: '10px', padding: '5px' }}>
                        <textarea
                          className="form-control"
                          name="about"
                          placeholder="About me..."
                          value={enteredAbout}
                          onChange={aboutChangeHandler}
                        ></textarea>
                      </div>
                      <button className="btn btn-primary d-block btn-user w-100" type="submit">
                        Register Account
                      </button>
                      <hr />
                    </form>
                    <div className="text-center">
                      <Link to="/login" className="small">
                        Already have an account? Login!
                      </Link>
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

export default RegForm;
