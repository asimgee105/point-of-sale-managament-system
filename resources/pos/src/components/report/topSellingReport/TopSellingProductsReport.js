import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import { fetchTopSellingReport } from "../../../store/action/topSellingReportAction";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import TabTitle from "../../../shared/tab-title/TabTitle";
import MasterLayout from "../../MasterLayout";
import { fetchTopSellingExcel } from "../../../store/action/topSellingExcelAction";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

const TopSellingProductsReport = (props) => {
    const {
        isLoading,
        totalRecord,
        fetchTopSellingReport,
        frontSetting,
        topSellingReport,
        fetchTopSellingExcel,
        dates,
        allConfigData,
    } = props;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);

    const itemsValue =
        currencySymbol &&
        topSellingReport.length >= 0 &&
        topSellingReport.map((top) => ({
            code: top.code,
            product: top.name,
            price: top.price,
            quantity: (parseFloat(top?.total_quantity) || 0)?.toFixed(2),
            grand_total: top.grand_total,
            sale_unit: top.sale_unit,
            currency: currencySymbol,
        }));

    useEffect(() => {
        if (isWarehouseValue === true) {
            fetchTopSellingExcel(dates, setIsWarehouseValue);
        }
    }, [isWarehouseValue]);

    const columns = [
        {
            name: getFormattedMessage("globally.code.label"),
            sortField: "code",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.code}</span>
                    </span>
                );
            },
        },
        {
            name: getFormattedMessage("product.title"),
            selector: (row) => row.product,
            sortField: "product",
            sortable: false,
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.price),
            sortField: "price",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.quantity"),
            selector: (row) => row.quantity + " " + row.sale_unit,
            sortField: "quantity",
            sortable: false,
            cell: (row) => {
                return (
                    <div>
                        <span className="badge bg-light-danger me-2">
                            <span>{parseFloat(row.quantity)?.toFixed(2)}</span>
                        </span>
                        <span className="badge bg-light-primary me-2">
                            <span>{row.sale_unit}</span>
                        </span>
                    </div>
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
            sortable: false,
        },
    ];

    const onChange = (dates) => {
        fetchTopSellingReport(dates);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle
                title={placeholderText("top-selling-product.reports.title")}
            />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                isShowDateRangeField
                onChange={onChange}
                isShowSearch
                isLoading={isLoading}
                totalRows={totalRecord}
                isEXCEL={itemsValue && itemsValue.length > 0}
                onExcelClick={onExcelClick}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        isLoading,
        totalRecord,
        frontSetting,
        dates,
        topSellingReport,
        allConfigData,
    } = state;
    return {
        isLoading,
        totalRecord,
        frontSetting,
        dates,
        topSellingReport,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchTopSellingReport,
    fetchTopSellingExcel,
})(TopSellingProductsReport);
