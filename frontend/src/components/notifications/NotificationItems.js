import { useContext } from 'react';
import { UsersContext } from '../store/users-context';
import FollowNotif from './FollowNotif';
import PrivateChatNotif from './PrivateChatNotif';
import GroupChatNotif from './GroupChatNotif';
import GroupNotif from './GroupNotif';

const NotificationItems = (props) => {
  const usersCtx = useContext(UsersContext);
  const sourceUser = usersCtx.usersList.find((user) => user.id === props.sourceId);

  const removeNotiHandler = () => {
    props.onRemoveNotification(props.id);
  };

  let notificationContent;
  switch (props.type) {
    case 'follow-req':
      notificationContent = <FollowNotif srcUser={sourceUser} removeNoti={removeNotiHandler} />;
      break;
    case 'private-chat-msg':
      notificationContent = <PrivateChatNotif srcUser={sourceUser} removeNoti={removeNotiHandler} />;
      break;
    case 'group-chat-msg':
      notificationContent = <GroupChatNotif srcUser={sourceUser} groupId={props.groupId} groupName={props.groupName} removeNoti={removeNotiHandler} />;
      break;
    case 'new_group_request':
      notificationContent = <GroupNotif srcUser={sourceUser} groupPayload={props.groupPayload} removeNoti={removeNotiHandler} />;
      break;
    default:
      notificationContent = <div>Unknown notification type ({props.type})</div>;
  }

  return <div>{notificationContent}</div>;
};

export default NotificationItems;
