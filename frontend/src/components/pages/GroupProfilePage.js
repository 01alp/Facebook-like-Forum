import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroup } from '../store/group-context';
import GroupImg from '../assets/img/socialFav.png';
import { CreateEventModal, GroupMemberList, JoinButton } from '../modules/Group';
import {RequestGroupAdditionalInfo} from '../pages/GroupPage'

const GroupProfilePage = () => {
  const { groupId } = useParams();
  const { groupsInfo, updateGroups } = useGroup();
  const [groupInfo, setGroupInfo] = useState(null);

  useEffect(() => {
    const foundGroup = groupsInfo.find((group) => group.id.toString() === groupId);
    setGroupInfo(foundGroup);
    console.log(groupInfo);
  }, [groupsInfo, groupId]);

  if (!groupInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container" id="mainContainer">
      <div className="row">
        <div className="col-12 col-sm-12 col-md-12 col-lg-4 col-xl-4 col-xxl-4" id="leftColumn">
          <div className="text-start" id="eventsDiv" style={{ textAlign: 'center' }}>
            <div>
              <a
                className="btn btn-primary btn-lg"
                data-bs-toggle="collapse"
                aria-expanded="false"
                aria-controls="collapse-1"
                href="#collapse-1"
                role="button"
                style={{ width: 100 }}
              >
                Events:
              </a>
              <div className="collapse" id="collapse-1">
                <p>Collapse content.</p>
                {/* Start: createEventDiv */}
                <CreateEventModal groupId={groupId} />
                {/* End: createEventForm */}
                {/* Start: Events List */}
                <div
                  className="createEvent"
                  style={{
                    padding: 5,
                    boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                    marginTop: 10,
                  }}
                >
                  <h5 style={{ marginRight: 5, marginLeft: 5 }}>Events List:</h5>
                  {/* Start: Events list Div */}
                  <div>
                    {/* Start: EventDiv */}
                    Event List
                  </div>
                  {/* End: Events list Div */}
                </div>
                {/* End: Events List */}
              </div>
              {/* End: createEventDiv */}
            </div>
          </div>
          <div className="text-start" id="group-users-list" style={{ marginTop: 20, textAlign: 'center' }}>
            {/* Start: listUsers */}
            <div
              style={{
                boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                maxWidth: 250,
                marginTop: 10,
              }}
            >
              {groupInfo.members && <GroupMemberList members={groupInfo.members} id={groupInfo.id} />}
            </div>
            {/* End: listUsers */}
          </div>
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-8 col-xl-8 col-xxl-8" id="rightColumn">
          {/* Start: groupListpageDiv */}
          <div className="groupListpage">
            <div className="text-center">
              <h1>{groupInfo.title}</h1>
            </div>
            {/* Start: groupProfileWrapperDiv */}
            <div
              className="d-flex justify-content-between align-items-lg-center align-items-xl-center groupProfileWrapper"
              style={{
                padding: 5,
                boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                margin: 10,
              }}
            >
              {/* Start: cardProfileDiv */}
              <div className="d-flex align-items-xl-center cardProfileDiv" style={{ padding: 5 }}>
                <div id="groupwrapperImageDiv" className="groupWrapperImage">
                  <img className="rounded-circle" style={{ width: 52, margin: 5 }} src={GroupImg} alt="GroupImg" />
                </div>
                <div>
                  <div id="groupTitle">
                    <h4>{groupInfo.title}</h4>
                  </div>
                  <div id="groupDesc">
                    <span>{groupInfo.description}</span>
                  </div>
                </div>
              </div>
              {/* End: cardProfileDiv */}
              <div>
                {groupInfo.members && (
                  <JoinButton
                    members={groupInfo.members}
                    userid={localStorage.getItem('user_id' ?? 0)}
                    groupid={groupInfo.id}
                    
                    callback={() => {RequestGroupAdditionalInfo(Array.from(groupsInfo), updateGroups)}}
                  />
                )}
              </div>
            </div>
          </div>
          {/* End: groupListpageDiv */}
          {/* Start: GroupPosts */}
          <div>Group Posts here</div>
          {/* End: GroupPosts */}
        </div>
      </div>
    </div>
  );
};

export default GroupProfilePage;
