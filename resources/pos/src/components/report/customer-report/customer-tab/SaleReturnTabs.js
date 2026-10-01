import React, { useEffect } from "react";
import moment from "moment";
import { connect } from "react-redux";
import ReactDataTable from "../../../../shared/table/ReactDataTable";
import { fetchSalesReturn } from "../../../../store/action/salesReturnAction";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
} from "../../../../shared/sharedMethod";
import { customerSaleReturnReportPDF } from "../../../../store/action/customerReportAction";

const SaleReturnTabs = (props) => {
    const {
        salesReturn,
        fetchSalesReturn,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        customerId,
        customerSaleReturnReportPDF,
    } = props;

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    // fetch all sale return
    const onChange = (filter) => {
        fetchSalesReturn(filter, true);
    };

    //onClick pdf function
    const onReportPdfClick = (id) => {
        customerSaleReturnReportPDF(id);
    };

    const itemsValue =
        currencySymbol &&
        salesReturn.length >= 0 &&
        salesReturn.map((sale) => ({
            created_at: getFormattedDate(
                sale.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(sale.attributes.created_at).format("LT"),
            reference_code: sale.attributes.reference_code,
            customer_name: sale.attributes.customer_name,
            warehouse_name: sale.attributes.warehouse_name,
            status: sale.attributes.status,
            payment_status: sale.attributes.payment_status,
            grand_total: sale.attributes.grand_total,
            paid_amount: sale.attributes.paid_amount
                ? sale.attributes.paid_amount
                : (0.0).toFixed(2),
            id: sale.id,
            currency: currencySymbol,
        }));

    const columns = [
        {
            name: getFormattedMessage("globally.detail.reference"),
            sortField: "reference_code",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("customer.title"),
            selector: (row) => row.customer_name,
            sortField: "customer_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status == 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.received.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 2 && (
                        <span className="badge bg-light-primary">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 3 && (
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.ordered.label"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        },
        {
            name: getFormattedMessage("globally.detail.grand.total"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.grand_total
                ),
            sortField: "grand_total",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.paid"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.paid_amount
                ),
            sortField: "paid_amount",
            sortable: true,
        },
        {
            name: getFormattedMessage("globally.detail.payment.status"),
            selector: (row) => row.payment_status,
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-warning">
                        <span>
                            {getFormattedMessage(
                                "payment-status.filter.unpaid.label"
                            )}
                        </span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.created_at,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.created_at}</div>
                    </span>
                );
            },
        },
    ];

    return (
        <ReactDataTable
            columns={columns}
            items={itemsValue}
            onChange={onChange}
            totalRows={totalRecord}
            customerId={customerId}
            isReportPdf={salesReturn.length > 0 ? true : false}
            isLoading={isLoading}
            onReportPdfClick={() => onReportPdfClick(customerId)}
        />
    );
};

const mapStateToProps = (state) => {
    const { salesReturn, totalRecord, isLoading, frontSetting, allConfigData } =
        state;
    return { salesReturn, totalRecord, isLoading, frontSetting, allConfigData };
};

export default connect(mapStateToProps, {
    fetchSalesReturn,
    customerSaleReturnReportPDF,
})(SaleReturnTabs);
