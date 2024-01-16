import { useRef, useState, useEffect, useCallback } from "react";
import { ListGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function sendGroupRequest(groupid, path) {
    if (!path) {
        return;
    }

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

const handleKick = (e, userid, groupid) => {
    e.preventDefault();

    const reqOptions = {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({groupid: groupid, userid: userid})
    };

    let result = fetch(`http://localhost:8080/kickFromGroup`, reqOptions)
        .catch((error) => {
            console.log("err: ", error);
        });
    return result;
  };

export function GroupMemberList({ members, id }) {
    let items = [<ListGroup.Item key="title" className="text-center disabled text-wrap bg-primary fw-bolder overflow-hidden  text-white">Group Members</ListGroup.Item>];

    let isUserOwner = members.find((elem) =>
        (elem.userid === parseInt(localStorage.getItem("user_id" ?? 0)) && (elem.status === 3))
    );


    members.forEach(element => {
        let isOwner = false;
        if (element.status < 0) {
            return;
        }
        if (element.status === 3) { // user is owner of the group
            isOwner = true;
        }

        items.push(
            <Link className="nav-link" key={"link" + element.userid} to={"/profile/" + element.userid }>

                <ListGroup.Item className={"text-break d-flex justify-content-between"} key={element.nickname} action>


                    <div>
                        {isOwner && <i className="fas fa-crown pe-1"></i>}
                        {element.nickname}
                    </div>
                    {isUserOwner && !isOwner && <Button
                        onClick={e => handleKick(e, element.userid, id).then(() => { console.log("XDDD")})}
                        type="button"
                        className="btn btn-danger z-n2">
                        <i className="fas fa-times pe-1"></i>
                        Kick

                    </Button>
                    }

                </ListGroup.Item>
            </Link>);
    });


    return <ListGroup className="w-25" key={"test" + id}>{items}</ListGroup>;
}

export function JoinButton({ members, userid, groupid, callback }) {
    let buttonColor = 'rgb(0,255,0)';
    let buttonText = 'Join Group';
    let path = "sendGroupRequest";
    members.forEach(element => {
        if (element.userid !== parseInt(userid)) {
            return;
        }
        if (element.status !== undefined && element.status >= 0 && element.status !== 3) {
            buttonColor = 'rgb(255,0,0)';
            buttonText = 'Leave Group';
            path = "leaveGroup";
        } else if (element.status === -1) {
            buttonColor = 'rgb(255,200,0)';
            buttonText = 'Cancel request';
            path = "cancelGroupRequest";
        } else if (element.status === 3) {
            buttonColor = 'rgb(0,255,0)';
            buttonText = 'Leader';
            path = "";
        } else {
            buttonColor = 'rgb(255,255,255)';
            buttonText = 'ERROR!';
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
export function GroupCreateModal() {

    const groupNameRef = useRef('');
    const groupDescriptionRef = useRef('');

    const groupNameChangehandler = (e) => {
        groupNameRef.current = (e.target.value);
    };

    const groupDescriptionChangeHandler = (e) => {
        groupDescriptionRef.current = (e.target.value);
    };

    const newGroupSubmitHandler = useCallback((e, groupName, groupDescription) => {
        e.preventDefault();

        const regPayloadObj = {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: groupName,
                description: groupDescription
            })

        };
        fetch("http://localhost:8080/createGroup", regPayloadObj) // need to make this display the result message 
            .then((req) => {
                if (req.status === 201) {
                    console.log("SUCCESS CREATING GROUP");
                } else {
                    console.log("FAILED TO CREATE GROUP", req.status);
                }
            }).catch(err => console.log(err));
    }, []);


    return (
        <div className="modal fade " id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Group Create</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={(e) => { newGroupSubmitHandler(e, groupNameRef.current, groupDescriptionRef.current); }}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <textarea
                                    className="form-control groupName"
                                    placeholder="Group Name"
                                    style={{ margin: 5 }}
                                    required=""
                                    minLength={3}
                                    maxLength={200}
                                    rows={3}
                                    data-bs-theme="light"
                                    defaultValue={''}
                                    onChange={groupNameChangehandler}
                                />
                            </div>
                            <div>
                                <textarea
                                    className="form-control groupDescription"
                                    placeholder="Group Description"
                                    style={{ margin: 5 }}
                                    required=""
                                    minLength={3}
                                    maxLength={200}
                                    rows={3}
                                    data-bs-theme="light"
                                    defaultValue={''}
                                    onChange={groupDescriptionChangeHandler}
                                />
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function CreateEventModal({ groupId }) {

    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const eventStartTimeRef = useRef(null);
    const [showDateWarning, setShowDateWarning] = useState(false);

    const eventTitleChangeHandler = (e) => {
        setEventTitle(e.target.value);
    };

    const eventDescriptionChangeHandler = (e) => {
        setEventDescription(e.target.value);
    };

    const resetFields = () => {
        setEventTitle('');
        eventStartTimeRef.current.value = '';
        setEventDescription('');
        setShowDateWarning(false);
    };

    const newEventSubmitHandler = useCallback((e, eventTitle, eventStartTime, eventDescription) => {
        e.preventDefault();

        // Validate that event start time is in future
        const currentDate = new Date();
        const enteredDate = new Date(eventStartTime);
        if (currentDate > enteredDate) {
            eventStartTimeRef.current.value = '';
            eventStartTimeRef.current.focus();
            setShowDateWarning(true);
            return
        }

        const regPayloadObj = {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                groupid: groupId,
                title: eventTitle,
                starttime: eventStartTime,
                description: eventDescription,
                createdat: new Date()
            })
        };
        fetch("http://localhost:8080/createEvent", regPayloadObj)
            .then((req) => {
                if (req.status === 201) {
                    console.log("SUCCESS CREATING EVENT");
                    resetFields();
                } else {
                    console.log("FAILED TO CREATE EVENT", req.status);
                }
            }).catch(err => console.log(err));
    }, []);

    useEffect(() => {
        const modalElement = document.getElementById("createEventModal");
        modalElement.addEventListener('hidden.bs.modal', resetFields);
        return () => {
            modalElement.removeEventListener('hidden.bs.modal', resetFields);
        };
    }, []);

    return (
        <div className="modal fade " id="createEventModal" tabIndex="-1" aria-labelledby="createEventModalLabel" aria-hidden="true" style={{ zIndex: 2000 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="createEventModalLabel">Create new event</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <form onSubmit={(e) => { newEventSubmitHandler(e, eventTitle, eventStartTimeRef.current.value, eventDescription); }}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <textarea
                                    className="form-control eventTitle"
                                    placeholder="Event Title"
                                    required
                                    pattern=".*\S.*"
                                    minLength={3}
                                    maxLength={200}
                                    rows={1}
                                    data-bs-theme="light"
                                    value={eventTitle}
                                    onChange={eventTitleChangeHandler}
                                />
                            </div>
                            <div className="mb-3">
                                <span className="text-secondary ms-2">Event Start Time</span>
                                <input
                                    type="datetime-local"
                                    className="form-control eventStartTime"
                                    placeholder="Event Start Time"
                                    required
                                    pattern=".*\S.*"
                                    ref={eventStartTimeRef} 
                                />
                            </div>
                            <div>
                                <textarea
                                    className="form-control eventDescription"
                                    placeholder="Event Description"
                                    required
                                    pattern=".*\S.*"
                                    minLength={3}
                                    maxLength={200}
                                    rows={3}
                                    data-bs-theme="light"
                                    value={eventDescription}
                                    onChange={eventDescriptionChangeHandler}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            {showDateWarning && <span className="me-5 text-danger">Start time must be in the future</span>}
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="submit" className="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}