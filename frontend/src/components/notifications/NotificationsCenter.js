import { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../store/auth-context';
import { WebSocketContext } from '../store/websocket-context';
import AllNotificationItems from './AllNotificationItems';

const NotificationsCenter = (props) => {
  const [showNoti, setShowNoti] = useState(false);
  const [newNoti, setNewNoti] = useState([]);
  const [showNotiBadge, setShowNotiBadge] = useState(false);
  const dropdownRef = useRef(null); // Reference to the dropdown

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
      let currentNotifArray = lastcurrentnotifarr ? JSON.parse(lastcurrentnotifarr) : [];
      console.log('current notifications: ', currentNotifArray);
      console.log('lastcurrentnotifarr empty ', lastcurrentnotifarr);

      const notifAlreadyExists = currentNotifArray.some((noti) => noti.id === wsCtx.newNotiObj.id);

      if (!notifAlreadyExists) {
        const updatedNotifArray = [wsCtx.newNotiObj, ...currentNotifArray];
        setNewNoti(updatedNotifArray); // Update state with new notification array
        localStorage.setItem('new_notif', JSON.stringify(updatedNotifArray)); // Update local storage
        console.log('added new notification: ', wsCtx.newNotiObj);
      } else {
        console.log('notification already exists: ', wsCtx.newNotiObj.id);
      }

      wsCtx.setNewNotiObj(null); // Clear ws context new noti after receiving it

      setShowNotiBadge(true);
    }
  }, [wsCtx, newNoti, showNoti]);

  const onShowNoti = () => {
    setShowNoti((prev) => !prev);
    setShowNotiBadge(false);
  };
  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNoti(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  return (
    <li className="nav-item dropdown no-arrow mx-1" ref={dropdownRef}>
      <div className="nav-item dropdown no-arrow" onClick={onShowNoti}>
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
