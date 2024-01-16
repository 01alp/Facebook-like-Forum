import React, { useState, useEffect, useCallback, useRef } from 'react';
import GroupPagination from '../modules/GroupPagination';
import { GroupMemberList, JoinButton, GroupCreateModal, CreateEventModal } from '../modules/Group';
import { useLocation } from 'react-router-dom';

const groupsPerPage = 7; // can change this for better design 
function calculateTotalPages(count) {
  let totalGroupsReturn = Math.ceil(count / groupsPerPage); // rounds up
  return totalGroupsReturn;
}

const GroupPage = () => {
  document.title = "Groups"
  const isInitialMount = useRef(true);
  const [groups, setGroups] = useState(() => {
    return [];
  });
  const { hash } = useLocation();
  let groupNum
  if (hash) {
    groupNum = parseInt(hash.split('#')[1]);
  }
  console.log("HAAAAAAAASH: ", groupNum);

  const [page, setPage] = useState(() => {
    if (groupNum) {
      console.log("setting to page: ", groupNum / groupsPerPage, Math.ceil(groupNum / groupsPerPage))
      return Math.ceil(groupNum / groupsPerPage)
    }
    return 1;
  });
  const [totalPages, setTotalPages] = useState(() => 1);

  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const RequestGroupAdditionalInfo = useCallback((groupData) => {
    const reqOptions = {
      method: 'POST',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData)
    };

    fetch("http://localhost:8080/getGroupMembers", reqOptions)
      .then((resp) => resp.json())
      .then((data) => {
        setGroups(() => {
          let newData = groupData;

          for (const [, value] of Object.entries(data)) {
            newData.forEach((o, i) => {
              if (o.id === value.groupid) {
                newData[i] = { ...newData[i], members: value.members };
                return true; // stop searching
              }
            });
          };
          return [...newData];
        });
      })
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetch("http://localhost:8080/getGroupCount")
        .then((resp) => resp.json())
        .then((data) => {
          setTotalPages(calculateTotalPages(data.count));
        }).catch((err) => {
          console.log(err);
        });
    }
    fetch("http://localhost:8080/getGroups", { method: "POST", body: JSON.stringify({ offset: page * groupsPerPage - groupsPerPage, amount: groupsPerPage }) })
      .then((resp) => resp.json())
      .then((data) => {
        if (!data || data.length === 0) {
          return;
        }
        const dataCopy = Array.from(data);
        RequestGroupAdditionalInfo(dataCopy);
      })
      .catch((err) => console.log(err));
  }, [page, RequestGroupAdditionalInfo]); // insert onWebSocketGroupRefresh here (should fire when group is added/removed)

  const onPageChange = useCallback((page) => {
    setPage(page);
  }, []);

  const onGroupUpdate = useCallback(() => {
    const dataCopy = Array.from(groups);
    RequestGroupAdditionalInfo(dataCopy);
  }, [groups, RequestGroupAdditionalInfo]);

  return (
    <div className='w-100 d-flex justify-content-center flex-column align-items-center' id="GroupParent" style={{ height: "90%" }}>GroupPage
      {console.log("re-rendering groups page")}
      <div className="w-75 mx-5 d-flex flex-row" role="group" aria-label="Basic checkbox toggle button group" style={{ height: "5%" }}>
        <button className='btn btn-success shadow rounded-2 p-0 m-0 col-md-2' data-bs-toggle="modal" data-bs-target="#exampleModal" type='button'>
          <p className='fw-bolder mb-0 mx-1 text-wrap overflow-hidden lh-1' style={{ fontSize: '2vh' }}>Create group </p>
        </button>
      </div>

      <GroupCreateModal
      />

      {<CreateEventModal
          groupId={selectedGroupId}
          onClose={() => {
            setSelectedGroupId(null);
          }}
        />
      }

      <ul className='list-group h-100 w-75'>
        {!groups || groups.length === 0 ? <span className='text-center fw-bolder'>Could not fetch any groups.</span> : groups.map((item) => {
          return (
            <li className="list-group-item list-group-item-action p-0 col-md-6 shadow border-0 rounded-2" key={item.id}>
              <div className="bg-primary bg-gradient w-100 border rounded-2 collapsed text-white" aria-expanded="false" data-bs-toggle="collapse" data-bs-target={"#group" + item.id} role="button">
                <div className="d-flex w-100 justify-content-between">
                  <p className='fw-bolder fs-2 mb-2 lh-1 text-break'>{item.title}</p>
                  <p className="fs-6 fw-light mb-2 text-nowrap">Members: {item.membercount}</p>
                </div>
                <p className="fs-4 my-0 mb-2 lh-1 text-break" style={{ opacity: "90%" }}>{item.description}</p>
              </div>

              <div className={`${groupNum && item.id === groupNum ? "collapse.show" : "collapse"} shadow `} id={"group" + item.id} data-bs-parent="#GroupParent" >
                <div className="card card-body">
                  <div className='d-flex justify-content-between'>
                    {item.members && <GroupMemberList
                      members={item.members}
                      id={item.id}
                    />}

                    <button
                      className="btn btn-success shadow rounded-2 p-0 m-0 col-md-2"
                      onClick={() => {
                        setSelectedGroupId(item.id);
                      }}
                      style={{
                        height: "5vh"
                      }}
                      data-bs-toggle="modal"
                      data-bs-target="#createEventModal"
                    >
                      <p className="fw-bolder mb-0 mx-1 text-wrap overflow-hidden lh-1" style={{ fontSize: "2vh" }}>Create event</p>
                    </button>

                    {item.members && <JoinButton
                      members={item.members}
                      userid={localStorage.getItem("user_id" ?? 0)}
                      groupid={item.id}
                      callback={onGroupUpdate}
                    />}

                  </div>
                </div>
              </div>

            </li>
          );
        })}

      </ul>

      <GroupPagination
        total={totalPages}
        current={page}
        onChangePage={onPageChange}
      />
    </div>

  );


};

export default GroupPage;
