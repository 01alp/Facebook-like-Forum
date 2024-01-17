import React, { useState } from 'react';

const GroupPage = () => {
  const [refresh, setRefresh] = useState(false);

  function createGroupUpdate() {
    refresh ? setRefresh(false) : setRefresh(true);
  }

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
            {/* Start: createGroupForm */}
            <form className="createGroupForm" style={{ margin: 5, padding: 5 }}>
              <input className="form-control" type="text" placeholder="Title:" style={{ marginBottom: 5 }} />
              <textarea className="form-control" placeholder="Description" style={{ marginBottom: 0 }} defaultValue={''} />
              <button className="btn btn-primary" type="submit" style={{ marginTop: 10 }}>
                Create
              </button>
            </form>
            {/* End: createGroupForm */}
          </div>
          {/* End: createGroupDiv */}
        </div>
        <div className="col-12 col-sm-12 col-md-12 col-lg-9 col-xl-9 col-xxl-9" id="rightColumn">
          {/* Start: groupListpageDiv */}
          <div className="groupListpage">
            <div className="text-center">
              <h1>Groups:</h1>
            </div>
            {/* Start: groupWrapperDiv */}
            <div
              className="d-flex justify-content-between align-items-lg-center align-items-xl-center groupWrapper"
              style={{
                padding: 5,
                boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                marginTop: 10,
                marginRight: 10,
              }}
            >
              <div className="d-flex align-items-xl-center cardDiv" id="cardDiv" style={{ padding: 5 }}>
                <div id="groupwrapperImageDiv" className="groupWrapperImage">
                  <img className="rounded-circle" style={{ width: 52, margin: 5 }} src="assets/img/dogs/image3.jpeg" />
                </div>
                <div>
                  <div id="groupTitle">
                    <a href="groupProfile.html">
                      <h4>Group Title</h4>
                    </a>
                  </div>
                  <div id="groupDesc">
                    <span>Group Desc..</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary" type="button" style={{ marginRight: 10 }}>
                Joined
              </button>
            </div>
            {/* End: groupWrapperDiv */}
          </div>
          {/* End: groupListpageDiv */}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
