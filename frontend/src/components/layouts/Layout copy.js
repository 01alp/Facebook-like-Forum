import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import defaultAvatar from '../images/default_avatar.jpg';
import { AuthContext } from '../store/auth-context';
import { WebSocketContext } from '../store/websocket-context';
import Avatar from '../modules/Avatar';

function Layout(props) {
  const authCtx = useContext(AuthContext);
  const navigateTo = useLocation();
  // console.log(props.children);

  const setSidebarToggle = () => {
    const wrapper = document.getElementById('sidebar');
    wrapper.classList.toggle('toggled');
  };
  const userId = +localStorage.getItem('user_id');
  const first = localStorage.getItem('fname');
  const last = localStorage.getItem('lname');
  const nickname = localStorage.getItem('nname');
  const avatar = localStorage.getItem('avatar');

  const navigate = useNavigate();
  const wsCtx = useContext(WebSocketContext);

  const onClickingLogout = () => {
    // props.onLogout();
    authCtx.onLogout();
    navigate('/', { replace: true });
  };

  return (
    <div>
      <div id="wrapper">
        <nav id="sidebar" className="navbar align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0 navbar-dark">
          <div className="container-fluid d-flex flex-column p-0">
            <Link to="/" className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0">
              <div className="sidebar-brand-icon rotate-n-15">
                <i className="fas fa-laugh-wink" />
              </div>
              <div className="sidebar-brand-text mx-3">
                <span style={{ fontSize: 15 }}>Social Network</span>
              </div>
            </Link>
            <hr className="sidebar-divider my-0" />
            <ul className="navbar-nav text-light" id="accordionSidebar">
              <li className={navigateTo.pathname === '/' ? ' nav-item' : ' nav-item'}>
                <Link className="nav-link" to="/">
                  <i className="fas fa-window-maximize" />
                  <span>Home</span>
                </Link>
                <Link className={navigateTo.pathname === '/chat' ? 'active nav-link' : ' nav-link'} to="/chat">
                  <i className="fas fa-window-maximize" />
                  <span>Chat</span>
                </Link>
                <Link className={navigateTo.pathname === '/group' ? 'active nav-link' : ' nav-link'} to="/group">
                  <i className="fas fa-window-maximize" />
                  <span>Group</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className={navigateTo.pathname === '/profile' ? 'active nav-link' : ' nav-link'} to={`/profile/${userId}`}>
                  <i className="fas fa-user" />
                  <span>{`${first} ${last}`}</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="#" onClick={authCtx.onLogout}>
                  <i className="far fa-caret-square-down" />
                  <span onClick={onClickingLogout}>Log out</span>
                </Link>
              </li>
            </ul>
            <div className="text-center d-none d-md-inline">
              <button className="btn rounded-circle border-0" id="sidebarToggle" type="button" onClick={() => setSidebarToggle()} />
            </div>
          </div>
        </nav>
        <div className="d-flex flex-column" id="content-wrapper">
          <div id="content">
            <nav className="navbar navbar-expand bg-white shadow mb-4 topbar static-top navbar-light">
              <div className="container-fluid">
                <button
                  className="btn btn-link d-md-none rounded-circle me-3"
                  id="sidebarToggleTop"
                  type="button"
                  onClick={() => setSidebarToggle()}
                >
                  <i className="fas fa-bars" />
                </button>
                <form className="d-none d-sm-inline-block me-auto ms-md-3 my-2 my-md-0 mw-100 navbar-search">
                  <div className="input-group">
                    <input className="bg-light form-control border-0 small" type="text" placeholder="Search for ..." />
                    <button className="btn btn-primary py-0" type="button">
                      <i className="fas fa-search" />
                    </button>
                  </div>
                </form>
                <ul className="navbar-nav flex-nowrap ms-auto">
                  <li className="nav-item dropdown d-sm-none no-arrow">
                    <Link className="dropdown-toggle nav-link" aria-expanded="false" data-bs-toggle="dropdown" to="/">
                      <i className="fas fa-search" />
                    </Link>
                    <div className="dropdown-menu dropdown-menu-end p-3 animated--grow-in" aria-labelledby="searchDropdown">
                      <form className="me-auto navbar-search w-100">
                        <div className="input-group">
                          <input className="bg-light form-control border-0 small" type="text" placeholder="Search for ..." />
                          <div className="input-group-append">
                            <button className="btn btn-primary py-0" type="button">
                              <i className="fas fa-search" />
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </li>
                  <li className="nav-item dropdown no-arrow mx-1">
                    <div className="nav-item dropdown no-arrow">
                      <Link className="dropdown-toggle nav-link" aria-expanded="false" data-bs-toggle="dropdown" to="/">
                        <span className="badge bg-danger badge-counter">3+</span>
                        <i className="fas fa-bell fa-fw" />
                      </Link>
                      <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in">
                        <h6 className="dropdown-header">Notifications</h6>
                        <Link className="dropdown-item d-flex align-items-center" href="/">
                          <div className="me-3">
                            <div className="bg-primary icon-circle">
                              <i className="fas fa-user-plus text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="small text-gray-500">30.10.2023</span>
                            <p>Fallow request. User 1 wants to follow you</p>
                            <div>
                              <button className="btn btn-primary btn-sm" type="button" style={{ marginRight: 10 }}>
                                Accept
                              </button>
                              <button className="btn btn-primary btn-sm" type="button">
                                Decline
                              </button>
                            </div>
                          </div>
                          {'{'}" "{'}'}
                        </Link>
                        <Link className="dropdown-item d-flex align-items-center" to="/">
                          <div className="me-3">
                            <div className="bg-success icon-circle">
                              <i className="fas fa-comment-dots text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="small text-gray-500">30.10.2023</span>
                            <p>You have a new Message</p>
                          </div>
                          {'{'}" "{'}'}
                        </Link>
                        <Link className="dropdown-item d-flex align-items-center" to="#">
                          <div className="me-3">
                            <div className="bg-warning icon-circle">
                              <i className="fas fa-exclamation-triangle text-white" />
                            </div>
                          </div>
                          <div>
                            <span className="small text-gray-500">30.10.2023</span>
                            <p>New upcoming Event</p>
                          </div>
                          {'{'}" "{'}'}
                        </Link>
                        <Link className="dropdown-item text-center small text-gray-500" to="#">
                          Show All Alerts
                        </Link>
                      </div>
                    </div>
                  </li>
                  <div className="d-none d-sm-block topbar-divider" />
                  <li className="nav-item dropdown no-arrow">
                    <div className="nav-item dropdown no-arrow">
                      <Link className="dropdown-toggle nav-link" aria-expanded="false" data-bs-toggle="dropdown" to={`/profile/${userId}`}>
                        <span className="d-none d-lg-inline me-2 text-gray-600 small">{`${first} ${last}`}</span>
                        <Avatar id={userId} src={avatar} showStatus={false} alt="" width={'52px'} />
                      </Link>
                      <div className="dropdown-menu shadow dropdown-menu-end animated--grow-in">
                        <Link className="dropdown-item" to={`/profile/${userId}`}>
                          <i className="fas fa-user fa-sm fa-fw me-2 text-gray-400" />
                          &nbsp;Profile
                        </Link>
                        <Link className="dropdown-item" to="#">
                          <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400" />
                          <span onClick={onClickingLogout}>Log out</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </nav>
            {props.children}
          </div>
          <footer className="bg-white sticky-footer">
            <div className="container my-auto">
              <div className="text-end my-auto copyright">
                <span>Copyright © alpbal 2023</span>
              </div>
            </div>
          </footer>
        </div>
        <a className="border rounded d-inline scroll-to-top" href="#page-top">
          <i className="fas fa-angle-up" />
        </a>
      </div>
    </div>
  );
}
export default Layout;
