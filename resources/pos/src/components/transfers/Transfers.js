import React, { useEffect, useState } from "react";
import MasterLayout from "../MasterLayout";
import { connect } from "react-redux";
import moment from "moment";
import ReactDataTable from "../../shared/table/ReactDataTable";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchTransfers } from "../../store/action/transfersAction";
import {
    currencySymbolHandling,
    getFormattedDate,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import { getFormattedMessage } from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import DeleteTransfer from "./DeleteTransfer";
import TransferDetails from "./TransferDetails";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const Transfers = (props) => {
    const {
        fetchTransfers,
        tansfers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isDetails, setIsDetails] = useState(null);
    const [lgShow, setLgShow] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const navigate = useNavigate();
    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    //onClick edit function
    const goToEdit = (item) => {
        const id = item.id;
        navigate("/app/user/transfers/" + id);
    };

    const onChange = (filter) => {
        fetchTransfers(filter, true);
    };

    const onClickDetailsModel = (isDetails = null) => {
        setLgShow(true);
        setIsDetails(isDetails);
    };

    const itemsValue =
        currencySymbol &&
        tansfers.length >= 0 &&
        tansfers.map((tansfer) => {
            return {
                date: getFormattedDate(
                    tansfer.attributes.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(tansfer.attributes.created_at).format("LT"),
                reference_code: tansfer.attributes.reference_code,
                from_warehouse_id: tansfer.attributes.from_warehouse.name,
                to_warehouse_id: tansfer.attributes.to_warehouse.name,
                items: tansfer.attributes.transfer_items.length,
                grand_total: tansfer.attributes.grand_total,
                status: tansfer.attributes.status,
                id: tansfer.id,
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
            name: getFormattedMessage("transfer.from-warehouse.title"),
            selector: (row) => row.from_warehouse_id,
            sortField: "from_warehouse_id",
            sortable: false,
        },
        {
            name: getFormattedMessage("transfer.to-warehouse.title"),
            selector: (row) => row.to_warehouse_id,
            sortField: "to_warehouse_id",
            sortable: false,
        },
        {
            name: getFormattedMessage("product-items.label"),
            selector: (row) => row.items,
            sortField: "items",
            sortable: false,
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
            name: getFormattedMessage("globally.detail.status"),
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status == 1 && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.complated.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 2 && (
                        <span className="badge bg-light-primary">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.sent.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == 3 && (
                        <span className="badge bg-light-warning">
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
                <ActionButton
                    isViewIcon={getPermission(
                        allConfigData?.permissions,
                        Permissions.VIEW_TRANSFERS
                    )}
                    goToDetailScreen={onClickDetailsModel}
                    item={row}
                    goToEditProduct={goToEdit}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.DELETE_TRANSFERS
                    )}
                    isEditMode={getPermission(
                        allConfigData?.permissions,
                        Permissions.EDIT_TRANSFERS
                    )}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("transfers.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(
                    allConfigData?.permissions,
                    Permissions.CREATE_TRANSFERS
                ) && {
                    to: "/app/user/transfers/create",
                    buttonValue: getFormattedMessage("transfer.create.title"),
                })}
                isShowFilterField
                isTransferStatus
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows={getPermission(
                    allConfigData?.permissions,
                    Permissions.DELETE_TRANSFERS
                )}
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteTransfer
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            {lgShow && (
                <TransferDetails
                    onClickDetailsModel={onClickDetailsModel}
                    onDetails={isDetails}
                    setLgShow={setLgShow}
                    lgShow={lgShow}
                />
            )}
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
        tansfers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = state;
    return {
        tansfers,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, {
    fetchTransfers,
})(Transfers);
