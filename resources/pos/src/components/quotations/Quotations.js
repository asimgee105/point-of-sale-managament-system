import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchSales } from "../../store/action/salesAction";
import DeleteQuotation from "./DeleteQuotation";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionDropDownButton from "../../shared/action-buttons/ActionDropDownButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import { fetchQuotations } from "../../store/action/quotationAction";
import { quotationPdfAction } from "../../store/action/quotationPdfAction";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const Quotations = (props) => {
    const {
        totalRecord,
        isLoading,
        quotationPdfAction,
        frontSetting,
        isCallSaleApi,
        fetchQuotations,
        quotations,
        allConfigData,
        isCallFetchDataApi,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const navigate = useNavigate();

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onChange = (filter) => {
        fetchQuotations(filter, true);
    };

    //quotation edit function
    const goToEdit = (item) => {
        const id = item.id;
        navigate("/app/user/quotations/edit/" + id);
    };

    // delete quotation function
    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    //quotation sale create function
    const onCreateSaleClick = (item) => {
        const id = item.id;
        navigate("/app/user/quotations/Create_sale/" + id);
    };

    //quotation details function
    const goToDetailScreen = (ProductId) => {
        navigate("/app/user/quotations/detail/" + ProductId);
    };

    //onClick pdf function
    const onPdfClick = (id) => {
        quotationPdfAction(id);
    };

    const itemsValue =
        currencySymbol &&
        quotations.length >= 0 &&
        quotations.map((quotation) => ({
            date: getFormattedDate(
                quotation.attributes.created_at,
                allConfigData && allConfigData
            ),
            is_sale_created: quotation.attributes.is_sale_created,
            time: moment(quotation.attributes.created_at).format("LT"),
            reference_code: quotation.attributes.reference_code,
            customer_name: quotation.attributes.customer_name,
            warehouse_name: quotation.attributes.warehouse_name,
            status: quotation.attributes.status,
            grand_total: quotation.attributes.grand_total,
            paid_amount: quotation.attributes.paid_amount
                ? sale.attributes.paid_amount
                : (0.0).toFixed(2),
            id: quotation.id,
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
                        <span className="badge bg-light-warning">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.sent.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 2 && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
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
                    item={row}
                    goToEditProduct={
                        getPermission(
                            allConfigData?.permissions,
                            Permissions.EDIT_QUOTATIONS
                        ) && goToEdit
                    }
                    isPdfIcon={true}
                    onClickDeleteModel={onClickDeleteModel}
                    onPdfClick={onPdfClick}
                    title={getFormattedMessage("quotation.title")}
                    isCreatesSales={
                        getPermission(
                            allConfigData?.permissions,
                            Permissions.CREATE_SALES
                        ) ||
                        getPermission(
                            allConfigData?.permissions,
                            Permissions.EDIT_SALES
                        )
                    }
                    onCreateSaleClick={onCreateSaleClick}
                    isViewIcon={getPermission(
                        allConfigData?.permissions,
                        Permissions.VIEW_QUOTATIONS
                    )}
                    goToDetailScreen={goToDetailScreen}
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_QUOTATIONS
                    )}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("quotations.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                {...(getPermission(
                    allConfigData?.permissions,
                    Permissions.CREATE_QUOTATIONS
                ) && {
                    to: "/app/user/quotations/create",
                    buttonValue: getFormattedMessage("create-quotation.title"),
                })}
                isCallSaleApi={isCallSaleApi}
                isShowDateRangeField
                onChange={onChange}
                totalRows={totalRecord}
                goToEdit={goToEdit}
                isLoading={isLoading}
                isShowFilterField
                isQuotationStatus
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows={getPermission(
                    allConfigData?.permissions,
                    Permissions.DELETE_QUOTATIONS
                )}
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteQuotation
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
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
        sales,
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        quotations,
        allConfigData,
        isCallFetchDataApi,
    } = state;
    return {
        sales,
        totalRecord,
        isLoading,
        frontSetting,
        isCallSaleApi,
        quotations,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchSales,
    fetchQuotations,
    quotationPdfAction,
})(Quotations);
