import { ListGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function sendGroupRequest(groupid, path) {
    const reqOptions = {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupid: groupid })
    };

    let result = fetch(`http://localhost:8080/${path}`, reqOptions)
        .catch((error) => {
            console.log("err: ", error);
        });
    return result;
}


export function GroupMemberList({ members, id }) {
    let items = [<ListGroup.Item key="title" className="text-center disabled text-wrap bg-primary fw-bolder overflow-hidden  text-white">Group Members</ListGroup.Item>];

    members.forEach(element => {
        let isOwner = false;
        if (element.status < 1) {
            return;
        }
        if (element.status === 3) { // user is owner of the group
            isOwner = true;
        }

        items.push(
            <Link className="nav-link" key={"link" + element.userid} to={"/profile/" + element.userid}>

                <ListGroup.Item className={"text-break"} key={element.nickname} action>
                    {isOwner && <i className="fas fa-crown pe-1"></i>}
                    {element.nickname}
                </ListGroup.Item>
            </Link>);
    });


    return <ListGroup className="w-25" key={id}>{items}</ListGroup>;
}

export function JoinButton({ members, userid, groupid, callback }) {
    let buttonColor = 'rgb(0,255,0)';
    let buttonText = 'Join Group';
    let path = "sendGroupRequest";
    members.forEach(element => {
        if (element.userid !== parseInt(userid)) {
            return;
        }
        if (element.status !== undefined && element.status > 0 && element.status !== 3) {
            buttonColor = 'rgb(255,0,0)';
            buttonText = 'Leave Group';
            path = "";
        } else if (element.status === 0) {
            buttonColor = 'rgb(255,200,0)';
            buttonText = 'Cancel group join request';
            path = "cancelGroupRequest";
        } else {
            buttonColor = 'rgb(0,255,0)';
            buttonText = 'ERROR';
            path = "";
        }
        return true;
    });

    return (
        <Button
            className="w-25 h-25 fs-5 fw-bolder text-wrap overflow-hidden border-color"
            variant="none"
            onClick={() => sendGroupRequest(groupid, path).then(() => { callback(); })}
            style={{ backgroundColor: buttonColor }}>{buttonText}
        </Button>
    );

}
