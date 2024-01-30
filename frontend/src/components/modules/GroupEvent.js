import { Dropdown } from "react-bootstrap";
import { useRef, useState, useCallback } from "react";

export const EventCard = ({
  groupEvents,
  groupInfo,
  currentUser,
  handleEventUpdate,
}) => {
  const groupId = +groupInfo.id;
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    };

    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  function getStatusForCurrentUser(attendees, userId) {
    const currentUser = attendees.find((user) => user.userId === userId);
    return currentUser ? currentUser.status : 0;
  }

  return (
    <div>
      {groupEvents ? (
        groupEvents.map((event) => (
          <div key={event.id} className='card mb-3'>
            <div className='card-body'>
              <h5 className='card-title'>{event.title}</h5>
              <p className='card-text'>
                <strong>Description:</strong> {event.description}
              </p>
              <p className='card-text'>
                <strong>Creator ID:</strong>{" "}
                {
                  groupInfo.members.find(
                    (user) => user.userid === event.creatorid
                  )?.nickname
                }
              </p>
              <p className='card-text'>
                <strong>Start Time:</strong> {formatDate(event.starttime)}
              </p>
              <p className='card-text'>
                <strong>Created At:</strong> {formatDate(event.createdat)}
              </p>
              <EventAttendanceButton
                eventId={event.id}
                userId={currentUser}
                groupId={groupId}
                userStatus={
                  event.attendees
                    ? getStatusForCurrentUser(event.attendees, currentUser)
                    : 0
                }
                callback={handleEventUpdate}
              />
              <Dropdown
                style={{
                  marginTop: "0.5rem",
                }}
              >
                <Dropdown.Toggle
                  variant='success'
                  id={`dropdown-attendees-${event.id}`}
                >
                  {event.attendees
                    ? event.attendees.filter(
                        (attendee) => attendee.status === 1
                      ).length
                    : 0}{" "}
                  Going
                </Dropdown.Toggle>
                <Dropdown.Menu
                  style={{
                    pointerEvents: "none",
                  }}
                >
                  {event.attendees &&
                  event.attendees.some((attendee) => attendee.status === 1) ? (
                    event.attendees
                      .filter((attendee) => attendee.status === 1)
                      .map((attendee) => (
                        <Dropdown.Item key={attendee.userId}>
                          {
                            groupInfo.members.find(
                              (user) => user.userid === attendee.userId
                            )?.nickname
                          }{" "}
                          is going
                        </Dropdown.Item>
                      ))
                  ) : (
                    <Dropdown.Item>No attendees</Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        ))
      ) : (
        <p>No events</p>
      )}
    </div>
  );
};

export const EventAttendanceButton = ({
  eventId,
  userId,
  groupId,
  userStatus,
  callback,
}) => {
  const [status, setStatus] = useState(userStatus); // 0=hasnt interacted, 1=going, 2=not going
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const updateDB = useCallback(async (eventId, userId, status) => {
    const regPayloadObj = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventId,
        groupId,
        userId,
        status,
      }),
    };
    await fetch("http://localhost:8080/updateAttendees", regPayloadObj)
      .then((res) => res.json())
      .then((data) => console.log(data)) //TODO remove later
      .catch((err) => console.log(err));
  }, []);

  const handleStatusChange = async (selectedStatus) => {
    try {
      if (dropdownRef.current) {
        dropdownRef.current.click();
      }
      setLoading(true);

      await updateDB(eventId, userId, selectedStatus);

      setStatus(selectedStatus);
      return selectedStatus;
    } catch (error) {
      console.error("Error updating database:", error);
    } finally {
      setLoading(false);
      callback();
    }
  };

  return (
    <div className='btn-group'>
      <button
        ref={dropdownRef}
        type='button'
        className={`btn btn-primary dropdown-toggle`}
        data-bs-toggle='dropdown'
        aria-haspopup='true'
        aria-expanded='false'
        disabled={loading}
      >
        {loading ? "Loading..." : status === 1 ? "Going" : "Not Going"}
      </button>
      <div className='dropdown-menu'>
        <button
          className='dropdown-item'
          onClick={() => handleStatusChange(1)}
          disabled={loading}
        >
          Going
        </button>
        <button
          className='dropdown-item'
          onClick={() => handleStatusChange(2)}
          disabled={loading}
        >
          Not Going
        </button>
      </div>
    </div>
  );
};

export function CreateEventModal({ groupId, callBack }) {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const eventStartTimeRef = useRef(null);
  const [showDateWarning, setShowDateWarning] = useState(false);

  const eventTitleChangeHandler = (e) => {
    setEventTitle(e.target.value);
  };

  const eventDescriptionChangeHandler = (e) => {
    setEventDescription(e.target.value);
  };

  const resetFields = () => {
    setEventTitle("");
    eventStartTimeRef.current.value = "";
    setEventDescription("");
    setShowDateWarning(false);
  };

  const newEventSubmitHandler = useCallback(
    (e, groupId, eventTitle, eventStartTime, eventDescription) => {
      e.preventDefault();

      // Validate that event start time is in future
      const currentDate = new Date();
      const enteredDate = new Date(eventStartTime);
      if (currentDate > enteredDate) {
        eventStartTimeRef.current.value = "";
        eventStartTimeRef.current.focus();
        setShowDateWarning(true);
        return;
      }

      const formattedStartTime = enteredDate.toISOString();

      const regPayloadObj = {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupid: +groupId,
          title: eventTitle,
          starttime: formattedStartTime,
          description: eventDescription,
          createdat: new Date().toISOString(),
        }),
      };
      fetch("http://localhost:8080/createEvent", regPayloadObj)
        .then((req) => {
          if (req.status === 201) {
            console.log("SUCCESS CREATING EVENT");
            resetFields();
            callBack();
          } else {
            console.log("FAILED TO CREATE EVENT", req.status);
          }
        })
        .catch((err) => console.log(err));
    },
    []
  );

  return (
    <div
      className='createEvent'
      style={{
        padding: 5,
        boxShadow: "3px 3px 5px 5px var(--bs-body-color)",
      }}
    >
      <h5 style={{ marginRight: 5, marginLeft: 5 }}>Create Event:</h5>
      {/* Start: createEventForm */}
      <form
        className='createEventForm'
        style={{ margin: 5, padding: 5 }}
        onSubmit={(e) => {
          newEventSubmitHandler(
            e,
            groupId,
            eventTitle,
            eventStartTimeRef.current.value,
            eventDescription
          );
        }}
      >
        <input
          className='form-control'
          type='text'
          placeholder='Title:'
          style={{ marginBottom: 5 }}
          required
          pattern='.*\S.*'
          minLength={3}
          maxLength={200}
          value={eventTitle}
          onChange={eventTitleChangeHandler}
        />
        <textarea
          className='form-control'
          placeholder='Description'
          style={{ marginBottom: 10 }}
          value={eventDescription}
          required
          pattern='.*\S.*'
          minLength={3}
          maxLength={200}
          rows={3}
          onChange={eventDescriptionChangeHandler}
        />
        <input
          className='form-control'
          type='datetime-local'
          placeholder='Event Start Time'
          required
          pattern='.*\S.*'
          ref={eventStartTimeRef}
        />
        <div>
          {showDateWarning && (
            <span className='me-5 text-danger'>
              Start time must be in the future
            </span>
          )}
        </div>
        <button
          className='btn btn-primary'
          type='submit'
          style={{ marginTop: 10 }}
        >
          Create
        </button>
      </form>
    </div>
  );
}
