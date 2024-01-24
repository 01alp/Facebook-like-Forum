import React, { useState, useEffect } from 'react';
import { GroupCreateModal, JoinButton } from '../modules/Group';
import GroupImg from '../assets/img/socialFav.png';
import { Link } from 'react-router-dom';

const GroupPage = () => {
  document.title = 'Groups List';
  const [groupsInfo, setGroupsInfo] = useState([]); // Local state to store groups data
  const [refreshGroups, setRefreshGroups] = useState(false);

  const fetchGroups = () => {
    fetch('http://localhost:8080/getAllGroups', {
      method: 'POST',
      body: JSON.stringify({}),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (!data || data.length === 0) {
          return;
        }
        // Ensure each group has a members array
        const updatedData = data.map((group) => ({
          ...group,
          members: group.members || [], // Sets members to an empty array if it's null or undefined
        }));

        setGroupsInfo(updatedData); // Update local state with the modified data
        console.log(...updatedData);
      })
      .catch((err) => console.log(err));
  }; // Removed updateGroups dependency

  useEffect(() => {
    fetchGroups();
  }, [refreshGroups]);

  const onGroupUpdate = () => {
    fetchGroups(); // Re-fetch the groups data
  };
  return (
    <div className="container" id="mainContainer">
      <div className="row">
        <div className="col-12 col-sm-12 col-md-12 col-lg-3 col-xl-3 col-xxl-3" id="leftColumn">
          {/* Start: createGroupDiv */}
          <div
            className="createGroup"
            style={{
              padding: 5,
              boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
            }}
          >
            <h5 style={{ marginRight: 5, marginLeft: 5 }}>Create Group:</h5>
            <GroupCreateModal onGroupCreated={() => setRefreshGroups((prev) => !prev)} />
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 col-xxl-9" id="rightColumn">
          {/* Start: groupListpageDiv */}
          <div className="groupListpage">
            <div className="text-center">
              <h1>Groups:</h1>
            </div>
            {/* Start: groupWrapperDiv */}
            <div>
              {!groupsInfo || groupsInfo.length === 0 ? (
                <span className="text-center fw-bolder">Could not fetch any groups.</span>
              ) : (
                groupsInfo.map((item) => {
                  const groupProfileUrl = `/groupprofile/${item.id}`;
                  return (
                    <div
                      className="d-flex justify-content-between align-items-lg-center align-items-xl-center groupWrapper"
                      style={{
                        padding: 5,
                        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                        marginTop: 10,
                        marginRight: 10,
                      }}
                      key={item.id}
                      id={'group' + item.id}
                    >
                      <div className="d-flex align-items-xl-center cardDiv" id="cardDiv" style={{ padding: 5 }}>
                        <div id="groupwrapperImageDiv" className="groupWrapperImage">
                          <img className="rounded-circle" style={{ width: 52, margin: 5 }} src={GroupImg} alt="GroupImg" />
                        </div>
                        <div>
                          <div>
                            <Link to={groupProfileUrl}>
                              <h4>{item.title}</h4>
                            </Link>
                          </div>
                          <div>
                            <span>{item.description}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {item.members && (
                          <JoinButton
                            members={item.members}
                            userid={localStorage.getItem('user_id' ?? 0)}
                            groupid={item.id}
                            creator={item.creator}
                            callback={onGroupUpdate}
                          />
                        )}
                        <span
                          className="text-primary"
                          style={{
                            marginLeft: 3,
                            padding: 2,
                            borderRadius: 10,
                            opacity: '0.70',
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            fontWeight: 'bold',
                            fontSize: 18,
                          }}
                        >
                          {item.membercount} 🫂
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12"></div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
