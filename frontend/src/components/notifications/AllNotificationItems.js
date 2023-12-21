import { useEffect, useState } from 'react';
import NotificationItems from './NotificationItems';

const AllNotificationItems = (props) => {
 // console.log('all notficifjw', props);

  const storedNotif = JSON.parse(localStorage.getItem('new_notif'));
  const [notiArr, setNotiArr] = useState([]);

  useEffect(() => {
    setNotiArr(storedNotif);
  }, []);

  useEffect(() => {
    localStorage.setItem('new_notif', JSON.stringify(Object.values(notiArr)));
  }, [notiArr]);

  const removeNotification = (notifId) => {
    const updatedNotiArr = notiArr.filter(noti => noti.id !== notifId);
    setNotiArr(updatedNotiArr);
    localStorage.setItem('new_notif', JSON.stringify(updatedNotiArr));
  };

  //console.log('last exit before bridge: ', notiArr);
  return (
    <div>
      {notiArr &&
        notiArr.map((notiItem) => {
          return (
            <NotificationItems
              key={notiItem.id}
              id={notiItem.id}
              type={notiItem.type}
              targetId={notiItem.targetid}
              sourceId={notiItem.sourceid}
              createdAt={notiItem.createdat}
              groupId={notiItem.groupid}
              onRemoveNotification={() => removeNotification(notiItem.id)}
            />
          );
        })}
    </div>
  );
};

export default AllNotificationItems;
