import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap-v5';
import { useDispatch, useSelector } from 'react-redux';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { fetchPaymentSettings, updatePaymentSettings } from '../../../store/action/admin/adminSettingsAction';
import MasterLayout from '../../MasterLayout';
import SettingSidebar from './SettingSidebar';
import { addToast } from '../../../store/action/toastAction';
import { toastType } from '../../../constants';
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

const PaymentSettings = () => {
    const dispatch = useDispatch();
    const paymentSettings = useSelector(
        (state) => state.adminSetting.attributes || {}
    );

    const [formValues, setFormValues] = useState({
        paypalClientId: "",
        paypalSecretKey: "",
        stripeKey: "",
        stripeSecretKey: "",
        manualInstructions: "",
        razorpayKey: "",
        razorpaySecret: "",
        paystackKey: "",
        paystackSecret: "",
        paypalEnv: "sandbox",
        stripeEnv: "sandbox",
        razorpayEnv: "sandbox",
        paystackEnv: "sandbox",
        manualEnv: "sandbox",
    });

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
    ];

    const [isPayPalEnabled, setIsPayPalEnabled] = useState(false);
    const [isStripeEnabled, setIsStripeEnabled] = useState(false);
    const [isManualEnabled, setIsManualEnabled] = useState(false);
    const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(false);
    const [isPaystackEnabled, setIsPaystackEnabled] = useState(false);
    const [initialValues, setInitialValues] = useState(null);
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        if (paymentSettings) {
            const initial = {
                paypalClientId: paymentSettings.paypal_client_id || "",
                paypalSecretKey: paymentSettings.paypal_secret || "",
                stripeKey: paymentSettings.stripe_key || "",
                stripeSecretKey: paymentSettings.stripe_secret || "",
                manualInstructions: paymentSettings.manual_payment_guide || "",
                isPayPalEnabled: paymentSettings.paypal_enabled == 1,
                isStripeEnabled: paymentSettings.stripe_enabled == 1,
                isManualEnabled: paymentSettings.manual_payment_enabled == 1,
                razorpayKey: paymentSettings.razorpay_key || "",
                razorpaySecret: paymentSettings.razorpay_secret || "",
                isRazorpayEnabled: paymentSettings.razorpay_enabled == 1,
                paystackKey: paymentSettings.paystack_key || "",
                paystackSecret: paymentSettings.paystack_secret || "",
                isPaystackEnabled: paymentSettings.paystack_enabled == 1,
                paypalEnv: paymentSettings.paypal_mode || "sandbox",
                stripeEnv: paymentSettings.stripe_mode || "sandbox",
                razorpayEnv: paymentSettings.razorpay_mode || "sandbox",
                paystackEnv: paymentSettings.paystack_mode || "sandbox",
            };
            setInitialValues(initial);
            setDisabled(true);
        }
    }, [paymentSettings]);

    useEffect(() => {
        if (initialValues) {
            const isSame =
                initialValues.paypalClientId === formValues.paypalClientId &&
                initialValues.paypalSecretKey === formValues.paypalSecretKey &&
                initialValues.stripeKey === formValues.stripeKey &&
                initialValues.stripeSecretKey === formValues.stripeSecretKey &&
                initialValues.manualInstructions ===
                formValues.manualInstructions &&
                initialValues.razorpayKey === formValues.razorpayKey &&
                initialValues.razorpaySecret === formValues.razorpaySecret &&
                initialValues.paystackKey === formValues.paystackKey &&
                initialValues.paystackSecret === formValues.paystackSecret &&
                initialValues.isPayPalEnabled === isPayPalEnabled &&
                initialValues.isRazorpayEnabled === isRazorpayEnabled &&
                initialValues.isPaystackEnabled === isPaystackEnabled &&
                initialValues.isStripeEnabled === isStripeEnabled &&
                initialValues.isManualEnabled === isManualEnabled &&
                initialValues.paypalEnv === formValues.paypalEnv &&
                initialValues.stripeEnv === formValues.stripeEnv &&
                initialValues.razorpayEnv === formValues.razorpayEnv;
                initialValues.paystackEnv === formValues.paystackEnv;

            setDisabled(isSame);
        }
    }, [
        formValues,
        isPayPalEnabled,
        isStripeEnabled,
        isRazorpayEnabled,
        isManualEnabled,
        initialValues,
        isPaystackEnabled,
    ]);

    const [errors, setErrors] = useState({
        paypalClientId: "",
        paypalSecretKey: "",
        stripeKey: "",
        stripeSecretKey: "",
        razorpayKey: "",
        razorpaySecret: "",
        paystackKey: "",
        paystackSecret: "",
        manualInstructions: "",
    });

    useEffect(() => {
        dispatch(fetchPaymentSettings());
    }, []);

    // Populate form values when paymentSettings is fetched
    useEffect(() => {
        if (paymentSettings) {
            setFormValues({
                paypalClientId: paymentSettings.paypal_client_id || "",
                paypalSecretKey: paymentSettings.paypal_secret || "",
                stripeKey: paymentSettings.stripe_key || "",
                stripeSecretKey: paymentSettings.stripe_secret || "",
                manualInstructions: paymentSettings.manual_payment_guide || "",
                razorpayKey: paymentSettings.razorpay_key || "",
                razorpaySecret: paymentSettings.razorpay_secret || "",
                paystackKey: paymentSettings.paystack_key || "",
                paystackSecret: paymentSettings.paystack_secret || "",
                paypalEnv: paymentSettings.paypal_mode || "sandbox",
                stripeEnv: paymentSettings.stripe_mode || "sandbox",
                razorpayEnv: paymentSettings.razorpay_mode || "sandbox",
                paystackEnv: paymentSettings.paystack_mode || "sandbox",
            });

            setIsPayPalEnabled(paymentSettings.paypal_enabled === "1");
            setIsStripeEnabled(paymentSettings.stripe_enabled === "1");
            setIsManualEnabled(paymentSettings.manual_payment_enabled === "1");
            setIsManualEnabled(paymentSettings.manual_payment_enabled === "1");
            setIsRazorpayEnabled(paymentSettings.razorpay_enabled === "1");
            setIsPaystackEnabled(paymentSettings.paystack_enabled === "1");
        }
    }, [paymentSettings]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [name]: value,
        }));
    };

    const handlePayPalToggle = (e) => setIsPayPalEnabled(e.target.checked);
    const handleStripeToggle = (e) => setIsStripeEnabled(e.target.checked);
    const handleRazorpayToggle = (e) => setIsRazorpayEnabled(e.target.checked);
    const handlePaystackpayToggle = (e) => setIsPaystackEnabled(e.target.checked);
    const handleManualToggle = (e) => setIsManualEnabled(e.target.checked);

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;

        if (
            !isPayPalEnabled &&
            !isStripeEnabled &&
            !isRazorpayEnabled &&
            !isPaystackEnabled &&
            !isManualEnabled
        ) {
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "payment-settings.enable.at.least.one.payment.method"
                    ),
                    type: toastType.ERROR,
                })
            );
            return;
        }

        if (isPayPalEnabled) {
            if (!formValues.paypalClientId) {
                errorss["paypalClientId"] = getFormattedMessage(
                    "payment-settings.paypal-client-id.validate.label"
                );
                isValid = false;
            }
            if (!formValues.paypalSecretKey) {
                errorss["paypalSecretKey"] = getFormattedMessage(
                    "payment-settings.paypal-secret-key.validate.label"
                );
                isValid = false;
            }
        }

        if (isStripeEnabled) {
            if (!formValues.stripeKey) {
                errorss["stripeKey"] = getFormattedMessage(
                    "payment-settings.stripe-key.validate.label"
                );
                isValid = false;
            }
            if (!formValues.stripeSecretKey) {
                errorss["stripeSecretKey"] = getFormattedMessage(
                    "payment-settings.stripe-secret-key.validate.label"
                );
                isValid = false;
            }
        }

        if (isRazorpayEnabled) {
            if (!formValues.razorpayKey) {
                errorss["razorpayKey"] = getFormattedMessage(
                    "payment-settings.razorpay-key.validate.label"
                );
                isValid = false;
            }
            if (!formValues.razorpaySecret) {
                errorss["razorpaySecret"] = getFormattedMessage(
                    "payment-settings.razorpay-secret.validate.label"
                );
                isValid = false;
            }
        }

        if (isPaystackEnabled) {
            if (!formValues.paystackKey) {
                errorss["paystackKey"] = getFormattedMessage(
                    "paystack.key.validate.title"
                );
                isValid = false;
            }
            if (!formValues.paystackSecret) {
                errorss["paystackSecret"] = getFormattedMessage(
                    "paystack.secret.validate.title"
                );
                isValid = false;
            }
        }

        if (isManualEnabled && !formValues.manualInstructions) {
            errorss["manualInstructions"] = getFormattedMessage(
                "payment-settings.manual-instructions.validate.label"
            );
            isValid = false;
        }

        setErrors(errorss);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (handleValidation()) {
            const updatedSettings = {
                manual_payment_enabled: isManualEnabled ? "1" : "0",
                manual_payment_guide: formValues.manualInstructions,
                stripe_enabled: isStripeEnabled ? "1" : "0",
                stripe_key: formValues.stripeKey,
                stripe_secret: formValues.stripeSecretKey,
                paypal_enabled: isPayPalEnabled ? "1" : "0",
                paypal_client_id: formValues.paypalClientId,
                paypal_secret: formValues.paypalSecretKey,
                razorpay_enabled: isRazorpayEnabled ? "1" : "0",
                paystack_enabled: isPaystackEnabled ? "1" : "0",
                razorpay_key: formValues.razorpayKey,
                razorpay_secret: formValues.razorpaySecret,
                paystack_key: formValues.paystackKey,
                paystack_secret: formValues.paystackSecret,
                paypal_mode: formValues.paypalEnv,
                stripe_mode: formValues.stripeEnv,
                razorpay_mode: formValues.razorpayEnv,
                paystack_mode: formValues.paystackEnv,
            };
            dispatch(updatePaymentSettings(updatedSettings));
        }
    };

    const handleContentChange = (content, delta, source, editor) => {
        setFormValues((inputs) => ({ ...inputs, manualInstructions: content }));
    };

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("payment-settings.title")} />
            <div className="card">
                <div className="card-body payment_settings">
                    <div className="row">
                        <div className="w-100 d-md-flex">
                            <div>
                                <SettingSidebar />
                            </div>
                            <div className="w-100">
                                <Form onSubmit={handleSubmit}>
                                    {/* PayPal Section */}
                                    <Form.Group
                                        className="mb-3"
                                        controlId="paypalToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "paypal.title"
                                            )}
                                            checked={isPayPalEnabled}
                                            onChange={handlePayPalToggle}
                                        />
                                    </Form.Group>
                                    {isPayPalEnabled && (
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group controlId="paypalClientId">
                                                    <label className="form-label">
                                                        {getFormattedMessage(
                                                            "payment-settings.paypal-client-id.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="paypalClientId"
                                                        value={
                                                            formValues.paypalClientId
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.paypal-client-id.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {
                                                            errors[
                                                            "paypalClientId"
                                                            ]
                                                        }
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="paypalSecretKey">
                                                    <label className="form-label">
                                                        {getFormattedMessage(
                                                            "payment-settings.paypal-secret-key.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="paypalSecretKey"
                                                        value={
                                                            formValues.paypalSecretKey
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.paypal-secret-key.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {
                                                            errors[
                                                            "paypalSecretKey"
                                                            ]
                                                        }
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3" controlId="paypalMode">
                                                    <label className="form-label">
                                                        {getFormattedMessage("payment-settings.paypal-mode.label")}:
                                                    </label>
                                                    <Form.Select
                                                        name="paypalEnv"
                                                        value={formValues.paypalEnv}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="sandbox">{placeholderText("payment-settings.mode.sandbox.label")}</option>
                                                        <option value="live">{placeholderText("payment-settings.mode.live.label")}</option>
                                                    </Form.Select>
                                                </Form.Group></Col>

                                        </Row>
                                    )}

                                    {/* Stripe Section */}
                                    <Form.Group
                                        className="mb-3"
                                        controlId="stripeToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "stripe.title"
                                            )}
                                            checked={isStripeEnabled}
                                            onChange={handleStripeToggle}
                                        />
                                    </Form.Group>
                                    {isStripeEnabled && (
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group controlId="stripeKey">
                                                    <label className="form-label">
                                                        {getFormattedMessage(
                                                            "payment-settings.stripe-key.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="stripeKey"
                                                        value={
                                                            formValues.stripeKey
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.stripe-key.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {errors["stripeKey"]}
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group controlId="stripeSecretKey">
                                                    <label className="form-label">
                                                        {getFormattedMessage(
                                                            "payment-settings.stripe-secret-key.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="stripeSecretKey"
                                                        value={
                                                            formValues.stripeSecretKey
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.stripe-secret-key.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {
                                                            errors[
                                                            "stripeSecretKey"
                                                            ]
                                                        }
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            {/* <Col md={6}>
                                                <Form.Group className="mb-3" controlId="stripeMode">
                                                    <label className="form-label">
                                                        {getFormattedMessage("payment-settings.stripe-mode.label")}:
                                                    </label>
                                                    <Form.Select
                                                        name="stripeEnv"
                                                        value={formValues.stripeEnv}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="sandbox">{placeholderText("payment-settings.mode.sandbox.label")}</option>
                                                        <option value="live">{placeholderText("payment-settings.mode.live.label")}</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col> */}
                                        </Row>
                                    )}

                                    {/* Razorpay Section */}
                                    <Form.Group
                                        className="mb-3"
                                        controlId="razorpayToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "razorpay.title"
                                            )}
                                            checked={isRazorpayEnabled}
                                            onChange={handleRazorpayToggle}
                                        />
                                    </Form.Group>
                                    {isRazorpayEnabled && (
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>
                                                        {getFormattedMessage(
                                                            "payment-settings.razorpay-key.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="razorpayKey"
                                                        value={
                                                            formValues.razorpayKey
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.razorpay-key.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {errors["razorpayKey"]}
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>
                                                        {getFormattedMessage(
                                                            "payment-settings.razorpay-secret.label"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="razorpaySecret"
                                                        value={
                                                            formValues.razorpaySecret
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "payment-settings.razorpay-secret.label"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {
                                                            errors[
                                                            "razorpaySecret"
                                                            ]
                                                        }
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            {/* <Col md={6}>
                                                <Form.Group className="mb-3" controlId="razorpayMode">
                                                    <label className="form-label">
                                                        {getFormattedMessage("payment-settings.razorpay-mode.label")}:
                                                    </label>
                                                    <Form.Select
                                                        name="razorpayEnv"
                                                        value={formValues.razorpayEnv}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="sandbox">{placeholderText("payment-settings.mode.sandbox.label")}</option>
                                                        <option value="live">{placeholderText("payment-settings.mode.live.label")}</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col> */}
                                        </Row>
                                    )}

                                    <Form.Group
                                        className="mb-3"
                                        controlId="razorpayToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "paystack.title"
                                            )}
                                            checked={isPaystackEnabled}
                                            onChange={handlePaystackpayToggle}
                                        />
                                    </Form.Group>
                                    {isPaystackEnabled && (
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>
                                                        {getFormattedMessage(
                                                            "paystack.key.title"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="paystackKey"
                                                        value={
                                                            formValues.paystackKey
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "paystack.key.title"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {errors["paystackKey"]}
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <label>
                                                        {getFormattedMessage(
                                                            "paystack.secret.title"
                                                        )}
                                                        :
                                                    </label>
                                                    <span className="required" />
                                                    <Form.Control
                                                        type="text"
                                                        name="paystackSecret"
                                                        value={
                                                            formValues.paystackSecret
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder={placeholderText(
                                                            "paystack.secret.title"
                                                        )}
                                                    />
                                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                                        {
                                                            errors[
                                                            "paystackSecret"
                                                            ]
                                                        }
                                                    </span>
                                                </Form.Group>
                                            </Col>
                                            {/* <Col md={6}>
                                                <Form.Group className="mb-3" controlId="razorpayMode">
                                                    <label className="form-label">
                                                        {getFormattedMessage("paystack.mode.title")}:
                                                    </label>
                                                    <Form.Select
                                                        name="paystackEnv"
                                                        value={formValues.paystackEnv}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="sandbox">{placeholderText("payment-settings.mode.sandbox.label")}</option>
                                                        <option value="live">{placeholderText("payment-settings.mode.live.label")}</option>
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col> */}
                                        </Row>
                                    )}

                                    {/* Manual Payment Section */}
                                    <Form.Group
                                        className="mb-3"
                                        controlId="manualToggle"
                                    >
                                        <Form.Check
                                            type="switch"
                                            label={getFormattedMessage(
                                                "manually.title"
                                            )}
                                            checked={isManualEnabled}
                                            onChange={handleManualToggle}
                                        />
                                    </Form.Group>
                                    {isManualEnabled && (
                                        <Form.Group controlId="manualPaymentInstructions">
                                            <label className="form-label">
                                                {getFormattedMessage(
                                                    "payment-settings.manual-instructions.label"
                                                )}
                                                :
                                            </label>
                                            <span className="required" />
                                            <ReactQuill
                                                className="pages-quill"
                                                theme="snow"
                                                formats={formats}
                                                value={
                                                    formValues.manualInstructions
                                                }
                                                onChange={handleContentChange}
                                            />
                                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                                {errors["manualInstructions"]}
                                            </span>
                                        </Form.Group>
                                    )}

                                    {/* Save Button */}
                                    <Button
                                        variant="primary"
                                        disabled={disabled}
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
    );
};

export default PaymentSettings;
