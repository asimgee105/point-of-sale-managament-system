import React from "react";
import { Table, Image } from "react-bootstrap-v5";
import { calculateProductCost } from "../../shared/SharedMethod";
import "../../../assets/scss/frontend/pdf.scss";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../../shared/sharedMethod";
import moment from "moment";
import { paymentOptions, paymentStatusOptionsConstant, Tokens } from "../../../constants";
class PrintData extends React.PureComponent {
    render() {
        const paymentPrint = this.props.updateProducts;
        const allConfigData = this.props.allConfigData;
        const settings = this.props.settings;
        const paymentType = this.props.paymentType;
        const paymentTypeOption = this.props.paymentTypeOption;
        const taxes = this.props.taxes;
        const currency =
            paymentPrint.settings &&
            paymentPrint.settings.attributes &&
            paymentPrint.settings.attributes.currency_symbol;

        const updatedLanguage = localStorage.getItem(Tokens.UPDATED_LANGUAGE);
        const isRTL = updatedLanguage === "ar";
        const isA4 = settings?.attributes?.receipt_paper_size == 0;
        const is58mm = settings?.attributes?.receipt_thermal_size == 0;
        const labelFontStyle = settings?.attributes?.receipt_label_font_style == 0 ? "normal" :  settings?.attributes?.receipt_label_font_style == 1 ? "bold" : "bolder" || "normal";
        const otherFontStyle = settings?.attributes?.receipt_other_font_style == 0 ? "normal" :  settings?.attributes?.receipt_other_font_style == 1 ? "bold" : "bolder" || "normal";

        const isPaid =
            paymentPrint?.payment_status?.value ==
            paymentStatusOptionsConstant.PAID &&
            paymentPrint.paid_amount >=
            parseFloat(paymentPrint.grandTotal);

        const isPartial =
            (paymentPrint?.payment_status?.value ==
                paymentStatusOptionsConstant.PARTIAL ||
                paymentPrint?.payment_status?.value ==
                paymentStatusOptionsConstant.PAID) &&
            paymentPrint.paid_amount > 0 &&
            paymentPrint.paid_amount <
            parseFloat(paymentPrint.grandTotal);

        return (
            <div
                className="print-data"
                dir={isRTL ? "rtl" : "ltr"}
                style={{
                    padding: "none !important",
                    textAlign: isRTL ? "right" : "left",
                    fontWeight: otherFontStyle,
                }}
            >
                <style>
                    {`
                    @media print {
                      body, html {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                         display: flex;
                        justify-content: center;
                        align-items: center;
                      }
                      * {
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                      }
                     ${
                        isA4 ?`@page { size: A4 !important; margin: ${settings?.attributes?.receipt_margin}mm;}` 
                        :
                        is58mm ?
                        `@page { size: 58mm auto !important; margin: 0mm ${settings?.attributes?.receipt_margin}mm !important;}
                         .print-data {
                           width: 100% !important;
                         }
                        ` :
                        `@page { size: 80mm auto !important; margin: 0mm ${settings?.attributes?.receipt_margin}mm !important;}
                        .print-data {
                           width: 100% !important;
                         }
                        `
                     }
                      [dir="rtl"] {
                        direction: rtl !important;
                        text-align: right !important;
                      }
                      [dir="rtl"] table {
                        direction: rtl !important;
                      }
                      [dir="rtl"] th, [dir="rtl"] td {
                        text-align: right !important;
                      }
                    }
                   `}
                </style>

                     
                <div className="mt-4 mb-4 text-black text-center">
                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_logo_in_receipt
                        ) == 1 ? (
                        <img
                            src={
                                paymentPrint.frontSetting &&
                                paymentPrint.frontSetting.value.store_logo
                            }
                            alt=""
                            width="100px"
                        />
                    ) : (
                        ""
                    )}
                </div>
                <div
                    className="mt-4 mb-4 text-black text-center"
                    style={{
                        fontSize: "24px",
                        fontWeight: "600",
                        marginBottom: "15px !important",
                    }}
                >
                    {paymentPrint.frontSetting &&
                        paymentPrint.frontSetting.value.store_name}
                </div>
                <div
                    className="mb-2"
                    style={{
                        textAlign: "center",
                        direction: isRTL ? "rtl" : "ltr",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {taxes?.length > 0 &&
                        taxes
                            ?.filter((tax) => tax.attributes.status == 1)
                            ?.map((tax, index) => (
                                <div
                                    key={index}
                                    className="fw-semibold"
                                    style={{
                                        textAlign: "center",
                                        width: "100%",
                                    }}
                                >
                                    <p
                                        className="fs-6 text-body-tertiary mb-0"
                                        style={{
                                            margin: 0,
                                            textAlign: "center",
                                            direction: isRTL ? "rtl" : "ltr",
                                            display: "inline-block",
                                        }}
                                    >
                                        {tax.attributes.name && (
                                            <>
                                                <span style={{fontWeight: labelFontStyle}}>{tax.attributes.name}</span>
                                                <span>
                                                    {isRTL ? "\u061B" : ":"}
                                                </span>
                                            </>
                                        )}
                                        {tax.attributes.number && (
                                            <span className="fs-6" style={{fontWeight: otherFontStyle}}>{" "}{tax.attributes.number}</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                </div>

                {/* Store Info */}
                <section className="product-border">
                    <div style={{ marginBottom: "4px" }}>
                        <span className="me-2" style={{ fontWeight: labelFontStyle }}>
                            {getFormattedMessage(
                                "react-data-table.date.column.label"
                            )}
                            :
                        </span>
                        <span style={{ fontWeight: otherFontStyle }}>
                            {getFormattedDate(new Date(), allConfigData)}{" "}
                            {moment().format("hh:mm A")}
                        </span>
                    </div>
                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_address
                        ) == 1 && (
                            <div style={{ marginBottom: "4px" }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle }}>
                                    {getFormattedMessage(
                                        "globally.input.address.label"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle }}>
                                    {settings.attributes &&
                                        settings.attributes.store_address}
                                </span>
                            </div>
                        )}

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_email
                        ) == 1 && (
                            <div style={{ marginBottom: "4px" }}>
                                <span className="me-2" style={{ fontWeight: labelFontStyle }}>
                                    {getFormattedMessage(
                                        "globally.input.email.label"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle }}>
                                    {settings.attributes &&
                                        settings.attributes.store_email}
                                </span>
                            </div>
                        )}

                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_phone
                        ) == 1 && (
                            <div
                                style={{
                                    marginBottom: "4px",
                                }}
                            >
                                <span className="me-2" style={{ fontWeight: labelFontStyle }}>
                                    {getFormattedMessage(
                                        "pos-sale.detail.Phone.info"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle }}>
                                    {settings.attributes &&
                                        settings.attributes.store_phone}
                                </span>
                            </div>
                        )}
                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes.show_customer
                        ) == 1 && (
                            <div style={{}}>
                                <span style={{ fontWeight: labelFontStyle }}>
                                    {getFormattedMessage(
                                        "customer.title"
                                    )}
                                    :
                                </span>
                                <span style={{ fontWeight: otherFontStyle }}>
                                    {paymentPrint.customer_name &&
                                        paymentPrint.customer_name[0]
                                        ? paymentPrint.customer_name[0].label
                                        : paymentPrint.customer_name &&
                                        paymentPrint.customer_name.label}
                                </span>
                            </div>
                        )}
                </section>

                {/* Product List */}

                {isRTL ? <section className="mt-3">
                    {paymentPrint.products &&
                        paymentPrint.products.map((productName, index) => (
                            <div key={index + 1}>
                                <div className="p-0">
                                    {productName.name}{" "}
                                    {paymentPrint.settings &&
                                        parseInt(
                                            paymentPrint.settings.attributes
                                                .show_product_code
                                        ) == 1 ? (
                                        <span>({productName.code})</span>
                                    ) : (
                                        ""
                                    )}
                                </div>

                                {paymentPrint?.settings?.attributes
                                    ?.show_tax == "1" && (
                                        <div
                                            className="d-flex justify-content-between"
                                            style={{
                                                flexDirection: isRTL
                                                    ? "row-reverse"
                                                    : "row",
                                            }}
                                        >
                                            <p className="m-0 ws-6">
                                                {getFormattedMessage(
                                                    "globally.detail.tax"
                                                )}
                                                :{" "}
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    productName.tax_amount
                                                )}{" "}
                                                ({productName.tax_value}%)
                                            </p>
                                            <p className="m-0 ws-6">
                                                {getFormattedMessage(
                                                    "price.title"
                                                )}
                                                :{" "}
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    productName.product_price
                                                )}
                                            </p>
                                        </div>
                                    )}

                                <div className="product-border">
                                    <div
                                        className="border-0 d-flex justify-content-between"
                                        style={{
                                            flexDirection: "row",
                                        }}
                                    >

                                        <span className="text-black" dir="rtl">
                                            <span dir="ltr">
                                                {parseFloat(calculateProductCost(productName))?.toFixed(2)}&nbsp;X&nbsp;{parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name}
                                            </span>
                                        </span>
                                        <span dir="rtl">
                                            {currencySymbolHandling(
                                                allConfigData,
                                                currency,
                                                productName.quantity * calculateProductCost(productName)
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </section> :
                    <section className="mt-3">
                        {paymentPrint.products &&
                            paymentPrint.products.map((productName, index) => (
                                <div key={index + 1}>
                                    <div className="p-0">
                                        {productName.name}{" "}
                                        {paymentPrint.settings &&
                                            parseInt(
                                                paymentPrint.settings.attributes
                                                    .show_product_code
                                            ) == 1 ? (
                                            <span>({productName.code})</span>
                                        ) : (
                                            ""
                                        )}
                                    </div>

                                    {paymentPrint?.settings?.attributes
                                        ?.show_tax == "1" && (
                                            <div
                                                className="d-flex justify-content-between"
                                                style={{
                                                    flexDirection: isRTL
                                                        ? "row-reverse"
                                                        : "row",
                                                }}
                                            >
                                                <p className="m-0 ws-6">
                                                    {getFormattedMessage(
                                                        "price.title"
                                                    )}
                                                    :{" "}
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        productName.product_price
                                                    )}
                                                </p>
                                                <p className="m-0 ws-6">
                                                    {getFormattedMessage(
                                                        "globally.detail.tax"
                                                    )}
                                                    :{" "}
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        productName.tax_amount
                                                    )}{" "}
                                                    ({productName.tax_value}%)
                                                </p>
                                            </div>
                                        )}

                                    <div className="product-border">
                                        <div
                                            className="border-0 d-flex justify-content-between"
                                            style={{
                                                flexDirection: isRTL ? "row-reverse" : "row",
                                            }}
                                        >

                                            <span className="text-black">
                                                {isRTL ? (
                                                    <>
                                                        {parseFloat(calculateProductCost(productName))?.toFixed(2)} X {" "}
                                                        {parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name}
                                                    </>
                                                ) : (
                                                    <>
                                                        {parseFloat(productName.quantity).toFixed(2)} {productName.sale_unit_name} X {" "}
                                                        {parseFloat(calculateProductCost(productName))?.toFixed(2)}
                                                    </>
                                                )}
                                            </span>
                                            <span dir="auto">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    currency,
                                                    productName.quantity * calculateProductCost(productName)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </section>}

                {/* Totals */}

                <section
                    className="mt-3 product-border"
                    style={{
                        direction: isRTL ? "rtl" : "ltr",
                        textAlign: isRTL ? "right" : "left",
                    }}
                >
                    {[
                        { label: "pos-total-amount.title", value: paymentPrint.subTotal || "0.00" },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax) == 1 && {
                            label: "globally.detail.order.tax",
                            suffix: Number(paymentPrint.tax) > 0 ? `(${Number(paymentPrint.tax).toFixed(2)}%)` : "",
                            value: paymentPrint.taxTotal || "0.00",
                        },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax_discount_shipping) == 1 && {
                            label: "globally.detail.discount",
                            value: paymentPrint.discount || "0.00",
                        },
                        paymentPrint.settings &&
                        parseInt(paymentPrint.settings.attributes.show_tax_discount_shipping) == 1 &&
                        parseFloat(paymentPrint.shipping) !== 0.0 && {
                            label: "globally.detail.shipping",
                            value: paymentPrint.shipping || "0.00",
                        },
                        { label: "globally.detail.grand.total", value: paymentPrint.grandTotal },
                        {
                            label: "sale-paid.total.amount.title",
                            value: parseFloat(paymentPrint.grandTotal || 0) + (paymentPrint.changeReturn || 0),
                        },
                        ...(isPaid && paymentPrint.changeReturn && parseFloat(paymentPrint.changeReturn) > 0 ? [{
                            label: "pos.change-return.label",
                            value: parseFloat(paymentPrint.changeReturn)
                        }] : []),
                        ...(isPartial ? [{
                            label: "globally.detail.due",
                            value: 
                                parseFloat(
                                    paymentPrint.grandTotal
                                ) -
                                parseFloat(
                                    paymentPrint.paid_amount
                                )
                        }] : []),
                    ]
                        .filter(Boolean)
                        .map((item, i) => {
                            const labelElement = (
                                <span style={{ display: "inline-flex", gap: "4px", alignItems: "center", fontWeight: labelFontStyle, color: "#000" }}>
                                    <>
                                        {getFormattedMessage(item.label)}
                                        {item.suffix ? ` ${item.suffix}` : ""} :
                                    </>
                                </span>
                            );

                            const valueElement = (
                                <div style={{ fontWeight: otherFontStyle, color: "#000" }}>
                                    {currencySymbolHandling(allConfigData, currency, item.value)}
                                </div>
                            );

                            return (
                                <div
                                    key={i}
                                    className="d-flex align-items-center justify-content-between"
                                    style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: "10px", marginBottom: "2px" }}
                                >
                                    {isRTL ? (
                                        <>
                                            {valueElement}
                                            {labelElement}
                                        </>
                                    ) : (
                                        <>
                                            {labelElement}
                                            {valueElement}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                </section>

                {/* Payment Info */}
                {(() => {
                    return (
                        <>
                            {(isPaid || isPartial) && (
                                <Table
                                    style={{
                                        padding: "none !important",
                                        marginTop: "20px !important",
                                        direction: isRTL ? "rtl" : "ltr",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    textAlign: isRTL
                                                        ? "right"
                                                        : "start",
                                                    color: "#000",
                                                    fontWeight: labelFontStyle,
                                                }}
                                            >
                                                {getFormattedMessage(
                                                    "pos-sale.detail.paid-by.title"
                                                )}
                                            </th>
                                            <th style={{ textAlign: "center", color: "#000", fontWeight: labelFontStyle, }}>
                                                {getFormattedMessage(
                                                    "amount.title"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paymentPrint && paymentPrint?.payments?.length > 0 ? (
                                            paymentPrint?.payments.map((payment, index) => (
                                                <tr key={index}>
                                                    <td style={{ color: "#000", fontWeight: otherFontStyle }}>{payment?.payment_method?.name}</td>
                                                    <td style={{ textAlign: "center", color: "#000", fontWeight: otherFontStyle }}>
                                                        {currencySymbolHandling(
                                                            allConfigData,
                                                            currency,
                                                            payment?.amount
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td style={{ color: "#000", fontWeight: otherFontStyle }}>{paymentType}</td>
                                                <td style={{ textAlign: "center", color: "#000", fontWeight: otherFontStyle }}>
                                                    {currencySymbolHandling(
                                                        allConfigData,
                                                        currency,
                                                        paymentPrint.grandTotal
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            )}
                        </>
                    );
                })()}

                {paymentPrint?.payment_status?.value == paymentStatusOptionsConstant.UNPAID ?
                    <div style={{
                        textAlign: "center",
                        padding: "20px 0",
                        marginBottom: "15px"
                    }}>
                        <h3 style={{
                            color: "#dc3545",
                            fontWeight: "bold",
                            marginBottom: "10px"
                        }}>
                            {getFormattedMessage("payment-status.filter.unpaid.label")}
                        </h3>
                        <div style={{
                            color: "#6c757d"
                        }}>
                            {getFormattedMessage("sale-Due.total.amount.title")}: {currencySymbolHandling(
                                allConfigData,
                                currency,
                                paymentPrint.grandTotal
                            )}
                        </div>
                    </div> : ''}

                {/*note section*/}
                {paymentPrint && paymentPrint.note ? (
                    <Table>
                        <tbody>
                            <tr
                                style={{
                                    border: "0",
                                }}
                            >
                                <td
                                    scope="row"
                                    style={{
                                        padding: "none !important",
                                        fontSize: "15px",
                                    }}
                                >
                                    <span
                                        style={{
                                            padding: "none !important",
                                            fontSize: "15px",
                                            verticalAlign: "top",
                                            display: "inline-block",
                                            color: "#000",
                                            fontWeight: labelFontStyle
                                        }}
                                    >
                                        {getFormattedMessage(
                                            "globally.input.note.label"
                                        )}{" "}
                                        :
                                    </span>
                                    <p
                                        style={{
                                            fontSize: "15px",
                                            verticalAlign: "top",
                                            display: "inline-block",
                                            padding: "none !important",
                                            color: "#000",
                                            fontWeight: otherFontStyle
                                        }}
                                    >
                                        {paymentPrint && paymentPrint.note}
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                ) : (
                    ""
                )}
                {paymentPrint.settings &&
                    parseInt(paymentPrint.settings.attributes.show_note) ==
                    1 && (
                        <h3
                            style={{
                                textAlign: "center",
                                color: "#000",
                                padding: "none !important",
                            }}
                        >
                            {paymentPrint.settings &&
                                paymentPrint.settings.attributes.notes
                                ? paymentPrint.settings &&
                                paymentPrint.settings.attributes.notes
                                : ""}
                        </h3>
                    )}
                <div className="text-center d-block">
                    {paymentPrint.settings &&
                        parseInt(
                            paymentPrint.settings.attributes
                                ?.show_barcode_in_receipt
                        ) == 1 && (
                            <Image
                                src={paymentPrint && paymentPrint.barcode_url}
                                alt={
                                    paymentPrint && paymentPrint.reference_code
                                }
                                height={25}
                                width={100}
                            />
                        )}
                    <span
                        className="d-block d-flex justify-content-center"
                        style={{
                            color: "#000",
                            padding: "none !important",
                            fontWeight: otherFontStyle
                        }}
                    >
                        {paymentPrint && paymentPrint.reference_code}
                    </span>
                </div>
            </div>
        );
    }
}

export default PrintData;
