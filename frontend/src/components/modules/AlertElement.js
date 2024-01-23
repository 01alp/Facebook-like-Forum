import React from 'react';

/**
 * Renders an alert element with the specified message, type, and dismissible option.
 * @param {string} props.message - The message to be displayed in the alert element.
 * @param {string} props.type - The type of the alert element. Must be one of: 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'.
 * @param {boolean} props.dismissible - Determines whether the alert element can be dismissed.
 * @param {function} props.onAlertDismiss - The callback function to be called when the alert element is dismissed.
 * @returns {JSX.Element} The rendered alert element.
 */
const AlertElement = (props) => {
  const message = props.message;
  const type = props.type;
  const dismissible = props.dismissible;

  const dismissHandler = () => {
    if (props.onAlertDismiss) {
      props.onAlertDismiss('');
    }
  };
  return (
    <div className={`alert ${dismissible ? 'alert-dismissible' : ''} fade show alert-${type}`} role="alert">
      {message}
      {dismissible && <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={dismissHandler}></button>}
    </div>
  );
};

export default AlertElement;
