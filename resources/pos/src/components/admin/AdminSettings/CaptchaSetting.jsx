import React, { useEffect, useState } from 'react'
import MasterLayout from '../../MasterLayout'
import TabTitle from '../../../shared/tab-title/TabTitle'
import SettingSidebar from './SettingSidebar'
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod'
import { Button, Col, Form, Row } from 'react-bootstrap-v5'
import { fetchAdminSettings, updateAdminSettings } from '../../../store/action/admin/adminSettingsAction'
import { useDispatch, useSelector } from 'react-redux'

const CaptchaSettings = () => {
    const dispatch = useDispatch();
    const captchaSettings = useSelector(
        (state) => state.adminSetting.attributes || {}
    );

    const [formValues, setFormValues] = useState({
        captchaKey: "",
        captchaSecret: "",
    });

    const [errors, setErrors] = useState({
        captchaKey: "",
        captchaSecret: "",
    });

    const [disabled, setDisabled] = useState(true);

    const [isCaptchaEnabled, setIsCaptchaEnabled] = useState(false);

    useEffect(() => {
        dispatch(fetchAdminSettings());
    }, []);

    useEffect(() => {
        if (captchaSettings) {
            const initial = {
                isCaptchaEnabled: captchaSettings.captcha_enabled == 1 ? true : false,
                captchaKey: captchaSettings.captcha_key || "",
                captchaSecret: captchaSettings.captcha_secret || "",
            };
            setIsCaptchaEnabled(initial.isCaptchaEnabled);
            setFormValues(initial);
            setDisabled(true);
        }
    }, [captchaSettings]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handlePayPalToggle = (e) => setIsCaptchaEnabled(e.target.checked);

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;

        if (!formValues.captchaKey) {
            errorss["captchaKey"] = getFormattedMessage(
                "captcha.key.validate.title"
            );
            isValid = false;
        }
        if (!formValues.captchaSecret) {
            errorss["captchaSecret"] = getFormattedMessage(
                "captcha.secret.validate.title"
            );
            isValid = false;
        }

        setErrors(errorss);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const isValid = handleValidation();
        if (isValid) {
            const updatedSettings = {
                captcha_enabled: isCaptchaEnabled ? "1" : "0",
                captcha_key: formValues.captchaKey,
                captcha_secret: formValues.captchaSecret
            };
            dispatch(updateAdminSettings(updatedSettings));
        }

    }

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("captcha.setting.title")} />
            <div className="card">
                <div className="card-body payment_settings">
                    <div className="row">
                        <div className="w-100 d-md-flex">
                            <div>
                                <SettingSidebar />
                            </div>
                            <div className="w-100">
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group
                                        className="mb-3"
                                        controlId="paypalToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "enable.captcha.title"
                                            )}
                                            checked={isCaptchaEnabled}
                                            onChange={handlePayPalToggle}
                                        />
                                    </Form.Group>
                                    <Row className="mb-3">
                                        <Col md={12}>
                                            <Form.Group controlId="captchaKey">
                                                <label className="form-label">
                                                    {getFormattedMessage(
                                                        "captcha.key.title"
                                                    )}
                                                    :
                                                </label>
                                                <span className="required" />
                                                <Form.Control
                                                    type="text"
                                                    name="captchaKey"
                                                    value={
                                                        formValues.captchaKey
                                                    }
                                                    onChange={
                                                        handleInputChange
                                                    }
                                                    placeholder={placeholderText(
                                                        "captcha.key.placeholder.title"
                                                    )}
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {
                                                        errors[
                                                        "captchaKey"
                                                        ]
                                                    }
                                                </span>
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="captchaSecret">
                                                <label className="form-label">
                                                    {getFormattedMessage(
                                                        "captcha.secret.title"
                                                    )}
                                                    :
                                                </label>
                                                <span className="required" />
                                                <Form.Control
                                                    type="text"
                                                    name="captchaSecret"
                                                    value={
                                                        formValues.captchaSecret
                                                    }
                                                    onChange={
                                                        handleInputChange
                                                    }
                                                    placeholder={placeholderText(
                                                        "captcha.secret.placeholder.title"
                                                    )}
                                                />
                                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                                    {
                                                        errors[
                                                        "captchaSecret"
                                                        ]
                                                    }
                                                </span>
                                            </Form.Group>
                                        </Col>

                                    </Row>
                                    <Button
                                        variant="primary"
                                        // disabled={disabled}
                                        className="mt-4"
                                        type="submit"
                                    >
                                        {getFormattedMessage(
                                            "globally.save-btn"
                                        )}
                                    </Button>

                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    )
}

export default CaptchaSettings;