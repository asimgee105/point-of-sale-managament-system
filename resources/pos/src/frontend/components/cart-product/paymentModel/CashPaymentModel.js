import React, { useEffect, useState } from "react";
import { Modal, Form, Table } from "react-bootstrap";
import {
    currencySymbolHandling,
    decimalValidate,
    getFormattedMessage,
    getFormattedOptions,
    numFloatValidate,
    placeholderText,
} from "../../../../shared/sharedMethod";
import ReactSelect from "../../../../shared/select/reactSelect";
import { useDispatch } from "react-redux";
import { addToast } from "../../../../store/action/toastAction";
import { salePaymentStatusOptions, toastType, paymentStatusOptionsConstant } from "../../../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useIntl } from "react-intl";

const CashPaymentModel = (props) => {
    const {
        handleCashPayment,
        cashPaymentValue,
        onPaymentStatusChange,
        cashPayment,
        onChangeInput,
        onCashPayment,
        grandTotal,
        totalQty,
        cartItemValue,
        taxTotal,
        settings,
        subTotal,
        errors,
        onPaymentTypeChange,
        paymentTypeDefaultValue,
        paymentTypeFilterOptions,
        allConfigData,
        onChangeReturnChange,
        handlePaymentDetailChange,
        handleAddPayment,
        handleRemovePayment,
    } = props;

    const [summation, setSummation] = useState(0);
    const dispatch = useDispatch();
    const intl = useIntl();

    useEffect(() => {
        if (cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PAID || cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PARTIAL) {
            // For multiple payment methods, calculate total from payment_details
            const totalPaid = cashPaymentValue.payment_details?.reduce((sum, payment) => {
                return sum + (parseFloat(payment.amount) || 0);
            }, 0) || 0;
            setSummation(totalPaid - grandTotal);
        } else {
            // For single payment method (backward compatibility)
            cashPaymentValue.received_amount !== undefined
                ? setSummation(cashPaymentValue.received_amount - grandTotal)
                : setSummation(summation);
        }
    }, [cashPaymentValue.received_amount, cashPaymentValue.payment_details, grandTotal, cashPaymentValue?.payment_status?.value]);

    useEffect(() => {
        onChangeReturnChange(summation);
    }, [summation]);

    const validatePaymentDetails = () => {
        const paymentErrors = [];
        let totalAmount = 0;
        const isMultiplePayments = cashPaymentValue.payment_details?.length > 1;

        const totalAmounts = cashPaymentValue.payment_details?.reduce((sum, item) => {
                const amount = parseFloat(item.amount)?.toFixed(2);
                return !isNaN(amount) && amount > 0 ? sum + amount : sum;
            }, 0) || 0;

        cashPaymentValue.payment_details?.forEach((item, index) => {
            const entryError = {};
            const amount = parseFloat(item.amount)?.toFixed(2);

            if (!item.amount || isNaN(item.amount) || amount <= 0) {
                entryError.amount = intl.formatMessage({
                    id: 'globally.payment.amount.validate.label',
                    defaultMessage: 'Please enter a valid amount',
                });
            } else if (
                isMultiplePayments &&
                totalAmounts > grandTotal
            ) {
                entryError.amount = intl.formatMessage({
                    id: 'pos.payment.amount.exceeds.total.error',
                    defaultMessage: 'Payment amount cannot exceed the total amount',
                });
            }

            if (!item.payment_type || !item.payment_type.value) {
                entryError.payment_type = intl.formatMessage({
                    id: 'globally.payment.type.validate.label',
                    defaultMessage: 'Please select payment type',
                });
            } else {
                totalAmount += amount;
            }

            paymentErrors.push(entryError);
        });

        return paymentErrors;
    };

    const paymentStatusFilterOptions = getFormattedOptions(
        salePaymentStatusOptions
    );
    const paymentStatusDefaultValue = paymentStatusFilterOptions.map(
        (option) => {
            return {
                value: option.id,
                label: option.name,
            };
        }
    );

    const handleSave = (event, shouldPrint = false) => {
        if (
            cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PAID ||
            cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PARTIAL
        ) {
            const { paymentErrors } = validatePaymentDetails();

            const hasErrors = paymentErrors?.some(error => Object.keys(error).length > 0);
            if (hasErrors) {
                paymentErrors.forEach((error, index) => {
                    const errorFields = Object.entries(error);
                    errorFields.forEach(([field, message]) => {
                        dispatch(
                            addToast({
                                text: `Payment ${index + 1} - ${message}`,
                                type: toastType.ERROR,
                            })
                        );
                    });
                });
                return;
            }
        }

        onCashPayment(event, shouldPrint);
    };

    return (
        <Modal
            show={cashPayment}
            onHide={handleCashPayment}
            size="xl"
            className="pos-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {getFormattedMessage("pos-make-Payment.title")}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="row">
                    <div className="col-lg-8 col-12">
                        <div className="row">
                            {/* <Form.Group
                                className="mb-3 col-6"
                                controlId="formBasicReceived_amount"
                            >
                                <Form.Label>
                                    {getFormattedMessage(
                                        "pos-received-amount.title"
                                    )}
                                    :{" "}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    min={0}
                                    onKeyPress={(event) =>
                                        numFloatValidate(event)
                                    }
                                    name="received_amount"
                                    autoComplete="off"
                                    className="form-control-solid"
                                    defaultValue={grandTotal}
                                    onChange={(e) => onChangeInput(e)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-6">
                                <Form.Label>
                                    {getFormattedMessage(
                                        "paying-amount-title"
                                    )}
                                    :{" "}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="paying_amount"
                                    autoComplete="off"
                                    readOnly={true}
                                    className="form-control-solid"
                                    value={grandTotal}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-6">
                                <Form.Label>
                                    {getFormattedMessage(
                                        "pos.change-return.label"
                                    )}{" "}
                                    :{" "}
                                </Form.Label>
                                <Form.Control
                                    type="number"
                                    autoComplete="off"
                                    readOnly={true}
                                    className="form-control-solid"
                                    defaultValue={0.0}
                                    value={Number(summation).toFixed(2)}
                                />
                            </Form.Group> */}
                            {(cashPaymentValue?.payment_status?.value == 1 ||
                                cashPaymentValue?.payment_status?.value ==
                                3) && (
                                    <div className="col-md-12">
                                        {/* <div className="row mb-2">
                                            <label className="form-label">
                                                {getFormattedMessage(
                                                    "select.payment-type.label"
                                                )}
                                                :
                                            </label>
                                        </div> */}
                                        {cashPaymentValue?.payment_details?.map(
                                            (item, index) => (
                                                <div
                                                    key={index}
                                                    className="row mb-3"
                                                >
                                                    <div className="col-md-5">
                                                        <label className="form-label">
                                                            {getFormattedMessage(
                                                                "amount.title"
                                                            )}
                                                            :
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="amount"
                                                            value={item.amount}
                                                            placeholder={placeholderText(
                                                                "expense.input.amount.placeholder.label"
                                                            )}
                                                            onKeyPress={(event) => decimalValidate(event)}
                                                            onChange={(e) =>
                                                                handlePaymentDetailChange(
                                                                    index,
                                                                    "amount",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        {errors.payment_details?.[
                                                            index
                                                        ]?.amount && (
                                                                <span className="text-danger">
                                                                    {
                                                                        errors
                                                                            .payment_details[
                                                                            index
                                                                        ].amount
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>

                                                    <div className="col-md-5">
                                                        <ReactSelect
                                                            data={
                                                                paymentTypeFilterOptions
                                                            }
                                                            onChange={(value) =>
                                                                handlePaymentDetailChange(
                                                                    index,
                                                                    "payment_type",
                                                                    value
                                                                )
                                                            }
                                                            defaultValue={
                                                                item.payment_type
                                                            }
                                                            value={
                                                                item.payment_type
                                                            }
                                                            title={getFormattedMessage(
                                                                "select.payment-type.label"
                                                            )}
                                                            placeholder={placeholderText(
                                                                "sale.select.payment-type.placeholder"
                                                            )}
                                                        />
                                                        {errors.payment_details?.[
                                                            index
                                                        ]?.payment_type && (
                                                                <span className="text-danger">
                                                                    {
                                                                        errors
                                                                            .payment_details[
                                                                            index
                                                                        ].payment_type
                                                                    }
                                                                </span>
                                                            )}
                                                    </div>

                                                    <div className="col-md-2">
                                                        <div className="d-flex gap-2 pt-5 mt-2">
                                                            {cashPaymentValue
                                                                .payment_details
                                                                .length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-danger py-2 px-3"
                                                                        onClick={() =>
                                                                            handleRemovePayment(
                                                                                index
                                                                            )
                                                                        }
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={faTrash}
                                                                        />
                                                                    </button>
                                                                )}
                                                            {index ===
                                                                cashPaymentValue
                                                                    .payment_details
                                                                    .length -
                                                                1 && (
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-outline-secondary py-2 px-3"
                                                                        onClick={
                                                                            handleAddPayment
                                                                        }
                                                                    >
                                                                        <FontAwesomeIcon
                                                                            icon={faPlus}
                                                                        />
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            <Form.Group
                                className="mb-3 col-12"
                                controlId="formBasicNotes"
                            >
                                <Form.Label>
                                    {getFormattedMessage(
                                        "globally.input.note.label"
                                    )}
                                    :{" "}
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    className="form-control-solid"
                                    name="notes"
                                    rows={3}
                                    onChange={(e) => onChangeInput(e)}
                                    placeholder={placeholderText(
                                        "globally.input.note.placeholder.label"
                                    )}
                                    value={cashPaymentValue.notes}
                                />
                                <span className="text-danger">
                                    {errors["notes"] ? errors["notes"] : null}
                                </span>
                            </Form.Group>
                            <Form.Group
                                className="mb-3 col-12"
                                controlId="formBasicPaymentStatus"
                            >
                                <ReactSelect
                                    multiLanguageOption={
                                        paymentStatusFilterOptions
                                    }
                                    onChange={onPaymentStatusChange}
                                    name="payment_status"
                                    title={getFormattedMessage(
                                        "globally.detail.payment.status"
                                    )}
                                    value={cashPaymentValue.payment_status}
                                    errors={errors["payment_status"]}
                                    defaultValue={paymentStatusDefaultValue[1]}
                                    placeholder={placeholderText(
                                        "sale.select.payment-status.placeholder"
                                    )}
                                />
                            </Form.Group>
                        </div>
                    </div>
                    <div className="col-lg-4 col-12">
                        <div className="card custom-cash-card">
                            <div className="card-body p-6">
                                <Table
                                    striped
                                    bordered
                                    hover
                                    className="mb-0 text-nowrap"
                                >
                                    <tbody>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "dashboard.recentSales.total-product.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                <span className="btn btn-primary cursor-default rounded-md total-qty-text d-flex align-items-center justify-content-center p-2">
                                                    {totalQty}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "pos-total-amount.title"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    subTotal ? subTotal : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.order.tax"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    taxTotal ? taxTotal : "0.00"
                                                )}{" "}
                                                (
                                                {cartItemValue.tax
                                                    ? parseFloat(
                                                          cartItemValue.tax
                                                      ).toFixed(2)
                                                    : "0.00"}{" "}
                                                %)
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.discount"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    cartItemValue.discount
                                                        ? cartItemValue.discount
                                                        : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.shipping"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    cartItemValue.shipping
                                                        ? cartItemValue.shipping
                                                        : "0.00"
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.grand.total"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                        settings.attributes
                                                            .currency_symbol,
                                                    grandTotal
                                                )}
                                            </td>
                                        </tr>
                                        {(cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PAID || cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.PARTIAL) ? <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "pos.change-return.label"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                    settings.attributes
                                                        .currency_symbol,
                                                    Number(summation).toFixed(2)
                                                )}
                                            </td>
                                        </tr> : ''}
                                        {(cashPaymentValue?.payment_status?.value == paymentStatusOptionsConstant.UNPAID) ? <tr>
                                            <td scope="row" className="ps-3">
                                                {getFormattedMessage(
                                                    "globally.detail.due"
                                                )}
                                            </td>
                                            <td className="px-3">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    settings.attributes &&
                                                    settings.attributes
                                                        .currency_symbol,
                                                    grandTotal
                                                )}
                                            </td>
                                        </tr> : ''}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="mt-0">
                <button className="btn btn-primary" type="button" onClick={(e) => handleSave(e)}>
                    {getFormattedMessage("globally.submit-btn")}
                </button>
                <button className="btn btn-primary" type="button" onClick={(e) => handleSave(e, true)}>
                    {getFormattedMessage("globally.submit-and-print-button")}
                </button>
                <button
                    type="button"
                    className="btn btn-secondary me-0"
                    onClick={handleCashPayment}
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    );
};
export default CashPaymentModel;
