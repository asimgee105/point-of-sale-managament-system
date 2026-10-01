import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import TabTitle from '../../shared/tab-title/TabTitle';
import { resetPassword } from '../../store/action/authAction';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import { Image } from 'react-bootstrap-v5';
import Cookies from "js-cookie";
import { ROLES } from '../../constants';
import { fetchLanguages } from '../../store/action/languageAction';
import LanguageLayout from './LanguageLayout';
import { fetchFrontCms } from '../../store/action/frontCmsAction';

const ResetPassword = (props) => {
    const { resetPassword, frontCms, loginUser } = props

    const navigate = useNavigate();
    const dispatch = useDispatch()
    const { token, email } = useParams();
    const [resetValue, setResetValue] = useState({
        password: '',
        password_confirmation: '',
        email: email,
        token: token
    });

    const userToken = Cookies.get("authToken");

    const [errors, setErrors] = useState({
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        dispatch(fetchFrontCms());
        dispatch(fetchLanguages());
        if (userToken) {
            if (loginUser.roles === ROLES.SUPER_ADMIN) {
                navigate("/app/admin/dashboard");
            } else {
                navigate("/app/user/dashboard");
            }
        }
    }, []);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!resetValue['password']) {
            errorss['password'] = getFormattedMessage('user.input.password.validate.label');
        } else if (resetValue["password"]?.length < 12) {
            errorss["password"] = getFormattedMessage(
                "auth.password.minimum.twelve"
            );
        } else if (!resetValue['password_confirmation']) {
            errorss['password_confirmation'] = getFormattedMessage('user.input.confirm-password.validate.label');
        } else if (resetValue['password'] !== resetValue['password_confirmation']) {
            errorss['password_confirmation'] = 'The confirm password and password must match';
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
        formData.append('email', data.email);
        formData.append('token', data.token);
        return formData;
    };

    const handleChange = (e) => {
        e.persist();
        setResetValue(inputs => ({ ...inputs, [e.target.name]: e.target.value }));
        setErrors('');
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const Valid = handleValidation();
        if (Valid) {
            resetPassword(prepareFormData(resetValue), navigate);
        }
    };

    return (
        <div className="content d-flex flex-column flex-column-fluid position-relative" style={{ backgroundImage: "url(/assets/images/asked-bg.png)" }}>
            <LanguageLayout/>
            <div className="d-flex flex-column flex-column-fluid align-items-center justify-content-center margin-top p-4">
                <TabTitle title="Reset Password" />
                <div className="mb-12 col-12 text-center align-items-center justify-content-center">
                    <a href="/" className="image mb-7 mb-sm-10">
                        <Image
                            className="logo-height"
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
                <div className="bg-white rounded-15 shadow-md width-540 px-5 px-sm-7 py-10 mx-auto">
                    <form className="form w-100">
                        <div className="text-center mb-10">
                            <h1 className="text-dark mb-3">
                                {getFormattedMessage("reset-password.title")}
                            </h1>
                        </div>
                        <div className="mb-5">
                            <label className="form-label">
                                {getFormattedMessage("user.input.password.label")} :
                            </label>
                            <span className="required" />
                            <input
                                type="password"
                                className="form-control"
                                placeholder={placeholderText(
                                    "user.input.password.placeholder.label"
                                )}
                                name="password"
                                value={resetValue.password}
                                required
                                onChange={(e) => handleChange(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["password"] ? errors["password"] : null}
                            </span>
                        </div>

                        <div className="mb-10">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "user.input.confirm-password.label"
                                )}
                            </label>
                            <span className="required" />
                            <input
                                type="password"
                                className="form-control"
                                placeholder={placeholderText(
                                    "user.input.confirm-password.placeholder.label"
                                )}
                                name="password_confirmation"
                                value={resetValue.password_confirmation}
                                required
                                onChange={(e) => handleChange(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["password_confirmation"]
                                    ? errors["password_confirmation"]
                                    : null}
                            </span>
                        </div>

                        <div className="d-flex justify-content-center pb-lg-0">
                            <button
                                type="submit"
                                className="btn btn-purple me-4"
                                onClick={(e) => onSubmit(e)}
                            >
                                {
                                    <span>
                                        {getFormattedMessage(
                                            "reset-password.title"
                                        )}
                                    </span>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { frontCms, loginUser, languages } = state;
    return { frontCms, loginUser, languages }
};

export default connect(mapStateToProps, { resetPassword })(ResetPassword);
