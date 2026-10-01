import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import ManualLogo from "../../assets/images/manual.svg";
import PaypalLogo from "../../assets/images/paypal.svg";
import RazorpayLogo from "../../assets/images/razorpay.svg";
import PayStack from "../../assets/images/paystack.svg";
import StripeLogo from "../../assets/images/stripe.svg";
import { PAYMENT_METHODS } from '../../constants';
import { formatAmount, getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import TabTitle from '../../shared/tab-title/TabTitle';
import { comparePlans, createSubscription, fetchPaymentMethods, handlePaypalPayment, handleRazorPayPayment, handleStripePayment, handlePayStackPayment } from '../../store/action/plansAction';
import MasterLayout from '../MasterLayout';
import { useRazorpay } from "react-razorpay";

const ComparePlan = (props) => {
    const { fetchPaymentMethods, userPlans, comparePlans, createSubscription, handlePaypalPayment, handleStripePayment, handleRazorPayPayment, handlePayStackPayment, stores } = props;
    const { id } = useParams();
    const navigate = useNavigate();
    const { Razorpay } = useRazorpay();
    const [selectStore, setSelectStore] = useState([]);
    const [manualNote, setManualNote] = useState("");
    const [manualAttachment, setManualAttachment] = useState(null);
    const [errors, setErrors] = useState({
        stores: "",
    });

    useEffect(() => {
        fetchPaymentMethods();
        comparePlans(id);
    }, []);

    useEffect(() => {
        if (stores.length > 0) {
            const activeStoreIds = stores.filter(store => store.attributes.active).map(store => store.id);
            setSelectStore(activeStoreIds);
        }
    }, [stores]);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

    const handleChanged = (event, store) => {
        const { checked } = event.target;
        let storeData = [...selectStore];
        if (checked) {
            storeData.push(store.id);
        } else {
            storeData = storeData.filter(id => id !== store.id);
        }
        setSelectStore(storeData);
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;
        if (userPlans?.comparePlans?.new_plan?.no_of_stores < selectStore.length) {
            errorss["stores"] = getFormattedMessage(
                "store.not.grater.validation.title"
            );
            isValid = false;
        }
        setErrors(errorss);
        return isValid;
    };

    const handleSubscription = () => {
        const valid = handleValidation();
        if (!valid) return;

        const { current_plan, new_plan } = userPlans?.comparePlans || {};
        const activeStoresCount = stores?.filter(store => store.attributes.status == 1).length;
        const shouldIncludeStores = (
            current_plan?.plan?.no_of_stores > new_plan?.no_of_stores &&
            new_plan?.no_of_stores < activeStoresCount
        );

        if (selectedPaymentMethod == PAYMENT_METHODS.STRIPE) {
            handleStripePayment({
                plan_id: id,
                amount: userPlans?.comparePlans?.new_plan?.payable_amount,
                ...(shouldIncludeStores && { stores: selectStore }),
            });
            return;
        }
        if (selectedPaymentMethod == PAYMENT_METHODS.PAYPAL) {
            handlePaypalPayment({
                plan_id: id,
                amount: userPlans?.comparePlans?.new_plan?.payable_amount,
                ...(shouldIncludeStores && { stores: selectStore }),
            });
            return;
        }
        if (selectedPaymentMethod == PAYMENT_METHODS.RAZORPAY) {
            handleRazorPayPayment({
                plan_id: id,
                amount: userPlans?.comparePlans?.new_plan?.payable_amount,
                ...(shouldIncludeStores && { stores: selectStore }),
            }, Razorpay);
            return;
        }

        if (selectedPaymentMethod == PAYMENT_METHODS.PAYSTACK) {
            handlePayStackPayment({
                plan_id: id,
                amount: userPlans?.comparePlans?.new_plan?.payable_amount,
                ...(shouldIncludeStores && { stores: selectStore }),
            });
            return;
        }

        if (selectedPaymentMethod == PAYMENT_METHODS.MANUAL) {
            const formData = new FormData();
            formData.append("plan_id", id);
            formData.append("payment_type", PAYMENT_METHODS.MANUAL);

            if (shouldIncludeStores) {
                formData.append("branches", JSON.stringify(selectStore));
            }
            if (manualNote) {
                formData.append("notes", manualNote);
            }
            if (manualAttachment) {
                formData.append("attachment", manualAttachment);
            }

            createSubscription(formData, navigate);
            return;
        }

        createSubscription({
            plan_id: id,
            payment_type: PAYMENT_METHODS.MANUAL,
            ...(shouldIncludeStores && { stores: selectStore }),
        }, navigate);
    }

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("compare-plan.title")} />
            <div className="card">
                <div className="card-body">
                    <div className="row gap-md-0 gap-3">
                        <div className="col-md-6">
                            <div className="card p-5 me-2 shadow rounded">
                                <div className="card-header py-0 px-0">
                                    <h3 className="align-items-start flex-column p-sm-5 p-0">
                                        <span className="fw-bolder text-primary fs-1 mb-1 me-0">
                                            {getFormattedMessage(
                                                "user.current-plan.title"
                                            )}
                                        </span>
                                    </h3>
                                </div>
                                <div className="px-4">
                                    <div className="d-flex align-items-center py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "number.of.stores.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.current_plan?.plan?.no_of_stores}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "plan-name.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.current_plan?.plan?.name}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-3 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.price.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 text-muted fw-bold mt-1">
                                            <span className="mb-2 me-1">
                                                {
                                                    userPlans?.comparePlans?.current_plan?.currency_symbol
                                                }
                                            </span>
                                            {formatAmount(
                                                userPlans?.comparePlans?.current_plan?.plan_amount
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.start.date.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {
                                                userPlans?.comparePlans?.current_plan?.start_date
                                            }
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.end.date.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {
                                                userPlans?.comparePlans?.current_plan?.end_date
                                            }
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.used.days.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {
                                                userPlans?.comparePlans?.current_plan?.used_days
                                            }
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.remaining.days.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {" "}
                                            {
                                                userPlans?.comparePlans?.current_plan?.remaining_days
                                            }
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.used.balance.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            <span className="mb-2 me-1">
                                                {
                                                    userPlans?.comparePlans?.current_plan?.currency_symbol
                                                }
                                            </span>
                                            {formatAmount(
                                                userPlans?.comparePlans?.current_plan?.used_balance
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.remaining.balance.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            <span className="mb-2 me-1">
                                                {
                                                    userPlans?.comparePlans?.current_plan?.currency_symbol
                                                }
                                            </span>
                                            {formatAmount(
                                                userPlans?.comparePlans?.current_plan?.remaining_balance
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div
                            className={`col-md-6`}
                        >
                            <div className="card h-100 p-5 me-2 shadow rounded">
                                <div className="card-header py-0 px-0">
                                    <h3 className="align-items-start flex-column p-sm-5 p-0">
                                        <span className="fw-bolder text-primary fs-1 mb-1 me-0">
                                            {getFormattedMessage(
                                                "new.plan.title"
                                            )}
                                        </span>
                                    </h3>
                                </div>
                                <div className="px-5 pb-5">
                                    <div className="d-flex align-items-center py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "number.of.stores.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.new_plan?.no_of_stores}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "plan-name.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.new_plan?.name}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.price.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            <span className="mb-2 me-1">
                                                {
                                                    userPlans?.comparePlans?.new_plan?.currency_symbol
                                                }
                                            </span>
                                            {formatAmount(
                                                userPlans?.comparePlans?.new_plan?.price
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.start.date.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.new_plan?.start_date}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.end.date.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.new_plan?.end_date}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "globally.plan.total.days.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {userPlans?.comparePlans?.new_plan?.total_days}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "new.plan.remaining.prev.balance.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {
                                                userPlans?.comparePlans?.new_plan?.currency_symbol
                                            }{" "}
                                            {formatAmount(
                                                userPlans?.comparePlans?.current_plan?.remaining_balance
                                            )}
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center  py-2">
                                        <h4 className="fs-5 w-50 plan-data mb-0 me-5 fw-bolder">
                                            {getFormattedMessage(
                                                "payable-amount.title"
                                            )}
                                        </h4>
                                        <span className="fs-5 w-50 text-muted fw-bold mt-1">
                                            {
                                                userPlans?.comparePlans?.new_plan?.currency_symbol
                                            }{" "}
                                            {userPlans?.comparePlans?.new_plan?.payable_amount > 0 ? formatAmount(
                                                userPlans?.comparePlans?.new_plan?.payable_amount
                                            ) : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {userPlans?.comparePlans?.current_plan?.plan?.no_of_stores > userPlans?.comparePlans?.new_plan?.no_of_stores &&
                        userPlans?.comparePlans?.new_plan?.no_of_stores < stores?.filter(store => store.attributes.status == 1).length &&
                        (
                            <div className="card plan-warning">
                                <div className="text-center mb-4">
                                    <h5 className="fw-bold text-warning mb-2">
                                        ⚠️ {getFormattedMessage("plan.downgrade.warning.title")}
                                    </h5>
                                    <p className="text-muted mb-0">
                                        {getFormattedMessage("plan.warning.message.title")}
                                    </p>
                                    <p className="text-muted">
                                        {getFormattedMessage("plan.warning.message2.title")}
                                    </p>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        {getFormattedMessage("store.title")} <span className="required">*</span>
                                    </label>
                                    <div className="row g-3">
                                        {stores
                                            .filter(store => store.attributes.status == 1)
                                            .map((store, index) => (
                                                <div className="col-md-3 col-sm-6" key={index}>
                                                    <div className="form-check form-switch d-flex align-items-center">
                                                        <input
                                                            className="form-check-input me-2"
                                                            type="checkbox"
                                                            disabled={store.attributes.active}
                                                            id={`store-${store.id}`}
                                                            name={store.attributes.name}
                                                            value={store.attributes.name}
                                                            checked={selectStore.includes(store.id)}
                                                            onChange={(e) => handleChanged(e, store)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`store-${store.id}`}>
                                                            {getFormattedMessage(store.attributes.name)}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                    <span className="text-danger d-block fw-400 fs-small mt-2">
                                        {errors["stores"] ? errors["stores"] : null}
                                    </span>
                                </div>
                            </div>
                        )}

                    {userPlans?.comparePlans?.new_plan?.payable_amount > 0 ? <div>
                        <h1 className="fs-14h mb-5 mt-5 text-center">
                            {getFormattedMessage("select-payment-method.title")}
                        </h1>
                        <div className="position-relative payment-container">
                            <div className="row d-flex justify-content-center">
                                {userPlans?.paymentMethods?.payment_methods?.some((method) => method.type == PAYMENT_METHODS.STRIPE) ? <div className="col-lg-2 p-2">
                                    <div className="mb-xxl-0 mb-4 border-radius" style={{ border: "1px solid rgb(234, 234, 236)" }} >
                                        <div className="selected-box">
                                            <label className="form-check p-4 input-padding">
                                                <div className="d-flex gap-3 justify-content-between">
                                                    <div className=" mb-3">
                                                        <img src={StripeLogo} alt='stripe-logo' />
                                                    </div>
                                                    <div>
                                                        <input onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.STRIPE)} className="form-check-input capture " type="radio" name="payment_mode" value="stripe_payment" />

                                                    </div>
                                                </div>
                                                <h6 className="mb-0">{getFormattedMessage("stripe.title")}
                                                </h6>
                                                <p className="fs-14p mb-0">{getFormattedMessage("pay-with.label")} {getFormattedMessage("stripe.title")}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                </div> : null}
                                {userPlans?.paymentMethods?.payment_methods?.some((method) => method.type == PAYMENT_METHODS.PAYPAL) ? <div className="col-lg-2 p-2">
                                    <div className="mb-xxl-0 mb-4 border-radius" style={{ border: "1px solid rgb(234, 234, 236)" }}>
                                        <div className="selected-box">
                                            <label className="form-check p-4 input-padding">
                                                <div className="d-flex gap-3 justify-content-between">
                                                    <div className=" mb-3">
                                                        <img src={PaypalLogo} alt='paypal-logo' />
                                                    </div>
                                                    <div>
                                                        <input onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.PAYPAL)} className="form-check-input capture " type="radio" name="payment_mode" value="paypal_payment" />
                                                    </div>
                                                </div>
                                                <h6 className="mb-0">{getFormattedMessage("paypal.title")}
                                                </h6>
                                                <p className="fs-14p mb-0">{getFormattedMessage("pay-with.label")} {getFormattedMessage("paypal.title")}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                </div> : null}
                                {userPlans?.paymentMethods?.payment_methods?.some((method) => method.type == PAYMENT_METHODS.RAZORPAY) ? <div className="col-lg-2 p-2">
                                    <div className="mb-xxl-0 mb-4 border-radius" style={{ border: "1px solid rgb(234, 234, 236)" }}>
                                        <div className="selected-box">
                                            <label className="form-check p-4 input-padding">
                                                <div className="d-flex gap-3 justify-content-between">
                                                    <div className=" mb-3">
                                                        <img src={RazorpayLogo} alt='razorpay-logo' />
                                                    </div>
                                                    <div>
                                                        <input onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.RAZORPAY)} className="form-check-input capture " type="radio" name="payment_mode" value="paypal_payment" />
                                                    </div>
                                                </div>
                                                <h6 className="mb-0">{getFormattedMessage("razorpay.title")}
                                                </h6>
                                                <p className="fs-14p mb-0">{getFormattedMessage("pay-with.label")} {getFormattedMessage("razorpay.title")}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                </div> : null}
                                {userPlans?.paymentMethods?.payment_methods?.some((method) => method.type == PAYMENT_METHODS.PAYSTACK) ? <div className="col-lg-2 p-2">
                                    <div className="mb-xxl-0 mb-4 border-radius" style={{ border: "1px solid rgb(234, 234, 236)" }}>
                                        <div className="selected-box">
                                            <label className="form-check p-4 input-padding">
                                                <div className="d-flex gap-3 justify-content-between">
                                                    <div className=" mb-3">
                                                        <img src={PayStack} alt='paystack-logo' />
                                                    </div>
                                                    <div>
                                                        <input onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.PAYSTACK)} className="form-check-input capture " type="radio" name="payment_mode" value="paystack_payment" />
                                                    </div>
                                                </div>
                                                <h6 className="mb-0">{getFormattedMessage("paystack.title")}
                                                </h6>
                                                <p className="fs-14p mb-0">{getFormattedMessage("pay-with.label")} {getFormattedMessage("paystack.title")}
                                                </p>
                                            </label>
                                        </div>
                                    </div>
                                </div> : null}
                                {userPlans?.paymentMethods?.payment_methods?.some((method) => method.type == PAYMENT_METHODS.MANUAL) ? <div className="col-lg-2 p-2">
                                    <div className="mb-xxl-0 mb-4 border-radius" style={{ border: "1px solid rgb(234, 234, 236)" }} >
                                        <div className="selected-box">
                                            <label className="form-check p-4 input-padding">
                                                <div className="d-flex gap-3 justify-content-between">
                                                    <div className=" mb-3">
                                                        <img src={ManualLogo} alt='manual-logo' />
                                                    </div>
                                                    <div>
                                                        <input onClick={() => setSelectedPaymentMethod(PAYMENT_METHODS.MANUAL)} className="form-check-input capture " type="radio" name="payment_mode" value="manual_payment" />
                                                    </div>
                                                </div>
                                                <h6 className="mb-0">{getFormattedMessage("manual-payment.title")}</h6>
                                                <p className="fs-14p mb-0">{getFormattedMessage("manual-payments-type.title")}</p>
                                            </label>
                                        </div>
                                    </div>
                                </div> : null}
                            </div>
                        </div>
                    </div> : ''}
                    {/* {selectedPaymentMethod === PAYMENT_METHODS.MANUAL ? <p className='text-center'><span className='fw-bold'>{getFormattedMessage("payment-settings.manual-instructions.label")}:</span> <br /><div dangerouslySetInnerHTML={{ __html: userPlans?.paymentMethods?.manual_payment_guide }}/></p> : ''} */}
                    {selectedPaymentMethod == PAYMENT_METHODS.MANUAL && (
                        <div className="text-center">
                            {/* Instructions */}
                            <p>
                                <span className="fw-bold">
                                    {getFormattedMessage("payment-settings.manual-instructions.label")}:
                                </span>
                                <br />
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: userPlans?.paymentMethods?.manual_payment_guide || "",
                                    }}
                                />
                            </p>

                            <div className="row">
                                {/* Notes input */}
                                <div className="mt-4 text-start col-md-6">
                                    <label className="fw-bold mb-2">
                                        {getFormattedMessage("globally.input.note.label")}:
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        placeholder={placeholderText(
                                            "globally.input.note.placeholder.label"
                                        )}
                                        value={manualNote}
                                        onChange={(e) => setManualNote(e.target.value)}
                                    />
                                </div>

                                {/* Attachment upload */}
                                <div className="mt-4 text-start col-md-6">
                                    <label className="fw-bold mb-2">
                                        {getFormattedMessage("payment-settings.manual-attachment.label")}:
                                    </label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={(e) => setManualAttachment(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`row d-flex justify-content-center align-items-center ${userPlans?.comparePlans?.new_plan?.payable_amount > 0 ? '' : 'mt-5'}`}>
                        <div className="col-lg-2 p-2 d-flex justify-content-center align-items-center">
                            <button disabled={(!userPlans?.comparePlans?.new_plan?.payable_amount < 0) || (userPlans?.comparePlans?.new_plan?.payable_amount > 0 && !selectedPaymentMethod)} className='btn btn-primary' onClick={handleSubscription}>{getFormattedMessage("pay-switch.button.title")}</button>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { userPlans, stores } = state;
    return { userPlans, stores }
}

export default connect(mapStateToProps, { fetchPaymentMethods, comparePlans, createSubscription, handlePaypalPayment, handleStripePayment, handleRazorPayPayment, handlePayStackPayment })(ComparePlan)