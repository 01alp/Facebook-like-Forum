import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../store/auth-context';
import { WebSocketContext } from '../store/websocket-context';
import AllNotificationItems from './AllNotificationItems';

const NotificationsCenter = (props) => {
  const [showNoti, setShowNoti] = useState(false);
  const [newNoti, setNewNoti] = useState([]);
  const [showNotiBadge, setShowNotiBadge] = useState(false);

  const currUserId = localStorage.getItem('user_id');

  const authCtx = useContext(AuthContext);

  useEffect(() => {
    console.log('auth notif', authCtx.notif);
    if (authCtx.notif.length != 0) {
      setShowNotiBadge(true);
    }
  }, [authCtx]);

  const wsCtx = useContext(WebSocketContext);
  console.log('checkingwebsocket: ', wsCtx.newNotiObj);
  useEffect(() => {
    if (wsCtx.websocket !== null && wsCtx.newNotiObj !== null) {
      let check = false;
      if (showNoti && !check) {
        setShowNoti(false);
        check = true;
      }
      console.log('ws receives notiObj: ', typeof wsCtx.newNotiObj);
      console.log('ws receives noti type: ', wsCtx.newNotiObj.type);
      console.log('before the overwrite: ', newNoti);
      const lastcurrentnotifarr = localStorage.getItem('new_notif');
      console.log('lastcurrentnotifarr empty ', lastcurrentnotifarr);
      if (lastcurrentnotifarr != '[]') {
        console.log('new notif not empty1');

        setNewNoti(JSON.parse(lastcurrentnotifarr));
        console.log('empty new noti', newNoti);
      } else {
        console.log('new notif empty1');
        setNewNoti([]);
      }

      setShowNotiBadge(true);
    }
  }, [wsCtx.newNotiObj]);

  useEffect(() => {
    if (newNoti) {
      let newarr = [wsCtx.newNotiObj, ...newNoti];
      if (newarr[0] != null) {
        localStorage.setItem('new_notif', JSON.stringify(Object.values(newarr)));
      }
    }
  }, [newNoti, showNotiBadge]);

  const onShowNoti = () => {
    setShowNoti((prev) => !prev);
    setShowNotiBadge(false);
  };

  return (
    <li className="nav-item dropdown no-arrow mx-1" onClick={onShowNoti}>
      <div className="nav-item dropdown no-arrow">
        <Link className="dropdown-toggle nav-link" aria-expanded="false" data-bs-toggle="dropdown" to="/">
          <span className={`badge ${showNotiBadge ? 'bg-danger' : 'badge-gray'} badge-counter`}> {showNotiBadge && '+1'}</span>
          <i className="fas fa-bell fa-fw" />
        </Link>
        <div className="dropdown-menu dropdown-menu-end dropdown-list animated--grow-in" onClick={props.onClose}>
          <h6 className="dropdown-header">Notifications</h6>
          <div className="dropdown-item d-flex align-items-center">
            {newNoti && showNoti && <AllNotificationItems onClick={props.onClose} />}
          </div>
        </div>
      </div>
    </li>
  );
};
export default NotificationsCenter;
