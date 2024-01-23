import React, { createContext, useState, useContext } from 'react';

const GroupContext = createContext();

export const useGroup = () => useContext(GroupContext);

export const GroupContextProvider = ({ children }) => {
  const [groupsInfo, setGroupsInfo] = useState([]);

  const updateGroups = (newGroups) => {
    setGroupsInfo(newGroups);
  };

  return <GroupContext.Provider value={{ groupsInfo, updateGroups }}>{children}</GroupContext.Provider>;
};
