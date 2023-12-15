import React from 'react';
import { Helmet } from 'react-helmet';

const ChatPage = () => {
  return (
    <>
      <Helmet>
        <title>Chat</title>
      </Helmet>
      <div className="container-fluid">
        <h3 className="text-dark mb-1" style={{ textAlign: 'center' }}>
          Chat
        </h3>
        <div>
          <div>
            <ul className="nav nav-pills" role="tablist">
              <li className="nav-item" role="presentation">
                <a className="nav-link active" role="tab" data-bs-toggle="pill" href="#tab-1" aria-selected="true">
                  Users
                </a>
              </li>
              <li className="nav-item" role="presentation">
                <a className="nav-link" role="tab" data-bs-toggle="pill" href="#tab-2" aria-selected="false" tabIndex={-1}>
                  Groups
                </a>
              </li>
            </ul>
            <div className="tab-content">
              <div className="tab-pane fade show active" role="tabpanel" id="tab-1">
                {/* Start: tabUserWrapper */}
                <div className="d-flex flex-wrap">
                  {/* Start: User List */}
                  <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4 col-xxl-3">
                    {/* Start: usersfollowing */}
                    <div
                      style={{
                        boxShadow: '3px 3px 5px 5px',
                        margin: 5,
                        padding: 5,
                        color: 'var(--bs-body-bg)',
                        background: 'var(--bs-primary)',
                        width: 250,
                      }}
                    >
                      <h5>Users you are following:</h5>
                    </div>
                    {/* End: usersfollowing */}
                    {/* Start: UsersListContainer */}
                    <div>
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>🟢</span>
                          <span className="flash animated" style={{ marginRight: 3 }}>
                            💬
                          </span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/avatars/avatar2.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>User nick</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>⚪</span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/avatars/avatar1.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>User2&nbsp; nick</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                    </div>
                    {/* End: UsersListContainer */}
                    {/* Start: Other Users */}
                    <div
                      style={{
                        boxShadow: '3px 3px 5px 5px',
                        margin: 5,
                        padding: 5,
                        color: 'var(--bs-body-bg)',
                        background: 'var(--bs-primary)',
                        width: 250,
                      }}
                    >
                      <h5>Other Users:</h5>
                    </div>
                    {/* End: Other Users */}
                    {/* Start: OtherUsersListContainer */}
                    <div>
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>⚪</span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/avatars/avatar3.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>User nick</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>🟢</span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/avatars/avatar4.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>User2&nbsp; nick</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                    </div>
                    {/* End: OtherUsersListContainer */}
                  </div>
                  {/* End: User List */}
                  {/* Start: Chat */}
                  <div
                    className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-8 col-xxl-9"
                    style={{
                      padding: 5,
                      boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                    }}
                  >
                    {/* Start: ChatWrapper */}
                    <div style={{ color: 'var(--bs-body-bg)', height: 500 }}>
                      {/* Start: chatBox */}
                      <div style={{ margin: 5, padding: 5 }}>
                        {/* Start: messageWrapper */}
                        <div
                          className="border rounded-pill"
                          style={{
                            margin: 5,
                            boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                            marginBottom: 15,
                            padding: 5,
                            color: 'rgb(0, 0, 0)',
                          }}
                        >
                          {/* Start: UserName */}
                          <div
                            style={{
                              paddingLeft: 20,
                              borderRadius: 10,
                              borderBottomWidth: 2,
                              borderBottomStyle: 'inset',
                              background: 'var(--bs-primary)',
                              marginRight: 20,
                              marginLeft: 20,
                              color: 'var(--bs-body-bg)',
                            }}
                          >
                            <span>User1</span>
                          </div>
                          {/* End: UserName */}
                          {/* Start: message */}
                          <div className="d-flex" style={{ padding: 10, margin: 0 }}>
                            <span>Message text&nbsp;</span>
                          </div>
                          {/* End: message */}
                        </div>
                        {/* End: messageWrapper */}
                      </div>
                      {/* End: chatBox */}
                    </div>
                    {/* End: ChatWrapper */}
                    {/* Start: messageForm */}
                    <div style={{ margin: 5, padding: 5 }}>
                      <form
                        className="d-flex justify-content-start flex-wrap align-items-md-center align-items-lg-center"
                        style={{
                          borderStyle: 'inset',
                          borderRadius: 10,
                          margin: 5,
                          padding: 5,
                        }}
                      >
                        {/* Start: textArea */}
                        <div style={{ width: '70%' }}>
                          <textarea className="form-control" placeholder="Send message..." defaultValue={''} />
                        </div>
                        {/* End: textArea */}
                        <div className="d-flex align-items-sm-center">
                          {/* Start: Smiley */}
                          <div style={{ marginLeft: 5, marginRight: 5 }}>
                            <i
                              className="far fa-smile"
                              style={{
                                fontSize: 32,
                                color: 'var(--bs-yellow)',
                              }}
                            />
                          </div>
                          {/* End: Smiley */}
                          {/* Start: button */}
                          <div>
                            <button className="btn btn-primary btn-sm" type="submit">
                              <i className="far fa-paper-plane" style={{ fontSize: 24 }} />
                            </button>
                          </div>
                          {/* End: button */}
                        </div>
                      </form>
                    </div>
                    {/* End: messageForm */}
                  </div>
                  {/* End: Chat */}
                </div>
                {/* End: tabUserWrapper */}
              </div>
              <div className="tab-pane fade" role="tabpanel" id="tab-2">
                {/* Start: tabGroupWrapper */}
                <div className="d-flex flex-wrap">
                  {/* Start: Group List */}
                  <div className="col-12 col-sm-12 col-md-12 col-lg-5 col-xl-4 col-xxl-3">
                    {/* Start: Groups Following */}
                    <div
                      style={{
                        boxShadow: '3px 3px 5px 5px',
                        margin: 5,
                        padding: 5,
                        color: 'var(--bs-body-bg)',
                        background: 'var(--bs-primary)',
                        width: 250,
                      }}
                    >
                      <h5>Groups you have joined:</h5>
                    </div>
                    {/* End: Groups Following */}
                    {/* Start: GroupListContainer */}
                    <div>
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>🟢</span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/dogs/image3.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>Group title</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                      {/* Start: userchatLine */}
                      <div
                        className="d-flex d-lg-flex align-items-lg-center"
                        style={{
                          padding: 5,
                          margin: 5,
                          boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                          marginBottom: 10,
                          width: 250,
                        }}
                      >
                        {/* Start: Online */}
                        <div>
                          <span style={{ marginRight: 5 }}>🟢</span>
                        </div>
                        {/* End: Online */}
                        {/* Start: Avatar */}
                        <div>
                          <img className="rounded-circle" src="assets/img/avatars/avatar5.jpeg" style={{ width: 32, marginRight: 5 }} />
                        </div>
                        {/* End: Avatar */}
                        <div>
                          <span>Dog lovers</span>
                        </div>
                      </div>
                      {/* End: userchatLine */}
                    </div>
                    {/* End: GroupListContainer */}
                  </div>
                  {/* End: Group List */}
                  {/* Start: Chat */}
                  <div
                    className="col-12 col-sm-12 col-md-12 col-lg-7 col-xl-8 col-xxl-9"
                    style={{
                      padding: 5,
                      boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                    }}
                  >
                    {/* Start: ChatWrapper */}
                    <div style={{ color: 'var(--bs-body-bg)', height: 500 }}>
                      {/* Start: chatBox */}
                      <div style={{ margin: 5, padding: 5 }}>
                        {/* Start: messageWrapper */}
                        <div
                          className="border rounded-pill"
                          style={{
                            margin: 5,
                            boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
                            marginBottom: 15,
                            background: 'var(--bs-primary)',
                            padding: 5,
                          }}
                        >
                          {/* Start: UserName */}
                          <div
                            style={{
                              paddingLeft: 20,
                              borderRadius: 10,
                              borderBottomWidth: 2,
                              borderBottomStyle: 'inset',
                            }}
                          >
                            <span>User1</span>
                          </div>
                          {/* End: UserName */}
                          {/* Start: message */}
                          <div className="d-flex" style={{ padding: 10, margin: 0 }}>
                            <span>Message text&nbsp;</span>
                          </div>
                          {/* End: message */}
                        </div>
                        {/* End: messageWrapper */}
                      </div>
                      {/* End: chatBox */}
                    </div>
                    {/* End: ChatWrapper */}
                    {/* Start: messageForm */}
                    <div style={{ margin: 5, padding: 5 }}>
                      <form
                        className="d-flex justify-content-start flex-wrap align-items-md-center align-items-lg-center"
                        style={{
                          borderStyle: 'inset',
                          borderRadius: 10,
                          margin: 5,
                          padding: 5,
                        }}
                      >
                        {/* Start: textArea */}
                        <div style={{ width: '70%' }}>
                          <textarea className="form-control" placeholder="Send message..." defaultValue={''} />
                        </div>
                        {/* End: textArea */}
                        <div className="d-flex align-items-sm-center">
                          {/* Start: Smiley */}
                          <div style={{ marginLeft: 5, marginRight: 5 }}>
                            <i
                              className="far fa-smile"
                              style={{
                                fontSize: 32,
                                color: 'var(--bs-yellow)',
                              }}
                            />
                          </div>
                          {/* End: Smiley */}
                          {/* Start: button */}
                          <div>
                            <button className="btn btn-primary btn-sm" type="submit">
                              <i className="far fa-paper-plane" style={{ fontSize: 24 }} />
                            </button>
                          </div>
                          {/* End: button */}
                        </div>
                      </form>
                    </div>
                    {/* End: messageForm */}
                  </div>
                  {/* End: Chat */}
                </div>
                {/* End: tabGroupWrapper */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPage;
