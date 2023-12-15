import React, { useEffect, useState } from 'react';

export const UsersContext = React.createContext({
  usersList: [],
  onNewUserReg: () => {},
  onUserLogin: () => {},
  // onlineUsers: [],
  getUsers: () => {},
});

export const UsersContextProvider = (props) => {
  const [usersList, setUsersList] = useState([]);

  useEffect(() => {
    getUsersHandler();
  }, []);

  // get users
  const getUsersHandler = async () => {
    console.log('users-context: fetching users...');
    const userUrl = 'http://localhost:8080/users';
    const options = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const resp = await fetch(userUrl, options);
      if (resp.ok) {
        const data = await resp.json();

        // usersArr.sort((a, b) => a.id - b.id);
        // console.log('Users data: ', data);
        setUsersList(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(getUsersHandler, []);
  // useEffect(getInitialUserPrivacy, []);

  return (
    <UsersContext.Provider
      value={{
        usersList: usersList,
        onNewUserReg: getUsersHandler,
        onUserLogin: getUsersHandler,
        // onlineUsers: onlineUsersList,
        getUsers: getUsersHandler,
      }}
    >
      {props.children}
    </UsersContext.Provider>
  );
};
