import React, { useEffect, useState } from 'react';

export const GroupContext = React.createContext({
  groups: [],
  onNewGroupCreated: () => {},
});

export const GroupContextProvider = (props) => {
  const [groupsList, setGroupsList] = useState([]);

  //Get Groups

  const getGroupsHandler = () => {
    fetch(`http://localhost:8080/getAllGroups`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (!resp.ok) {
          throw new Error(`HTTP error - status: ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        console.log('group (context): ', data);
        let [groupsArr] = Object.values(data);
        setGroupsList(groupsArr);
      })
      .catch((err) => console.log('Error fetching joined groups:', err));
  };

  useEffect(getGroupsHandler, []);

  return (
    <GroupContext.Provider value={{ groups: groupsList, onNewGroupCreated: getGroupsHandler }}>{props.children}</GroupContext.Provider>
  );
};
