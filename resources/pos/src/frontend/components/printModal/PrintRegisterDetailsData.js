import React from "react";
import { Table } from "react-bootstrap-v5";
import moment from "moment";
import "../../../assets/scss/frontend/pdf.scss";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../../shared/sharedMethod";

class PrintRegisterDetailsData extends React.PureComponent {
    render() {
        const frontSetting = this.props.frontSetting;
        const allConfigData = this.props.allConfigData;
        const closeRegisterDetails = this.props.closeRegisterDetails;
        const report = this.props.report;
        const currencySymbol =
            frontSetting &&
            frontSetting.value &&
            frontSetting.value.currency_symbol;

        return (
            <div
                className="print-data"
                style={{
                    width: "100%",
                    maxWidth: "600px",
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontWeight: "bold",
                            color: "#212529",
                            textAlign: "center",
                            marginBottom: "10px",
                        }}
                    >
                        {getFormattedMessage("register.details.title")} - {
                            report ? report?.user_first_name : ''} (
                                {report ? moment(report?.created_at).format("MMMM Do YYYY") :  moment(Date()).format("MMMM Do YYYY")})
                    </h1>
                </div>
                <Table style={{ width: "100%", marginTop: "30px" }}>
                    <thead>
                        <tr style={{ width: "100%", background: "#F8F9FA" }}>
                            <th
                                style={{
                                    textAlign: "start",
                                    padding: "8px 15px",
                                    fontSize: "12px",
                                }}
                            >
                                {getFormattedMessage(
                                    "select.payment-type.label"
                                )}
                            </th>
                            <th
                                style={{
                                    textAlign: "start",
                                    padding: "8px 15px",
                                    fontSize: "12px",
                                }}
                            >
                                {getFormattedMessage(
                                    "amount.title"
                                )}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            style={{
                                width: "100%",
                                borderBottom: "1px solid #DEE2E6",
                            }}
                        >
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                {getFormattedMessage(
                                    "globally.input.cash-in-hand.label"
                                )}
                            </td>
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                <span>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.cash_in_hand
                                    )}
                                </span>
                            </td>
                        </tr>
                        {/* Dynamic Payment Methods */}
                        {closeRegisterDetails?.payment_methods?.map((paymentMethod, index) => (
                            <tr
                                key={paymentMethod.id}
                                style={{
                                    width: "100%",
                                    borderBottom: "1px solid #DEE2E6",
                                }}
                            >
                                <td
                                    style={{
                                        fontSize: "12px",
                                        border: "none",
                                        padding: "8px 15px",
                                    }}
                                >
                                    {paymentMethod.name}
                                </td>
                                <td
                                    style={{
                                        fontSize: "12px",
                                        border: "none",
                                        padding: "8px 15px",
                                    }}
                                >
                                    <span>
                                        {currencySymbolHandling(
                                            allConfigData,
                                            currencySymbol,
                                            paymentMethod.amount
                                        )}
                                    </span>
                                </td>
                            </tr>
                        ))}

                        {/* Fallback to hardcoded if payment_methods not available */}
                        {(!closeRegisterDetails?.payment_methods || closeRegisterDetails?.payment_methods?.length === 0) && (
                            <>
                                <tr
                                    style={{
                                        width: "100%",
                                        borderBottom: "1px solid #DEE2E6",
                                    }}
                                >
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        {getFormattedMessage(
                                            "cash.label"
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_cash_payment
                                            )}
                                        </span>
                                    </td>
                                </tr>
                                <tr
                                    style={{
                                        width: "100%",
                                        borderBottom: "1px solid #DEE2E6",
                                    }}
                                >
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        {getFormattedMessage(
                                            "payment-type.filter.cheque.label"
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_cheque_payment
                                            )}
                                        </span>
                                    </td>
                                </tr>
                                <tr
                                    style={{
                                        width: "100%",
                                        borderBottom: "1px solid #DEE2E6",
                                    }}
                                >
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        {getFormattedMessage(
                                            "payment-type.filter.bank-transfer.label"
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_bank_transfer_payment
                                            )}
                                        </span>
                                    </td>
                                </tr>
                                <tr
                                    style={{
                                        width: "100%",
                                        borderBottom: "1px solid #DEE2E6",
                                    }}
                                >
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        {getFormattedMessage(
                                            "payment-type.filter.other.label"
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            fontSize: "12px",
                                            border: "none",
                                            padding: "8px 15px",
                                        }}
                                    >
                                        <span>
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currencySymbol,
                                                closeRegisterDetails?.today_sales_other_payment
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            </>
                        )}
                    </tbody>
                </Table>

                <Table
                    style={{
                        width: "100%",
                        marginTop: "30px",
                        border: "1px solid #DEE2E6",
                    }}
                >
                    <tbody>
                        <tr
                            style={{
                                width: "100%",
                                borderBottom: "1px solid #DEE2E6",
                            }}
                        >
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                {getFormattedMessage(
                                    "total.sales.title"
                                )}
                            </td>
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                <span>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.today_sales_amount
                                    )}
                                </span>
                            </td>
                        </tr>

                        <tr
                            style={{
                                width: "100%",
                                borderBottom: "1px solid #DEE2E6",
                            }}
                        >
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                {getFormattedMessage(
                                    "register.total-refund.title"
                                )}
                            </td>
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                <span>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.today_sales_return_amount
                                    )}
                                </span>
                            </td>
                        </tr>
                        <tr
                            style={{
                                width: "100%",
                                borderBottom: "1px solid #DEE2E6",
                            }}
                        >
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                {getFormattedMessage(
                                    "register.total-payment.title"
                                )}
                            </td>
                            <td
                                style={{
                                    fontSize: "12px",
                                    border: "none",
                                    padding: "8px 15px",
                                }}
                            >
                                <span>
                                    {currencySymbolHandling(
                                        allConfigData,
                                        currencySymbol,
                                        closeRegisterDetails?.total_payment_amount
                                    )}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }
}

export default PrintRegisterDetailsData;
