import React from "react";
import { Modal, Button } from "react-bootstrap-v5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faShieldAlt } from "@fortawesome/free-solid-svg-icons";
import { getFormattedMessage } from "../../shared/sharedMethod";

const Confirm2FAModal = ({ show, onHide, onConfirm, isEnabling }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="md" className="confirm-2fa-modal" backdropClassName="custom-modal-backdrop">
      <Modal.Body className="text-center p-5">
        <div className="mb-4">
          <FontAwesomeIcon 
            icon={isEnabling ? faShieldAlt : faQuestionCircle} 
            className={`display-4 ${isEnabling ? 'text-primary' : 'text-warning'}`} 
          />
        </div>
        <h4 className="fw-bold mb-3">
          {isEnabling 
            ? getFormattedMessage('enable.two-factor-authentication.title')
            : getFormattedMessage('disable.two-factor-authentication.title')
          }
        </h4>
        <p className="text-muted mb-4">
          {isEnabling
            ? getFormattedMessage("enable.two-factor-authentication.question")
            : getFormattedMessage("disable.two-factor-authentication.question")
          }
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button variant="light" className="px-4" onClick={onHide}>
            {getFormattedMessage("no.modal.title")}
          </Button>
          <Button 
            variant={isEnabling ? "primary" : "danger"} 
            className="px-4" 
            onClick={onConfirm}
          >
            {getFormattedMessage("yes.modal.title")}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Confirm2FAModal;