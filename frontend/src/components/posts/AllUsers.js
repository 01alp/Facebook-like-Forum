import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGet from '../fetch/useGet';
import Avatar from '../modules/Avatar';

const AllUsers = () => {
  const navigate = useNavigate();

  const { error, isLoaded, data } = useGet(`/users`, 'GET');
  const users = data;
  console.log(users);

  if (!isLoaded) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  function handleClick(e) {
    console.log("handle Click ", e)
    let id = e.target.id;

    if (id == '') {
      id = e.target.parentElement.parentElement.id;
    }

    navigate(`/profile/${id}`);
  }
  return (
    <div
      className="usersList"
      style={{
        padding: 5,
        boxShadow: '3px 3px 5px 5px var(--bs-body-color)',
      }}
    >
      <h5>Users List:</h5>
      <div>
        {users &&
          users.map((user) => (
            <div
              className="d-flex align-items-xl-center userListContainer cursorPointer"
              style={{ margin: 5 }}
              key={user.id}
              id={user.id}
              onClick={handleClick}
            >
              <div className="avatarDiv">
                <Avatar src={user.avatar} showStatus={true} alt="" width={'32px'} />
              </div>
              <div>
                <span className="cursor-pointer">{user.fname}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AllUsers;
