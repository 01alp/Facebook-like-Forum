import React from 'react';

const ErrorAlert = (props) => {
  const dismissHandler = () => {
    props.onErrorDismiss('');
  };
  return (
    <div className="alert alert-warning alert-dismissible fade show" role="alert">
      {props.errorMessage}
      <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={dismissHandler}></button>
    </div>
  );
};

export default ErrorAlert;
