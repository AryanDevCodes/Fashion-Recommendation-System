import React from 'react';
import { FiAlertCircle, FiX } from 'react-icons/fi';
import './ErrorMessage.css';

function ErrorMessage({ message, onClose }) {
  return (
    <div className="error-container">
      <div className="error-content">
        <FiAlertCircle className="error-icon" />
        <p className="error-text">{message}</p>
        <button className="error-close" onClick={onClose}>
          <FiX />
        </button>
      </div>
    </div>
  );
}

export default ErrorMessage;
