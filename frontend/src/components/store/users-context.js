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
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const resp = await fetch(userUrl, options);
      if (resp.ok) {
        const data = await resp.json();
        setUsersList(data);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateUserInList = (updatedUserData) => {
    setUsersList(currentUsersList => {
      console.log("Current users list: ", currentUsersList)
      return currentUsersList.map(user => {
        console.log("updatedUserData: ", updatedUserData)
        console.log("Current user in map: ", user)
        if (user.id === updatedUserData.id) {
          return { ...user, ...updatedUserData };
        }
        return user;
      });
    });
  };

  return (
    <UsersContext.Provider
      value={{
        usersList: usersList,
        updateUserInList: updateUserInList,
        onNewUserReg: getUsersHandler,
        onUserLogin: getUsersHandler,
        getUsers: getUsersHandler,
      }}
    >
      {props.children}
    </UsersContext.Provider>
  );
};
