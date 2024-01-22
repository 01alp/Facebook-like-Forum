import React, { useState, useEffect, useCallback, useContext } from 'react';
import { GroupCreateModal, JoinButton } from '../modules/Group';
import GroupImg from '../assets/img/socialFav.png';
import { Link } from 'react-router-dom';
import { useGroup } from '../store/group-context';

const GroupPage = () => {
  document.title = 'Groups List';
  const [refreshGroups, setRefreshGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const { groupsInfo, updateGroups } = useGroup();

  const RequestGroupAdditionalInfo = useCallback((groupData) => {
    const reqOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    };

    fetch('http://localhost:8080/getGroupMembers', reqOptions)
      .then((resp) => resp.json())
      .then((data) => {
        setGroups(() => {
          let newData = groupData.map((group) => {
            return { ...group, members: group.members || [] };
          });

          for (const [, value] of Object.entries(data)) {
            newData.forEach((o, i) => {
              if (o.id === value.groupid) {
                newData[i] = { ...newData[i], members: value.members };
                return true; // stop searching
              }
            });
          }
          console.log('newData', newData);

          updateGroups(newData);
          return [...newData];
        });
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetch('http://localhost:8080/getGroups', {
      method: 'POST',
      body: JSON.stringify({}),
    })
      .then((resp) => resp.json())
      .then((data) => {
        if (!data || data.length === 0) {
          return;
        }
        const dataCopy = Array.from(data);
        RequestGroupAdditionalInfo(dataCopy);
      })
      .catch((err) => console.log(err));
  }, [RequestGroupAdditionalInfo, refreshGroups]);

  const onGroupUpdate = useCallback(() => {
    const dataCopy = Array.from(groups);
    RequestGroupAdditionalInfo(dataCopy);
  }, [groups, RequestGroupAdditionalInfo]);

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
              {!groups || groups.length === 0 ? (
                <span className="text-center fw-bolder">Could not fetch any groups.</span>
              ) : (
                groups.map((item) => {
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
