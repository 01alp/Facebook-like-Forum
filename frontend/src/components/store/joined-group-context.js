import React, { useCallback, useEffect, useState } from 'react';

export const JoinedGroupContext = React.createContext({
  joinedGroups: [],
  getJoinedGroups: () => {},
});

export const JoinedGroupContextProvider = ({ children, userId }) => {
  const [joinedGroups, setJoinedGroups] = useState([]);

  const getJoinedGroupsHandler = useCallback(() => {
    const effectiveUserId = userId || localStorage.getItem('user_id');
    fetch(`http://localhost:8080/getJoinedGroups?userID=${effectiveUserId}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error - status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        console.log('joinedGroupsArr (context): ', data);
        setJoinedGroups([...new Set(data)]);
      })
      .catch((err) => console.log('Error fetching joined groups:', err));
  }, [userId]);

  useEffect(() => {
    getJoinedGroupsHandler();
  }, [getJoinedGroupsHandler]);

  return (
    <JoinedGroupContext.Provider value={{ joinedGroups, getJoinedGroups: getJoinedGroupsHandler }}>{children}</JoinedGroupContext.Provider>
  );
};
