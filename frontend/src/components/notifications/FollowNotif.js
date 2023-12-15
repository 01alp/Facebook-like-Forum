import { useContext, useState } from 'react';
import { WebSocketContext } from '../store/websocket-context';
import Avatar from '../modules/Avatar';
import { useNavigate } from 'react-router-dom';

const FollowNotif = (props) => {
  const navigate = useNavigate();

  const wsCtx = useContext(WebSocketContext);
  const [isVisible, setIsVisible] = useState(true);

  const acceptFollowReqHandler = () => {
    setIsVisible(false);

    console.log('request accepted: ');
    const notiReplyPayloadObj = {};
    notiReplyPayloadObj['label'] = 'noti';
    notiReplyPayloadObj['id'] = Date.now();
    notiReplyPayloadObj['type'] = 'follow-req-reply';
    notiReplyPayloadObj['sourceid'] = props.targetId;
    notiReplyPayloadObj['targetid'] = props.srcUser.id;
    notiReplyPayloadObj['accepted'] = true;
    console.log('gonna send reply (accept) to fol req : ', notiReplyPayloadObj);
    if (wsCtx.websocket !== null) wsCtx.websocket.send(JSON.stringify(notiReplyPayloadObj));
    let notifarr = JSON.parse(localStorage.getItem('new_notif'));
    for (let i = 0; i < notifarr.length; i++) {
      if (notifarr[i].sourceid == props.srcUser.id && notifarr[i].type == 'follow-req') {
        notifarr.splice(i, 1);
        localStorage.setItem('new_notif', JSON.stringify(Object.values(notifarr)));
        break;
      }
    }
  };
  const declineFollowReqHandler = () => {
    setIsVisible(false);

    console.log('request declined: ');
    const notiReplyPayloadObj = {};
    notiReplyPayloadObj['label'] = 'noti';
    notiReplyPayloadObj['id'] = Date.now();
    notiReplyPayloadObj['type'] = 'follow-req-reply';
    notiReplyPayloadObj['sourceid'] = props.targetId;
    notiReplyPayloadObj['targetid'] = props.srcUser.id;
    notiReplyPayloadObj['accepted'] = false;
    console.log('gonna send reply (decline) to fol req : ', notiReplyPayloadObj);
    if (wsCtx.websocket !== null) wsCtx.websocket.send(JSON.stringify(notiReplyPayloadObj));
    let notifarr = JSON.parse(localStorage.getItem('new_notif'));
    for (let i = 0; i < notifarr.length; i++) {
      if (notifarr[i].sourceid == props.srcUser.id && notifarr[i].type == 'follow-req') {
        notifarr.splice(i, 1);
        localStorage.setItem('new_notif', JSON.stringify(Object.values(notifarr)));
        break;
      }
    }
  };

  return (
    <div>
      {isVisible && (
        <div className="dropdown-item d-flex align-items-center">
          <div className="me-3">
            <div className="bg-primary icon-circle" id={props.srcUser.id}>
              <Avatar width={52} />
            </div>
          </div>
          <div id={props.srcUser.id}>
            <p id={props.srcUser.id}>{`${props.srcUser.fname} ${props.srcUser.lname} wants to follow you`}</p>
            <div>
              <button className="btn btn-primary btn-sm" type="button" style={{ marginRight: 10 }} onClick={acceptFollowReqHandler}>
                Accept
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={declineFollowReqHandler}>
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowNotif;
