import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MasterLayout from "../MasterLayout";
import ReactDataTable from "../../shared/table/ReactDataTable";
import ModalAction from "../../shared/action-buttons/ActionButton";
import { fetchRoles } from "../../store/action/roleAction";
import DeleteRole from "./DeleteRole";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";
import { useNavigate } from "react-router";

const Role = (props) => {
    const { roles, fetchRoles, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = props;
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const navigate = useNavigate();
    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const itemsValue =
        roles.length >= 0 &&
        roles.map((role) => ({
            date: getFormattedDate(
                role.attributes.created_at,
                allConfigData && allConfigData
            ),
            name: role.attributes.name,
            id: role.id,
            is_default: role.attributes.is_default
        }));

    const onChange = (filter) => {
        fetchRoles(filter, true);
    };

    const goToEdit = (item) => {
        const id = item.id;
        navigate("/app/user/roles/edit/" + id);
    };

    const handleSelectedRowsChange = ({ selectedRows }) => {
        const ids = selectedRows.filter(row => row.name !== "admin").map(row => row.id);
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
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            sortable: true,
            sortField: "name",
        },
        {
            name: getFormattedMessage("react-data-table.date.column.label"),
            selector: (row) => row.date,
            sortField: "date",
            sortable: false,
        },
        ...(getPermission(allConfigData?.permissions, Permissions.EDIT_ROLES) ||
        getPermission(allConfigData?.permissions, Permissions.DELETE_ROLES) ? [{
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            cell: (row) =>
            {
                if (row.is_default) return null;
                return <ModalAction
                    item={row}
                    goToEditProduct={goToEdit}
                    isEditMode={getPermission(allConfigData?.permissions, Permissions.EDIT_ROLES)}
                    onClickDeleteModel={onClickDeleteModel}
                    isDeleteMode={getPermission(allConfigData?.permissions, Permissions.DELETE_ROLES)}
                />}
        }] : [])
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("roles.title")} />
            <div className="role_table">
                <ReactDataTable
                    columns={columns}
                    items={itemsValue}
                    onChange={onChange}
                    {...(getPermission(allConfigData?.permissions, Permissions.CREATE_ROLES) &&
                    {
                        to: "/app/user/roles/create",
                        buttonValue: getFormattedMessage("role.create.title")
                    }
                    )}
                    totalRows={totalRecord}
                    isLoading={isLoading}
                    isCallFetchDataApi={isCallFetchDataApi}
                    // selectableRows={getPermission(allConfigData?.permissions, Permissions.DELETE_ROLES)}
                    onSelectedRowsChange={handleSelectedRowsChange}
                    isShowDeleteButton={selectedIds.length > 1}
                    handleDeleteMultiples={handleDeleteMultiples}
                    clearSelectedRows={clearSelectedRows}
                />
            </div>
            <DeleteRole
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { roles, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = state;
    return { roles, totalRecord, isLoading, allConfigData, isCallFetchDataApi };
};
export default connect(mapStateToProps, { fetchRoles })(Role);
