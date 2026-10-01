import React, { useEffect } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import { fetchAllWarehouses } from "../../../store/action/warehouseAction";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { fetchSuppliersReport, suppliersPdfAction } from "../../../store/action/suppliersReportAction";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf } from "@fortawesome/free-solid-svg-icons";

const SuppliersReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchAllWarehouses,
        frontSetting,
        fetchSuppliersReport,
        allSupplierReport,
        allConfigData,
        suppliersPdfAction
    } = props;
    const navigate = useNavigate();
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    const itemsValue =
        currencySymbol &&
        allSupplierReport.length >= 0 &&
        allSupplierReport.map((report) => ({
            name: report.name,
            phone: report.phone ? report.phone : '-',
            purchase: report.purchases_count,
            total_amount: report.total_grand_amount,
            id: report.id,
            currency: currencySymbol,
        }));

    const onChange = (filter) => {
        fetchSuppliersReport(filter, true);
    };

    const onReportsClick = (item) => {
        const id = item.id;
        navigate("/app/user/report/suppliers/details/" + id);
    };

    const onPdfClick = (item) => {
        const id = item.id;
        suppliersPdfAction(id);
    };

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            sortField: "name",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.name}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("globally.input.phone-number.label"),
            selector: (row) => row.phone,
            sortField: "phone",
            sortable: false,
        },
        {
            name: getFormattedMessage("purchases.title"),
            selector: (row) => row.purchase,
            sortField: "purchase",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="text-center w-25">{row.purchase}</span>
                );
            }
        },
        {
            name: getFormattedMessage("pos-total-amount.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.total_amount
                ),
            sortField: "total_amount",
            sortable: false,
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "150px",
            style: {
                justifyContent: "start",
            },
            cell: (row) => 
                row.purchase > 0 ? (
                    <>
                        <button
                            className="btn btn-sm btn-primary me-3"
                            variant="primary"
                            onClick={() => onPdfClick(row)}
                        >
                            <FontAwesomeIcon icon={faFilePdf} />
                        </button>
                        <button
                            className="btn btn-sm btn-primary"
                            variant="primary"
                            onClick={() => onReportsClick(row)}
                        >
                            {getFormattedMessage("reports.title")}
                        </button>
                    </>
                ) : (
                    <span className="text-center w-50">-</span>
                ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("supplier.report.title")} />
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                />
            </div>
        </MasterLayout>
    );
};
const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        allSupplierReport,
        allConfigData,
    } = state;
    return {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        allSupplierReport,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchAllWarehouses,
    fetchSuppliersReport,
    suppliersPdfAction
})(SuppliersReport);
