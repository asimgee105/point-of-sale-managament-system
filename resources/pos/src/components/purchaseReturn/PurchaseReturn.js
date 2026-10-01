import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchPurchasesReturn } from "../../store/action/purchaseReturnAction";
import DeletePurchaseReturn from "./DeletePurchaseReturn";
import {
    currencySymbolHandling,
    getFormattedDate,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import { purchaseReturnPdfAction } from "../../store/action/purchaseReturnPdfAction";
import ShowPayment from "../../shared/showPayment/ShowPayment";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const PurchaseReturn = (props) => {
    const {
        fetchPurchasesReturn,
        purchaseReturn,
        totalRecord,
        isLoading,
        purchaseReturnPdfAction,
        frontSetting,
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

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchPurchasesReturn(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        navigate("/app/user/purchase-return/edit/" + id);
    };

    const goToPurchaseReturn = (ProductId) => {
        navigate("/app/user/purchase-return/detail/" + ProductId);
    };

    //onClick pdf function
    const onPurchaseReturnPdf = (id) => {
        purchaseReturnPdfAction(id);
    };

    const onShowPaymentClick = () => {
        setIsShowPaymentModel(!isShowPaymentModel);
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        purchaseReturn.length >= 0 &&
        purchaseReturn.map((purchase) => {
            return {
                reference_code: purchase.attributes.reference_code,
                supplier: purchase.attributes.supplier_name,
                warehouse: purchase.attributes.warehouse_name,
                status: purchase.attributes.status,
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
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse,
            sortField: "warehouse",
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
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) => (
                <ActionDropDownButton
                    isViewIcon={getPermission(
                        allConfigData?.permissions,
                        Permissions.VIEW_PURCHASE_RETURN
                    )}
                    goToDetailScreen={goToPurchaseReturn}
                    item={row}
                    onClickDeleteModel={onClickDeleteModel}
                    isPdfIcon={true}
                    goToEditProduct={
                        getPermission(
                            allConfigData?.permissions,
                            Permissions.EDIT_PURCHASE_RETURN
                        ) && goToEditProduct
                    }
                    title={getFormattedMessage("purchases.return.title")}
                    onPdfClick={onPurchaseReturnPdf}
                    onShowPaymentClick={onShowPaymentClick}
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_PURCHASE_RETURN
                    )}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("purchases.return.title")} />
            <div className="purchases_return_table">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    isLoading={isLoading}
                    {...(getPermission(
                        allConfigData?.permissions,
                        Permissions.CREATE_PURCHASE_RETURN
                    ) && {
                        to: "/app/user/purchase-return/create",
                        buttonValue: getFormattedMessage(
                            "purchase.return.create.title"
                        ),
                    })}
                    totalRows={totalRecord}
                    isShowDateRangeField
                    isShowFilterField
                    isStatus
                    isCallFetchDataApi={isCallFetchDataApi}
                    selectableRows={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_PURCHASE_RETURN
                    )}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 1}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
            </div>
            <DeletePurchaseReturn
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
        purchaseReturn,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = state;
    return {
        purchaseReturn,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchPurchasesReturn,
    purchaseReturnPdfAction,
})(PurchaseReturn);
