import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import * as EmailValidator from "email-validator";
import { loginAction } from "../../store/action/authAction";
import TabTitle from "../../shared/tab-title/TabTitle";
import { ROLES } from "../../constants";
import { getFormattedMessage, placeholderText } from "../../shared/sharedMethod";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faArrowRight, faChartLine, faBoxes, faReceipt } from "@fortawesome/free-solid-svg-icons";
import Cookies from "js-cookie";
import { fetchLanguages } from "../../store/action/languageAction";
import LanguageLayout from "./LanguageLayout";
import { fetchFrontCms } from "../../store/action/frontCmsAction";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loginUser, frontCms } = useSelector(state => state);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginInputs, setLoginInputs] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const token = Cookies.get("authToken");
    const brand = frontCms?.value?.app_name || "CloudPOS";

    useEffect(() => {
        dispatch(fetchFrontCms());
        dispatch(fetchLanguages());
        if (token) {
            navigate(loginUser?.roles === ROLES.SUPER_ADMIN ? "/app/admin/dashboard" : "/app/user/dashboard");
        }
    }, []);

    const onLogin = e => {
        e.preventDefault();
        if (loading) return;
        const email = loginInputs.email.trim();
        const nextErrors = {};
        if (!EmailValidator.validate(email)) {
            nextErrors.email = getFormattedMessage(email ? "globally.input.email.valid.validate.label" : "globally.input.email.validate.label");
        }
        if (!loginInputs.password) {
            nextErrors.password = getFormattedMessage("user.input.password.validate.label");
        }
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", loginInputs.password);
        formData.append("language_code", localStorage.getItem("updated_language") || "en");
        setLoading(true);
        dispatch(loginAction(formData, navigate, setLoading));
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setLoginInputs(inputs => ({ ...inputs, [name]: value }));
        setErrors(current => ({ ...current, [name]: "" }));
    };

    return (
        <main className="cp-login">
            <TabTitle title={placeholderText("login-form.login-btn.label")} />
            <section className="cp-login-story">
                <a href="/" className="cp-brand">
                    <span className="cp-brand-mark" aria-hidden="true">
                        <svg viewBox="0 0 32 32" fill="none"><path d="M9 24H7a6 6 0 0 1-1-11.9A9 9 0 0 1 23 9a7.5 7.5 0 0 1 2 15h-2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 18v8m4-12v12m4-5v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    </span>
                    <span>{brand}<small>YOUR BUSINESS, CONNECTED</small></span>
                </a>
                <div className="cp-story-content">
                    <span className="cp-eyebrow"><i /> A smarter way to run your store</span>
                    <h1>Less busywork.{" "}<br />More <em>business.</em></h1>
                    <p>Bring your sales, stock and customers together in one clear workspace. Stay focused on what comes next.</p>
                    <div className="cp-visual" aria-hidden="true">
                        <div className="cp-visual-header"><span className="cp-live-dot" /> Your store, at a glance <span>Overview</span></div>
                        <div className="cp-visual-grid">
                            <div><FontAwesomeIcon icon={faReceipt} /><strong>Sales</strong><small>Every transaction in view</small></div>
                            <div><FontAwesomeIcon icon={faBoxes} /><strong>Inventory</strong><small>Know what's on your shelves</small></div>
                        </div>
                        <div className="cp-spark"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>
                        <div className="cp-visual-footer"><FontAwesomeIcon icon={faChartLine} /> A clearer picture of your business <span>↗</span></div>
                    </div>
                </div>
                <div className="cp-story-footer"><span>Built around your everyday workflow.</span><span>Sales · Stock · Insights</span></div>
            </section>
            <section className="cp-login-panel">
                <div className="cp-language"><LanguageLayout /></div>
                <div className="cp-login-form">
                    <span className="cp-kicker">YOUR WORKSPACE AWAITS</span>
                    <h2>Welcome back.</h2>
                    <p className="cp-form-intro">Sign in to continue managing your business.</p>
                    <form onSubmit={onLogin} noValidate>
                        <div className="cp-field">
                            <label htmlFor="cp-email">{getFormattedMessage("globally.input.email.label")}</label>
                            <input id="cp-email" name="email" type="email" autoComplete="username" required value={loginInputs.email} onChange={handleChange} placeholder="you@company.com" className="form-control" aria-invalid={!!errors.email} aria-describedby={errors.email ? "cp-email-error" : undefined} />
                            {errors.email && <span id="cp-email-error" className="cp-field-error" role="alert">{errors.email}</span>}
                        </div>
                        <div className="cp-field">
                            <div className="cp-label-row"><label htmlFor="cp-password">{getFormattedMessage("user.input.password.label")}</label><Link to="/app/forgot-password">{getFormattedMessage("login-form.forgot-password.label")}</Link></div>
                            <div className="cp-password">
                                <input id="cp-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={loginInputs.password} onChange={handleChange} placeholder={placeholderText("user.input.password.placeholder.label")} className="form-control" aria-invalid={!!errors.password} aria-describedby={errors.password ? "cp-password-error" : undefined} />
                                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}><FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} /></button>
                            </div>
                            {errors.password && <span id="cp-password-error" className="cp-field-error" role="alert">{errors.password}</span>}
                        </div>
                        <button className="cp-submit" type="submit" disabled={loading} aria-busy={loading}>{getFormattedMessage(loading ? "globally.loading.label" : "login-form.login-btn.label")}<FontAwesomeIcon icon={faArrowRight} /></button>
                        <p className="cp-register">{getFormattedMessage("not.registered.label")} <Link to="/app/register">{getFormattedMessage("register.here.label")}</Link></p>
                    </form>
                    <div className="cp-signin-note"><span aria-hidden="true">◈</span> Your account permissions keep your workspace protected.</div>
                </div>
                <div className="cp-panel-footer">A little clarity. A lot more control.</div>
            </section>
        </main>
    );
};
export default Login;
