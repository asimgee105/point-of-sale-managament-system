import React, { useEffect, useRef, useState } from "react";
import * as EmailValidator from "email-validator";
import TabTitle from "../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "react-bootstrap-v5";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import { createBrowserHistory } from "history";
import { ROLES } from "../../constants";
import { register } from "../../store/action/authAction";
import Cookies from "js-cookie";
import { fetchLanguages } from "../../store/action/languageAction";
import LanguageLayout from "./LanguageLayout";
import { fetchFrontCms } from "../../store/action/frontCmsAction";
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
    const navigate = useNavigate();
    const { frontCms, loginUser } = useSelector((state) => state);
    const recaptchaRef = useRef(null);

    const [showPassword, setShowPassword] = useState({
        password: false,
        confirm: false,
    });
    const [disable, setDisable] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const history = createBrowserHistory();
    const token = Cookies.get("authToken");

    const [registerInputs, setRegisterInputs] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    useEffect(() => {
        dispatch(fetchFrontCms());
        dispatch(fetchLanguages());
        if (token) {
            if (loginUser.roles === ROLES.SUPER_ADMIN) {
                navigate("/app/admin/dashboard");
            } else {
                navigate("/app/user/dashboard");
            }
        }
    }, []);


    const handleHideShowPassword = (type) => {
        if (type === "password") {
            setShowPassword({
                ...showPassword,
                password: !showPassword.password,
            });
        } else if (type === "confirm") {
            setShowPassword({
                ...showPassword,
                confirm: !showPassword.confirm,
            });
        }
    };

    const handleChange = (e) => {
        e.persist();
        setRegisterInputs((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
        setErrors("");
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        const recaptchaValue = recaptchaRef?.current?.getValue();
        if (!registerInputs["full_name"]) {
            errorss["full_name"] = getFormattedMessage(
                "user.input.first-name.validate.label"
            );
        } else if (!EmailValidator.validate(registerInputs["email"])) {
            if (!registerInputs["email"]) {
                errorss["email"] = getFormattedMessage(
                    "globally.input.email.validate.label"
                );
            } else {
                errorss["email"] = getFormattedMessage(
                    "globally.input.email.valid.validate.label"
                );
            }
        } else if (!registerInputs["password"]) {
            errorss["password"] = getFormattedMessage(
                "user.input.password.validate.label"
            );
        } else if (registerInputs["password"]?.length < 12) {
            errorss["password"] = getFormattedMessage(
                "auth.password.minimum.twelve"
            );
        } else if (!registerInputs["confirm_password"]) {
            errorss["confirm_password"] = getFormattedMessage(
                "user.input.confirm-password.validate.label"
            );
        } else if (
            registerInputs["password"] !== registerInputs["confirm_password"]
        ) {
            errorss["confirm_password"] = getFormattedMessage(
                "reset-password.password.validate.label"
            );
        } else if(frontCms?.value?.is_captcha_enabled == 1 && !recaptchaValue) {
            errorss["captcha"] = getFormattedMessage("login.captcha.complete.validate.title");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        setLoading(false);
        return isValid;
    };

    const prepareFormData = (token) => {
        const formData = new FormData();
        formData.append("full_name", registerInputs.full_name);
        formData.append("email", registerInputs.email);
        formData.append("password", registerInputs.password);
        formData.append("confirm_password", registerInputs.confirm_password);
        if(token){
            formData.append("token", token);
        }
        formData.append(
            "language_code",
            localStorage.getItem("updated_language")
        );
        return formData;
    };

    const onRegister = async (e) => {
        e.preventDefault();
        let token =
            frontCms &&
            frontCms?.value?.is_captcha_enabled === "1" &&
            frontCms?.value?.captcha_site_key &&
            recaptchaRef.current.getValue();
        const valid = handleValidation();
        if (valid) {
            setDisable(true);
            dispatch(
                register(prepareFormData(token), navigate, setDisable)
            );
        }
    };

    return (
        <div className="content d-flex flex-column flex-column-fluid position-relative" style={{ backgroundImage: "url(/assets/images/asked-bg.png)" }}>
            <LanguageLayout/>
            <div className="content d-flex flex-column flex-column-fluid">
                <div className="d-flex flex-wrap flex-column-fluid">
                    <div className="d-flex flex-column flex-column-fluid align-items-center justify-content-center margin-top p-4">
                        <TabTitle
                            title={placeholderText(
                                "registration-form.register-btn.label"
                            )}
                        />
                        <div className="col-12 text-center align-items-center justify-content-center">
                            <a href="/" className="image mb-7 mb-sm-10">
                                <Image
                                    className="logo-height image"
                                    src={
                                        frontCms &&
                                        frontCms.value &&
                                        frontCms.value.app_logo
                                    }
                                    height={60}
                                    style={{ objectFit: "contain" }}
                                />
                            </a>
                        </div>
                        <div className="bg-theme-white rounded-15 shadow-md width-540 px-5 px-sm-7 py-10 mx-auto">
                            <h1 className="text-dark text-center mb-7">
                                {getFormattedMessage(
                                    "registration-form.register-btn.label"
                                )}
                            </h1>
                            <form>
                                <div className="mb-sm-7 mb-4">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "update-profile.input.full-name.label"
                                        )}
                                        :
                                    </label>
                                    <span className="required" />
                                    <input
                                        placeholder={placeholderText(
                                            "update-profile.input.full-name.label"
                                        )}
                                        required
                                        value={registerInputs.full_name}
                                        className="form-control"
                                        type="text"
                                        name="full_name"
                                        autoComplete="off"
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["full_name"] ? errors["full_name"] : null}
                                    </span>
                                </div>

                                <div className="mb-sm-7 mb-4">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "globally.input.email.label"
                                        )}
                                        :
                                    </label>
                                    <span className="required" />
                                    <input
                                        placeholder={placeholderText(
                                            "globally.input.email.label"
                                        )}
                                        required
                                        value={registerInputs.email}
                                        className="form-control"
                                        type="text"
                                        name="email"
                                        autoComplete="off"
                                        onChange={(e) => handleChange(e)}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["email"] ? errors["email"] : null}
                                    </span>
                                </div>

                                <div className="mb-sm-7 mb-4">
                                    <div className="d-flex justify-content-between mt-n5">
                                        <div className="d-flex justify-content-between w-100">
                                            <label className="form-label">
                                                {getFormattedMessage(
                                                    "user.input.password.label"
                                                )}
                                                :
                                                <span className="required" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            type={
                                                showPassword.password
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="password"
                                            placeholder={placeholderText(
                                                "user.input.password.label"
                                            )}
                                            autoComplete="off"
                                            required
                                            value={registerInputs.password}
                                            onChange={(e) => handleChange(e)}
                                        />
                                        <span
                                            className="showpassword"
                                            onClick={() =>
                                                handleHideShowPassword("password")
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={
                                                    showPassword.password
                                                        ? faEye
                                                        : faEyeSlash
                                                }
                                                className="top-0 m-0 fa"
                                            />
                                        </span>
                                    </div>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["password"]
                                            ? errors["password"]
                                            : null}
                                    </span>
                                </div>

                                <div className="mb-sm-7 mb-4">
                                    <div className="d-flex justify-content-between mt-n5">
                                        <div className="d-flex justify-content-between w-100">
                                            <label className="form-label">
                                                {getFormattedMessage(
                                                    "user.input.confirm-password.label"
                                                )}
                                                :
                                                <span className="required" />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            type={
                                                showPassword.confirm
                                                    ? "text"
                                                    : "password"
                                            }
                                            name="confirm_password"
                                            placeholder={placeholderText(
                                                "user.input.confirm-password.label"
                                            )}
                                            autoComplete="off"
                                            required
                                            value={registerInputs.confirm_password}
                                            onChange={(e) => handleChange(e)}
                                        />
                                        <span
                                            className="showpassword"
                                            onClick={() =>
                                                handleHideShowPassword("confirm")
                                            }
                                        >
                                            <FontAwesomeIcon
                                                icon={
                                                    showPassword.confirm
                                                        ? faEye
                                                        : faEyeSlash
                                                }
                                                className="top-0 m-0 fa"
                                            />
                                        </span>
                                    </div>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["confirm_password"]
                                            ? errors["confirm_password"]
                                            : null}
                                    </span>
                                </div>
                                {frontCms?.value?.is_captcha_enabled == 1 &&
                                    <div className="mb-sm-7 mb-4 w-full">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey={frontCms?.value?.captcha_site_key}
                                            onChange={(value) => {
                                                if (value) {
                                                    setErrors((prev) => ({ ...prev, captcha: "" }));
                                                }
                                            }}
                                        />
                                        {errors["captcha"] && (
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {errors["captcha"]}
                                            </span>
                                        )}
                                    </div>
                                }
                                <div className="text-center">
                                    <button
                                        type="submit"
                                        disabled={disable}
                                        className="btn btn-purple w-100"
                                        onClick={(e) => onRegister(e)}
                                    >
                                        {loading ? (
                                            <span className="d-block">
                                                {getFormattedMessage(
                                                    "globally.loading.label"
                                                )}
                                            </span>
                                        ) : (
                                            <span>
                                                {getFormattedMessage(
                                                    "registration-form.register-btn.label"
                                                )}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <span>
                                        {getFormattedMessage(
                                            "already.registered.label"
                                        )}{" "}
                                        <Link to="/app/login" className="text-purple">
                                            {getFormattedMessage(
                                                "login-form.login-btn.label"
                                            )}
                                        </Link>
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
