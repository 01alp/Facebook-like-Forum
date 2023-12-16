import { useContext } from 'react';
import { UsersContext } from '../store/users-context';
import { useNavigate } from 'react-router-dom';
import FollowNotif from './FollowNotif';

const NotificationItems = (props) => {
  const navigate = useNavigate();
  const usersCtx = useContext(UsersContext);
  const sourceUser = usersCtx.users.find((user) => user.id === props.sourceId);

  console.log('props.grouptitle (item)', props);
  return <div>{props.type === 'follow-req' && <FollowNotif srcUser={sourceUser} targetId={props.targetId} />}</div>;
};

export default NotificationItems;