import React, { useEffect, useState } from "react";
import MasterLayout from "../../MasterLayout";
import TabTitle from "../../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { connect } from "react-redux";
import ReactSelect from "../../../shared/select/reactSelect";
import { fetchAllWarehouses } from "../../../store/action/warehouseAction";
import { stockReportAction } from "../../../store/action/stockReportAction";
import { totalStockReportExcel } from "../../../store/action/totalStockReportExcel";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import { useNavigate } from "react-router";

const StockReport = (props) => {
    const {
        isLoading,
        totalRecord,
        stockReports,
        fetchAllWarehouses,
        totalStockReportExcel,
        frontSetting,
        warehouses,
        stockReportAction,
        allConfigData,
    } = props;
    const navigate = useNavigate();
    const [warehouseValue, setWarehouseValue] = useState({});
    const [isWarehouseValue, setIsWarehouseValue] = useState(false);
    const Default_Warehouse = warehouses && warehouses.filter((item) => item.id === Number(frontSetting?.value?.default_warehouse));
    const Default_Warehouse_ID = Default_Warehouse.length > 0 ? Default_Warehouse[0]?.id : warehouses[0]?.id;
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;
    const array = warehouses && warehouses;
    const selectWarehouseArray =
        frontSetting &&
        array.filter(
            (item) => item.id === Default_Warehouse_ID
        );

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    useEffect(() => {
        if (warehouses.length > 0 && frontSetting?.value) {
            const defaultWarehouse = warehouses.find(
                (item) =>
                    item.id === Number(frontSetting?.value?.default_warehouse)
            );

            const id = defaultWarehouse?.id || warehouses[0]?.id;

            setWarehouseValue({
                label: defaultWarehouse?.attributes?.name || "All",
                value: id,
            });

            stockReportAction(id);
        }
    }, [warehouses]);


    useEffect(() => {
        if (isWarehouseValue === true) {
            totalStockReportExcel(
                warehouseValue.value
                    ? warehouseValue.value
                    : Default_Warehouse_ID,
                setIsWarehouseValue
            );
            setIsWarehouseValue(false);
        }
    }, [isWarehouseValue]);

    const itemsValue =
        currencySymbol &&
        stockReports.length >= 0 &&
        stockReports.map((stockReport) => ({
            code: stockReport.attributes.product.code,
            name: stockReport.attributes.product.name,
            product_category_name: stockReport.attributes.product_category_name,
            product_cost: stockReport.attributes.product.product_cost,
            product_price: stockReport.attributes.product.product_price,
            product_unit: stockReport.attributes.product_unit_name,
            current_stock: stockReport.attributes.quantity,
            id: stockReport.attributes.product_id,
            currency: currencySymbol,
        }));

    const onChange = (filter) => {
        warehouseValue.value && stockReportAction(
            warehouseValue.value
                ? warehouseValue.value
                : Default_Warehouse_ID,
            filter
        );
    };

    const onWarehouseChange = (obj) => {
        setWarehouseValue(obj);
        stockReportAction(obj.value);
    };

    const onExcelClick = () => {
        setIsWarehouseValue(true);
    };

    const onReportsClick = (item) => {
        const id = item.id;
        navigate("/app/user/report/report-detail-stock/" + id);
    };

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
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: false,
        },
        {
            name: getFormattedMessage("product.product-details.category.label"),
            selector: (row) => row.product_category_name,
            sortField: "product_category_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("product.product-details.cost.label"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.product_cost
                ),
            sortField: "product_cost",
            sortable: false,
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) =>
                currencySymbolHandling(
                    allConfigData,
                    row.currency,
                    row.product_price
                ),
            sortField: "product_price",
            sortable: false,
        },
        {
            name: getFormattedMessage("current.stock.label"),
            sortField: "current_stock",
            sortable: false,
            cell: (row) => {
                return (
                    <div>
                        <div className="badge bg-light-info me-2">
                            <span>{row.current_stock}</span>
                        </div>

                        <span className="badge bg-light-success me-2">
                            <span>{row.product_unit}</span>
                        </span>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "115px",
            cell: (row) => (
                <button
                    className="btn btn-sm btn-primary"
                    variant="primary"
                    onClick={() => onReportsClick(row)}
                >
                    {getFormattedMessage("reports.title")}
                </button>
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("stock.reports.title")} />
            <div className="mx-auto mb-md-5 col-12 col-md-4">
                {selectWarehouseArray[0] ? (
                    <ReactSelect
                        data={array}
                        onChange={onWarehouseChange}
                        defaultValue={
                            selectWarehouseArray[0]
                                ? {
                                      label: selectWarehouseArray[0].attributes
                                          .name,
                                      value: selectWarehouseArray[0].id,
                                  }
                                : ""
                        }
                        title={getFormattedMessage("warehouse.title")}
                        errors={""}
                        isRequired
                        placeholder={placeholderText(
                            "product.input.warehouse.placeholder.label"
                        )}
                    />
                ) : null}
            </div>
            <div className="pt-md-7">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    totalRows={totalRecord}
                    isEXCEL={itemsValue && itemsValue.length > 0}
                    onExcelClick={onExcelClick}
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
        stockReports,
        allConfigData,
    } = state;
    return {
        isLoading,
        totalRecord,
        warehouses,
        frontSetting,
        stockReports,
        allConfigData,
    };
};

export default connect(mapStateToProps, {
    fetchAllWarehouses,
    totalStockReportExcel,
    stockReportAction,
})(StockReport);
