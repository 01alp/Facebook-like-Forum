import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useGet from "../fetch/useGet";
import Avatar from "../modules/Avatar";
function EventNotif(props) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const { error, isLoaded, data } = useGet(`/group?id=${props.groupId}`);
  console.log("0987", data);
  if (!isLoaded) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  function handleClick(e) {
    setIsVisible(false);
    console.log("click");
    const id = e.target.id;
    let notifarr = JSON.parse(localStorage.getItem("new_notif"));
    let newarray = notifarr.filter((obj) => obj.groupid != id);
    console.log("newarray ", newarray);
    localStorage.setItem("new_notif", JSON.stringify(Object.values(newarray)));
    navigate("/groupprofile", { state: { id } });
    console.log("5678", id);
  }
  return (
    <div>
      {isVisible && (
        <div className='dropdown-item d-flex align-items-center'>
          <div className='me-3'>
            <Avatar width={52} />
          </div>
          <div>
            {data.data && (
              <div id={props.groupId} onClick={handleClick}>
                {" "}
                {data.data[0].title} added new event: {props.type.split("+")[1]}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default EventNotif;
