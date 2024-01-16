import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UsersContext } from './users-context';

export const AuthContext = React.createContext({
  isLoggedIn: null,
  onReg: (regPayloadObj) => {},
  onLogin: (loginPayloadObj) => {},
  onLogout: () => {},
  regSuccess: false,
  notif: [],
  errMsg: '',
  setErrMsg: () => {},
});

export const AuthContextProvider = (props) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [notif, setNotif] = useState([]);
  const [errMsg, setErrMsg] = useState('');
  const port = 8080;
  const backendUrl = `http://localhost:${port}`;
  const loginURL = `${backendUrl}/login`;
  const regURL = `${backendUrl}/register`;
  const logoutURL = `${backendUrl}/logout`;
  const authURL = `${backendUrl}/auth`;

  const navigate = useNavigate();
  const usersCtx = useContext(UsersContext);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const user = localStorage.getItem('user_id');
      if (!user) {
        return false;
      }
      let backendLoggedIn = false;
      try {
        const reqOptions = {
          method: 'POST',
          credentials: 'include',
          mode: 'cors',
        };
        const resp = await fetch(authURL, reqOptions);
        const authResp = await resp.text();
        if (resp.ok && authResp !== '0') {
          console.log('backend logged in user id: ', authResp);
          backendLoggedIn = true;
        }
      } catch (err) {
        console.log(err);
      }
      if (user && backendLoggedIn) {
        return true;
      }
      localStorage.clear();
      return false;
    };
    checkLoggedIn().then((res) => {
      setLoggedIn(res);
    });
  }, []);

  const regHandler = async (regPayloadObj) => {
    console.log('app.js', regPayloadObj);
    const reqOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(regPayloadObj),
    };

    try {
      const resp = await fetch(regURL, reqOptions);

      if (resp.status === 201) {
        console.log(await resp.text());
        setRegSuccess(true);
        // usersCtx.onNewUserReg();
        navigate('/login', { replace: true });
      } else {
        setRegSuccess(false);
        const err = await resp.text();
        console.log(err);
        setErrMsg(err);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loginHandler = async (loginPayloadObj) => {
    // console.log('app.js', loginPayloadObj);
    const credentials = btoa(`${loginPayloadObj.emailOrUsername}:${loginPayloadObj.pw}`);
    const reqOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify(loginPayloadObj),
    };

    try {
      const resp = await fetch(loginURL, reqOptions);
      // const data = await resp.json();
      // const msg = await resp.text();
      if (resp.ok) {
        const data = await resp.json();
        if (data) {
          console.log(data);
          setLoggedIn(true);
          // usersCtx.onUserLogin();
          localStorage.setItem('user_id', data.resp.id);
          localStorage.setItem('fname', data.resp.fname);
          localStorage.setItem('lname', data.resp.lname);
          localStorage.setItem('dob', data.resp.dob);
          data.resp.nname && localStorage.setItem('nname', data.resp.username);
          data.resp.avatar && localStorage.setItem('avatar', data.resp.avatar);
          data.resp.about && localStorage.setItem('about', data.resp.about);
          localStorage.setItem('public', data.resp.public);

          // TODO: notif stuff
          // localStorage.setItem('new_notif', '[]');
          // localStorage.setItem('new_notif', JSON.stringify(Object.values(data.notif)));
          // setNotif(Object.values(data.notif));
          navigate('/', { replace: true });
        } else {
          setLoggedIn(false);
          setErrMsg('No data returned');
          throw new Error('No data returned');
        }
      } else {
        setLoggedIn(false);
        const err = await resp.text();
        console.log(err);
        setErrMsg(err);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const logoutHandler = async () => {
    console.log('logging out...');

    const reqOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const resp = await fetch(logoutURL, reqOptions);
      if (resp.ok) {
        localStorage.clear();
        navigate('/', { replace: true });
      } else {
        console.log(await resp.text());
      }
    } catch (err) {
      console.log(err);
    }

    setLoggedIn(false);
    setRegSuccess(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: loggedIn,
        onReg: regHandler,
        onLogin: loginHandler,
        onLogout: logoutHandler,
        regSuccess: regSuccess,
        notif: notif,
        errMsg: errMsg,
        setErrMsg: setErrMsg,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
