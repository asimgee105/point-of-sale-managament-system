import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap-v5";
import { useDispatch, useSelector } from "react-redux";
import {
  enableDisableTwoFactorAuth,
  getTwoAuthFactorQrCode,
} from "../../store/action/twoFactorAuthAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faKey,
  faExclamationTriangle,
  faLock,
  faShieldAlt,
  faDownload,
  faCopy,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getFormattedMessage } from "../../shared/sharedMethod";
import Confirm2FAModal from "./Confirm2FAModal";
import { twoFactorAuthActions } from "../../constants";

const TwoFactorAuth = ({ isOpen, closeModal }) => {
  const dispatch = useDispatch();
  const { twoFactorAuth, loading, allConfigData } = useSelector((state) => state);

  const isTwoFactorEnabled = allConfigData?.two_factor_enabled;

  const [token, setToken] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codesCopied, setCodesCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const recoveryCodes = twoFactorAuth?.recovery_codes || [];
  const downloadUrl = twoFactorAuth?.download_url || "";

  useEffect(() => {
    if (isOpen && !isTwoFactorEnabled) {
      dispatch(getTwoAuthFactorQrCode());
    }
  }, [isOpen, isTwoFactorEnabled, dispatch]);

  const validate = () => {
    const err = {};
    if (!token) {
      err.token = getFormattedMessage("authentication.input.required.title");
    }
    //  else if (!/^\d{6}$/.test(token)) {
    //   err.token = getFormattedMessage(
    //     "authentication.input.length.validate.title"
    //   );
    // }
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    setErrors(err);

    if (!Object.keys(err).length) {
      setShowConfirm(true);
    }
  };

 const handleFinalConfirm = () => {
  setShowConfirm(false); 
  setIsSubmitting(true);
  dispatch(
    enableDisableTwoFactorAuth(
      { otp: token, two_factor_enabled: !isTwoFactorEnabled },
      setIsSubmitting,
      closeModal
    )
  );
  setToken("");
};

  const handleCopy = async () => {
    const text = twoFactorAuth?.secret;
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleCopyCodes = async () => {
    if (!recoveryCodes.length) return;
    const text = recoveryCodes.join("\n");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCodesCopied(true);
      setTimeout(() => setCodesCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleClose = () => {
    if (recoveryCodes.length > 0) {
      dispatch({
        type: twoFactorAuthActions.SET_RECOVERY_CODES,
        payload: { recovery_codes: [], download_url: "" },
      });
    }
    closeModal();
  };

  if (!isOpen) return null;

  return (
    <>
    <Modal show={isOpen} onHide={handleClose} centered size="lg" dialogClassName="transition-all">
      <Modal.Header closeButton>
        <Modal.Title>
          {recoveryCodes.length > 0
            ? getFormattedMessage("two-factor-auth.recovery-codes.title")
            : isTwoFactorEnabled
            ? getFormattedMessage("manage.two-factor-authentication.title")
            : getFormattedMessage("enable.two-factor-authentication.title")}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {recoveryCodes.length > 0 ? (
          <div className="p-2">
            <div className="alert alert-warning mb-4 d-flex align-items-start">
              <FontAwesomeIcon icon={faExclamationTriangle} className="mt-1 me-3 fs-4" />
              <div className="small">
                {getFormattedMessage("two-factor-auth.recovery-codes-info.title")}
              </div>
            </div>

            <div className="row g-3 mb-4">
              {recoveryCodes.map((code, index) => (
                <div key={index} className="col-sm-6">
                  <div className="bg-light border rounded p-2 text-center font-monospace fw-bold">
                    {code}
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <Button size="sm" variant="outline-primary" onClick={handleCopyCodes}>
                <FontAwesomeIcon icon={codesCopied ? faCheckCircle : faCopy} className="me-2" />
                {codesCopied
                  ? getFormattedMessage("copied.title")
                  : getFormattedMessage("two-factor-auth.recovery-codes.copy.btn")}
              </Button>
              <a href={downloadUrl} download className="btn btn-sm btn-outline-success">
                <FontAwesomeIcon icon={faDownload} className="me-2" />
                {getFormattedMessage("two-factor-auth.recovery-codes.download.btn")}
              </a>
            </div>
          </div>
        ) : !isTwoFactorEnabled ? (
          <>
            {/* Intro */}
            <div className="alert alert-primary mb-4">
              {getFormattedMessage(
                "two-factor-authentication-start.description"
              )}
            </div>

            {/* Step 1 */}
            <div className="mb-4">
              <h6 className="fw-semibold mb-2">
                1. {getFormattedMessage("configure-authenticator-app.title")}
              </h6>
              <ul className="small text-muted ps-3 mb-0">
                <li>{getFormattedMessage("configure-step-1.title")}</li>
                <li>{getFormattedMessage("configure-step-2.title")}</li>
                <li>{getFormattedMessage("configure-step-3.title")}</li>
              </ul>
            </div>

            <div className="row g-4">
              {/* Step 2 – QR */}
              <div className="col-md-6">
                <h6 className="fw-semibold mb-2">
                  2. {getFormattedMessage("scan-qr-code.title")}
                </h6>

                <div
                  className="border rounded bg-light d-flex align-items-center justify-content-center"
                  style={{ minHeight: 215 }}
                >
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary mb-2" />
                      <div className="small text-muted">
                        {getFormattedMessage("loading-qr-code.title")}
                      </div>
                    </div>
                  ) : twoFactorAuth?.qrcode?.startsWith("<?xml") ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: twoFactorAuth.qrcode.replace(
                          /<\?xml.*?\?>/,
                          ""
                        ),
                      }}
                    />
                  ) : (
                    <img
                      src={twoFactorAuth?.qrcode}
                      alt="QR"
                      className="img-fluid"
                    />
                  )}
                </div>
              </div>

              {/* Step 3 & 4 */}
              <div className="col-md-6">
                {/* Step 3 – Secret */}
                <h6 className="fw-semibold mb-2">
                  3.{" "}
                  {getFormattedMessage(
                    "payment-settings.paypal-secret-key.label"
                  )}
                </h6>

                <div className="bg-light border rounded p-2 font-monospace small text-break mb-2">
                  {loading
                    ? getFormattedMessage("loading.title")
                    : twoFactorAuth?.secret}
                </div>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={handleCopy}
                  disabled={!twoFactorAuth?.secret}
                >
                  {copied
                    ? getFormattedMessage("copied.title")
                    : getFormattedMessage("copy.title")}
                </Button>

                <hr className="my-4" />

                {/* Step 4 – OTP */}
                <h6 className="fw-semibold mb-2">
                  4. {getFormattedMessage("verify-code.title")}
                </h6>
                <p className="small text-muted mb-2">
                  {getFormattedMessage("enter-6-digit-code.title")}
                </p>

                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={token}
                  maxLength={6}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="form-control text-center"
                  placeholder="******"
                />

                {errors.token && (
                  <div className="text-danger small mt-1">{errors.token}</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Enabled State - New Design */}
            <div
              className="alert text-white alert-success d-flex align-items-start mb-4"
              role="alert"
            >
              <FontAwesomeIcon
                icon={faShieldAlt}
                className="fs-3 me-3 mt-1"
              />
              <div>
                <h5 className="alert-heading fw-bold mb-1 fs-6">
                  {getFormattedMessage("two-factor-authentication.active.title")}
                </h5>
                <p className="mb-0 small">
                  {getFormattedMessage(
                    "two-factor-authentication.description",
                    "Your account is currently protected with two-factor authentication. This adds an extra layer of security to your login process."
                  )}
                </p>
              </div>
            </div>

            <div className="card shadow-sm mb-3">
              <div className="p-3">
                <div className="d-flex align-items-center mb-3">
                  <FontAwesomeIcon
                    icon={faKey}
                    className="text-secondary me-2"
                  />
                  <h6 className="fw-bold mb-0 text-secondary">
                    {getFormattedMessage(
                      "disable.two-factor-authentication.title"
                    )}
                  </h6>
                </div>

                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="fs-4 me-3 text-white"
                  />
                  <span className="text-warning-dark">
                    {getFormattedMessage(
                      "warning.two-factor-authentication.description",
                      "Warning: Disabling 2FA will reduce the security of your account. You'll only need your password to log in."
                    )}
                  </span>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    {getFormattedMessage(
                      "confirm-with-authentication-code.title",
                      "Confirm with Authentication Code"
                    )}
                  </label>
                  <p className="small text-muted mb-2">
                    {getFormattedMessage(
                      "disable-two-factor-authentication.description",
                      "To disable 2FA, please enter the current 6-digit code from your authenticator app:"
                    )}
                  </p>

                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control text-center fs-5 shadow-none"
                      style={{ letterSpacing: "5px" }}
                      placeholder="• • • • • •"
                      // maxLength={6}
                      value={token}
                      onChange={(e) =>
                        setToken(e.target.value)
                      }
                    />
                    <FontAwesomeIcon
                      icon={faLock}
                      className="position-absolute text-muted"
                      style={{ top: "14px", right: "15px" }}
                    />
                  </div>
                  {errors.token && (
                    <div className="text-danger small mt-1">{errors.token}</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="pt-0">
        <Button variant="secondary" onClick={handleClose}>
          {recoveryCodes.length > 0
            ? getFormattedMessage("two-factor-auth.recovery-codes.done.btn")
            : getFormattedMessage("globally.cancel-btn")}
        </Button>

        {recoveryCodes.length === 0 && (
          <Button
            variant={isTwoFactorEnabled ? "primary" : "primary"}
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className={isTwoFactorEnabled ? "btn-primary" : ""}
            style={
              isTwoFactorEnabled
                ? { backgroundColor: "#0d6efd", borderColor: "#0d6efd" }
                : {}
            }
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {getFormattedMessage("verifying.title")}
              </>
            ) : isTwoFactorEnabled ? (
              <>
                <i className="fa fa-ban me-2" />
                {getFormattedMessage("disable.two-factor-authentication.title")}
              </>
            ) : (
              getFormattedMessage("verify-and-activate-2fa.title")
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
    <Confirm2FAModal 
      show={showConfirm}
      onHide={() => setShowConfirm(false)}
      onConfirm={handleFinalConfirm}
      isEnabling={!isTwoFactorEnabled}
    />
    </>
  );
};

export default TwoFactorAuth;
