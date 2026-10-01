import React, { useEffect, useState } from "react";
import moment from "moment";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import TabTitle from "../../shared/tab-title/TabTitle";
import ReactDataTable from "../../shared/table/ReactDataTable";
import DeleteSaleAdjustMents from "./DeleteSaleAdjustMents";
import {
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import { fetchAdjustments } from "../../store/action/adjustMentAction";
import ActionButton from "../../shared/action-buttons/ActionButton";
import AdjustMentDetail from "./AdjustMentDetail";
import { fetchAllWarehouses } from "../../store/action/warehouseAction";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const Adjustments = (props) => {
    const {
        isCallFetchDataApi,
        adjustments,
        fetchAdjustments,
        totalRecord,
        isLoading,
        frontSetting,
        warehouses,
        fetchAllWarehouses,
        isCallSaleApi,
        allConfigData,
    } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [isDetails, setIsDetails] = useState(null);
    const [lgShow, setLgShow] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAllWarehouses();
    }, []);

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const onChange = (filter) => {
        fetchAdjustments(filter, true);
    };

    //adjustments edit function
    const goToEdit = (item) => {
        const id = item.id;
        navigate("/app/user/adjustments/" + id);
    };

    // delete adjustments function
    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    //adjustments details function
    const onClickDetailsModel = (isDetails = null) => {
        setLgShow(true);
        setIsDetails(isDetails);
    };

    const itemsValue =
        currencySymbol &&
        adjustments.length >= 0 &&
        adjustments.map((item) => ({
            reference_code: item.attributes.reference_code,
            total_products: item.attributes.total_products,
            date: getFormattedDate(
                item.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(item.attributes.created_at).format("LT"),
            warehouse_name: item.attributes.warehouse_name,
            id: item.id,
            currency: currencySymbol,
        }));

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.map(row => row.id);
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
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "dashboard.recentSales.total-product.label"
            ),
            sortField: "total_products",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-danger">
                        <span>{row.total_products}</span>
                    </span>
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
                    isViewIcon={getPermission(allConfigData?.permissions, Permissions.VIEW_ADJUSTMENTS)}
                    goToDetailScreen={onClickDetailsModel}
                    item={row}
                    goToEditProduct={goToEdit}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_ADJUSTMENTS)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_ADJUSTMENTS)}
                />
            ),
        },
    ];

    const array = warehouses;
    const newFirstElement = {
        attributes: { name: getFormattedMessage("unit.filter.all.label") },
        id: "0",
    };
    const newArray = [newFirstElement].concat(array);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("adjustments.title")} />
            {newArray.length > 1 && (
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    {...(getPermission(allConfigData?.permissions, Permissions.CREATE_ADJUSTMENTS) &&
                    {
                        to: "/app/user/adjustments/create",
                        buttonValue: getFormattedMessage("adjustments.create.title")
                    }
                    )}
                    isCallSaleApi={isCallSaleApi}
                    onChange={onChange}
                    totalRows={totalRecord}
                    goToEdit={goToEdit}
                    isShowFilterField
                    isLoading={isLoading}
                    isWarehouseType={true}
                    warehouseOptions={newArray}
                    warehouses={warehouses}
                    isCallFetchDataApi={isCallFetchDataApi}
                    selectableRows={getPermission(allConfigData?.permissions, Permissions.DELETE_ADJUSTMENTS)}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 1}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
            )}
            <DeleteSaleAdjustMents
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <AdjustMentDetail
                onClickDetailsModel={onClickDetailsModel}
                onDetails={isDetails}
                setLgShow={setLgShow}
                lgShow={lgShow}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const {
        adjustments,
        totalRecord,
        isLoading,
        frontSetting,
        warehouses,
        isCallSaleApi,
        allConfigData,
        isCallFetchDataApi
    } = state;
    return {
        adjustments,
        totalRecord,
        isLoading,
        frontSetting,
        warehouses,
        isCallSaleApi,
        allConfigData,
        isCallFetchDataApi
    };
};

export default connect(mapStateToProps, {
    fetchAdjustments,
    fetchAllWarehouses,
})(Adjustments);
