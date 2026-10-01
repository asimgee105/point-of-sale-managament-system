import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Image } from "react-bootstrap-v5";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedMessage,
    numValidate,
    placeholderText,
} from "../../shared/sharedMethod";
import { fetchLanguages } from "../../store/action/languageAction";
import LanguageLayout from "./LanguageLayout";
import { fetchFrontCms } from "../../store/action/frontCmsAction";
import { validateTwoFactorCode } from "../../store/action/twoFactorAuthAction";

const TwoFactorAuthPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { frontCms, isLoading } = useSelector((state) => state);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    useEffect(() => {
        dispatch(fetchFrontCms());
        dispatch(fetchLanguages());
    }, []);

    const [errors, setErrors] = useState();

    const handleValidation = () => {
        let isValid = false;
        if (!twoFactorCode) {
            setErrors(
                getFormattedMessage("two-factor-auth.code.validate.label")
            );
        }
        //  else if (twoFactorCode.length < 6) {
        //     setErrors(
        //         getFormattedMessage("enter-6-digit-validation-code.title")
        //     );
        // } 
        else {
            isValid = true;
        }
        return isValid;
    };

    useEffect(() => {
        if (!location?.state?.email || !location?.state?.challengeToken) {
            navigate("/app/login");
        }
    }, [location.state]);

    const prepareFormData = () => {
        const formData = new FormData();
        formData.append("otp", twoFactorCode);
        formData.append("email", location.state.email);
        formData.append("challenge_token", location.state.challengeToken);
        formData.append(
            "language_code",
            localStorage.getItem("updated_language") || "en"
        );
        return formData;
    };

    const onVerify = async (e) => {
        e.preventDefault();
        const valid = handleValidation();
        if (valid) {
            dispatch(
                validateTwoFactorCode(prepareFormData(), null, null, true)
            );
            setTwoFactorCode("");
        }
    };

    const handleChange = (e) => {
        e.persist();
        setTwoFactorCode(e.target.value);
        setErrors("");
    };

    return (
        <div
            className="content d-flex flex-column flex-column-fluid position-relative"
            style={{ backgroundImage: "url(/assets/images/asked-bg.png)" }}
        >
            <LanguageLayout />
            <div className="content d-flex flex-column flex-column-fluid">
                <div className="d-flex flex-wrap flex-column-fluid">
                    <div className="d-flex flex-column flex-column-fluid align-items-center justify-content-center p-4 margin-top">
                        <TabTitle
                            title={placeholderText(
                                "two-factor-authentication.heading"
                            )}
                        />
                        <div className="col-12 text-center align-items-center justify-content-center ">
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
                                    "two-factor-authentication.heading"
                                )}
                            </h1>
                            <form>
                                <div className="mb-sm-7 mb-4">
                                    <p>
                                        {getFormattedMessage(
                                            "two-factor-auth.code.validate.label"
                                        )}
                                    </p>
                                    <label className="form-label">
                                        {getFormattedMessage("otp.title")} :
                                    </label>
                                    <span className="required" />
                                    <input
                                        placeholder={placeholderText(
                                            "enter-6-digit-otp.title"
                                        )}
                                        required
                                        value={twoFactorCode}
                                        className="form-control"
                                        type="text"
                                        name="code"
                                        autoComplete="off"
                                        onChange={(e) => handleChange(e)}
                                        // onKeyPress={( event ) => numValidate( event )}
                                    />
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors ? errors : null}
                                    </span>
                                </div>

                                <div className="text-center d-flex justify-content-end gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-purple"
                                        onClick={(e) => onVerify(e)}
                                    >
                                        {isLoading ? (
                                            <span className="d-block">
                                                {getFormattedMessage(
                                                    "globally.loading.label"
                                                )}
                                            </span>
                                        ) : (
                                            <span>
                                                {getFormattedMessage(
                                                    "verify-code.title"
                                                )}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate("/app/login")}
                                    >
                                        <span>
                                            {getFormattedMessage(
                                                "globally.cancel-btn"
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuthPage;
