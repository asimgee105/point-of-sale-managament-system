import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    paymentMethodName,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { fetchPurchases } from "../../../store/action/purchaseAction";
import { fetchAllWarehouses } from "../../../store/action/warehouseAction";
import { fetchAllSuppliers } from "../../../store/action/supplierAction";
import { totalPurchaseReportExcel } from "../../../store/action/totalPurchaseReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { fetchPaymentMethods } from "../../../store/action/paymentMethodAction";

const PurchaseReport = (props) => {
    const {
        fetchPurchases,
        fetchAllWarehouses,
        fetchAllSuppliers,
        purchases,
        totalRecord,
        isLoading,
        suppliers,
        frontSetting,
        totalPurchaseReportExcel,
        dates,
        allConfigData,
        paymentMethods,
        fetchPaymentMethods,
    } = props;

    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const itemsValue =
        currencySymbol &&
        purchases.length >= 0 &&
        purchases.map((purchase) => {
            const supplier = suppliers.filter(
                (supplier) => supplier.id === purchase.attributes.supplier_id
            );
            const supplierName =
                supplier[0] &&
                supplier[0].attributes &&
                supplier[0].attributes.name;
            return {
                reference_code: purchase.attributes.reference_code,
                supplier: supplierName,
                warehouse: purchase.attributes.warehouse_name,
                status: purchase.attributes.status,
                payment: purchase.attributes.payment_type,
                payment_type_name: {
                    value: purchase.attributes.payment_type,
                    label: paymentMethodName(
                        paymentMethods,
                        purchases && purchase.attributes
                    ),
                },
                date: getFormattedDate(
                    purchase.attributes.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(purchase.attributes.created_at).format("LT"),
                grand_total: purchase.attributes.grand_total,
                id: purchase.id,
                currency: currencySymbol,
            };
        });

    const columns = [
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-primary">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.detail.reference"),
            sortField: "reference_code",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.reference_code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("supplier.title"),
            selector: (row) => row.supplier,
            sortField: "supplier",
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
            name: getFormattedMessage("select.payment-type.label"),
            selector: (row) => row.payment,
            sortField: "payment",
            sortable: false,
            cell: (row) => {
                return row.payment_type_name.label ? (
                    <span className="badge bg-light-primary">
                        <span>{row.payment_type_name.label}</span>
                    </span>
                ) : (
                    "-"
                );
            },
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "date",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        <div>{row.date}</div>
                    </span>
                );
            },
        },
    ];

    const onChange = (filter) => {
        fetchAllSuppliers();
        fetchAllWarehouses();
        fetchPurchases(filter, true);
    };

    const onExcelClick = (filter) => {
       totalPurchaseReportExcel(dates, filter, setIsWarehouseValue);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("purchase.reports.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowDateRangeField
                isEXCEL={itemsValue && itemsValue.length > 0}
                isShowFilterField
                isStatus
                onExcelClick={onExcelClick}
            />
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        purchases,
        dates,
        totalRecord,
        isLoading,
        warehouses,
        suppliers,
        frontSetting,
        allConfigData,
        paymentMethods,
    } = state;
    return {
        purchases,
        dates,
        totalRecord,
        isLoading,
        warehouses,
        suppliers,
        frontSetting,
        allConfigData,
        paymentMethods,
    };
};

export default connect(mapStateToProps, {
    fetchPurchases,
    fetchAllWarehouses,
    fetchAllSuppliers,
    totalPurchaseReportExcel,
    fetchPaymentMethods,
})(PurchaseReport);
