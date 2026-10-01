import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteSaleReturn from "./DeleteSaleReturn";
import { fetchSalesReturn } from "../../store/action/salesReturnAction";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import { downloadSaleReturnPdf } from "../../store/action/downloadSaleReturnPdfAction";
import ShowPayment from "../../shared/showPayment/ShowPayment";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const SaleReturn = (props) => {
    const {
        salesReturn,
        fetchSalesReturn,
        totalRecord,
        isLoading,
        frontSetting,
        downloadSaleReturnPdf,
        allConfigData,
        isCallFetchDataApi,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isShowPaymentModel, setIsShowPaymentModel] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const navigate = useNavigate();
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onShowPaymentClick = () => {
        setIsShowPaymentModel(!isShowPaymentModel);
    };

    const onChange = (filter) => {
        fetchSalesReturn(filter, true);
    };

    const goToEdit = (item) => {
        const id = item.id;
        navigate("/app/user/sale-return/edit/" + id);
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onPdfClick = (id) => {
        downloadSaleReturnPdf(id);
    };

    const goToDetailScreen = (id) => {
        navigate("/app/user/sale-return/detail/" + id);
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
            grand_total: sale.attributes.grand_total,
            id: sale.id,
            currency: currencySymbol,
        }));

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map((row) => row.id);
        setSelectedIds(ids);
    };

    const handleDeleteMultiples = () => {
        setDeleteModel(!deleteModel);
        setIsDelete(selectedIds);
    };

    useEffect(() => {
        if (clearSelectedRows) {
            setClearSelectedRows(false);
        }
    }, [clearSelectedRows]);

    const clearSelectedDeleteItem = () => {
        setClearSelectedRows(true);
        setSelectedIds([]);
    };

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
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <ActionDropDownButton
                    item={row}
                    isPdfIcon={true}
                    onClickDeleteModel={onClickDeleteModel}
                    onPdfClick={onPdfClick}
                    title={getFormattedMessage("sale-return.title")}
                    isViewIcon={getPermission(
                        allConfigData?.permissions,
                        Permissions.VIEW_SALE_RETURN
                    )}
                    goToDetailScreen={goToDetailScreen}
                    onShowPaymentClick={onShowPaymentClick}
                    goToEditProduct={
                        getPermission(
                            allConfigData?.permissions,
                            Permissions.EDIT_SALE_RETURN
                        ) && goToEdit
                    }
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_SALE_RETURN
                    )}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("sales-return.title")} />
            <div className="sale_return_table">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    to="/app/user/sale-return/create"
                    isShowDateRangeField
                    onChange={onChange}
                    totalRows={totalRecord}
                    goToEdit={goToEdit}
                    isLoading={isLoading}
                    isShowFilterField
                    isStatus
                    isCallFetchDataApi={isCallFetchDataApi}
                    selectableRows={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_SALE_RETURN
                    )}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 1}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
            </div>
            <DeleteSaleReturn
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <ShowPayment
                onShowPaymentClick={onShowPaymentClick}
                isShowPaymentModel={isShowPaymentModel}
            />
            <NotDeletedItemModal
                show={notDeletedItemModal?.ids?.length > 0}
                setNotDeletedItemModal={setNotDeletedItemModal}
                data={notDeletedItemModal}
            />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        salesReturn,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = state;
    return {
        salesReturn,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchSalesReturn,
    downloadSaleReturnPdf,
})(SaleReturn);
