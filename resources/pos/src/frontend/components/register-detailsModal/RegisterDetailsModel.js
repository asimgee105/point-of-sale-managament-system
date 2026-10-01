import React, { useEffect } from "react";
import {
    currencySymbolHandling,
    getFormattedMessage,
    getFormattedDate,
} from "../../../shared/sharedMethod";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { connect, useDispatch, useSelector } from "react-redux";
import { getAllRegisterDetailsAction } from "../../../store/action/pos/posRegisterDetailsAction";
import moment from "moment";

function RegisterDetailsModel(props) {
    const {
        lgShow,
        setLgShow,
        printRegisterDetails,
        frontSetting,
        allConfigData,
        report,
    } = props;
    const { closeRegisterDetails } = useSelector((state) => state);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getAllRegisterDetailsAction(report?.id));
    }, []);

    const onsetLgShow = () => {
        setLgShow(false);
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    return (
        <div>
            <Modal
                size="lg"
                aria-labelledby="example-custom-modal-styling-title"
                show={lgShow}
                onHide={() => onsetLgShow()}
                className="registerModel-content"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        {getFormattedMessage("register.details.title")} -{" "}
                        {report ? report?.user_first_name : ""} (
                        {report
                            ? getFormattedDate(
                                  report?.created_at,
                                  allConfigData
                              )
                            : getFormattedDate(new Date(), allConfigData)}
                        )
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table
                        responsive
                        bordered
                        hover
                        className="mb-6 registerModel text-nowrap"
                    >
                        <tbody>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "select.payment-type.label"
                                    )}
                                </td>
                                <td>{getFormattedMessage("amount.title")}</td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "globally.input.cash-in-hand.label"
                                    )}
                                    :{" "}
                                </td>
                                <td>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.cash_in_hand || 0
                                    )}
                                </td>
                            </tr>
                            {/* Dynamic Payment Methods */}
                            {closeRegisterDetails?.payment_methods?.map(
                                (paymentMethod, index) => (
                                    <tr key={paymentMethod.id}>
                                        <td>{paymentMethod.name}: </td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                paymentMethod.amount
                                            )}
                                        </td>
                                    </tr>
                                )
                            )}

                            {/* Fallback to hardcoded if payment_methods not available */}
                            {(!closeRegisterDetails?.payment_methods ||
                                closeRegisterDetails?.payment_methods
                                    ?.length === 0) && (
                                <>
                                    <tr>
                                        <td>
                                            {getFormattedMessage("cash.label")}:{" "}
                                        </td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_cash_payment
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {getFormattedMessage(
                                                "payment-type.filter.cheque.label"
                                            )}
                                            :{" "}
                                        </td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_cheque_payment
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {getFormattedMessage(
                                                "payment-type.filter.bank-transfer.label"
                                            )}
                                            :{" "}
                                        </td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_bank_transfer_payment
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {getFormattedMessage(
                                                "payment-type.filter.other.label"
                                            )}
                                            :{" "}
                                        </td>
                                        <td>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_other_payment
                                            )}
                                        </td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </Table>

                    <Table
                        responsive
                        bordered
                        hover
                        className="registerModel text-nowrap"
                    >
                        <tbody>
                            <tr>
                                <td>
                                    {getFormattedMessage("total.sales.title")}:
                                </td>
                                <td>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.today_sales_amount ||
                                            0
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "register.total-refund.title"
                                    )}
                                    :
                                </td>
                                <td>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.today_sales_return_amount ||
                                            0
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    {getFormattedMessage(
                                        "register.total-payment.title"
                                    )}
                                    :
                                </td>
                                <td>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.total_payment_amount
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer className="justify-content-end pt-2 pb-3">
                    <button
                        className="btn btn-primary text-white"
                        onClick={printRegisterDetails}
                    >
                        {getFormattedMessage("print.title")}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setLgShow(false)}
                    >
                        {getFormattedMessage("pos-close-btn.title")}
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

const mapStateToProps = (state) => {
    const { posAllTodaySaleOverAllReport, allConfigData } = state;
    return { posAllTodaySaleOverAllReport, allConfigData };
};

export default connect(mapStateToProps, {})(RegisterDetailsModel);
