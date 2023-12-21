import { useContext } from 'react';
import { UsersContext } from '../store/users-context';
import { useNavigate } from 'react-router-dom';
import FollowNotif from './FollowNotif';
import ChatNotif from './ChatNotif';

const NotificationItems = (props) => {
  const navigate = useNavigate();
  const usersCtx = useContext(UsersContext);
  console.log("Props: ", props)
  console.log(usersCtx.usersList)
  const sourceUser = usersCtx.usersList.find((user) => user.id === props.sourceId);

  const removeNotiHandler = () => {
    console.log("Removing noti");
    props.onRemoveNotification(props.id);
  };

  let notificationContent;
  switch (props.type) {
    case 'follow-req':
      notificationContent = <FollowNotif srcUser={sourceUser} removeNoti={removeNotiHandler}/>;
      break;
    case 'chat-msg':
      notificationContent = <ChatNotif srcUser={sourceUser} removeNoti={removeNotiHandler}/>; //TODO: For group chat noti needs group info. Perhaps separate "private-chat-msg" and "group-chat-msg" notis?
      break;
    default:
      notificationContent = <div>Unknown notification type</div>;
  }

  return <div>{notificationContent}</div>
};

export default NotificationItems;
