import moment from "moment";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    getAvatarName,
    getFormattedDate,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import TabTitle from "../../../shared/tab-title/TabTitle";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { changeUserStatus, fetchAdminUsers, verifyUserEmail } from "../../../store/action/admin/adminUsersAction";
import MasterLayout from "../../MasterLayout";
import DeleteUser from "./DeleteUser";
import NotDeletedItemModal from "../../../shared/action-buttons/NotDeletedItemModal";
import ChangeUserPassword from "../../auth/change-password/ChangeUserPassword";
import { ROLES } from "../../../constants";

const Users = ({ fetchAdminUsers, adminUsers, totalRecord, isLoading, allConfigData, isCallFetchDataApi }) => {
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [isUserId, setIsUserId] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchAdminUsers(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        navigate(`/app/admin/users/edit/${id}`);
    };
    const [localItemsValue, setLocalItemsValue] = useState([]);

    useEffect(() => {
        if (adminUsers.length >= 0) {
            const mappedUsers = adminUsers.map((user) => ({
                date: getFormattedDate(
                    user.attributes.created_at,
                    allConfigData && allConfigData
                ),
                time: moment(user.attributes.created_at).format("LT"),
                name: user.attributes.name,
                email: user.attributes.email,
                phone: user.attributes.phone,
                id: user.id,
                image: user.attributes.image,
                first_name: user.attributes.first_name,
                last_name: user.attributes.last_name,
                email_verified: user.attributes.email_verified,
                status: user.attributes.status,
                plan: user.attributes.plan,
            }));
            setLocalItemsValue(mappedUsers);
        }
    }, [adminUsers, allConfigData]);

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

    const handleVerifyEmail = (id) => {
        dispatch(verifyUserEmail(id));

        setLocalItemsValue((prevState) =>
            prevState.map((item) =>
                item.id === id ? { ...item, email_verified: true } : item
            )
        );
    };
    const handleStatusChange = (id, status) => {
        dispatch(changeUserStatus(id));

        setLocalItemsValue((prevState) =>
            prevState.map((item) =>
                item.id === id ? { ...item, status: status } : item
            )
        );
    };

    const clearSelectedDeleteItem = () => {
        setClearSelectedRows(true);
        setSelectedIds([]);
    };

    const goToChangePassword = (item) => {
        setIsChangePassword(true);
        setIsUserId(item);
    }

    const columns = [
        {
            name: getFormattedMessage('users.table.user.column.title'),
            selector: row => row.first_name,
            sortField: 'first_name',
            sortable: true,
            cell: row => {
                const imageUrl = row.image ? row.image : null;
                const lastName = row.last_name ? row.last_name : '';
                return <div className='d-flex align-items-center'>
                    <div className='me-2'>
                        <Link to={`/app/admin/users/detail/${row.id}`}>
                            {imageUrl ?
                                <img src={imageUrl} height='50' width='50' alt='User Image'
                                    className='image image-circle image-mini' /> :
                                <span className='custom-user-avatar fs-5'>
                                    {getAvatarName(row.first_name + ' ' + row.last_name)}
                                </span>
                            }
                        </Link>
                    </div>
                    <div className='d-flex flex-column'>
                        <Link to={`/app/admin/users/detail/${row.id}`} className='text-decoration-none'>{row.first_name + ' ' + lastName}</Link>
                        <span>{row.email}</span>
                    </div>
                </div>
            }
        },
        {
            name: getFormattedMessage("globally.input.phone-number.label"),
            selector: (row) => row.phone,
            sortField: "phone",
            sortable: true,
        },
        {
            name: getFormattedMessage("email-verified.title"),
            selector: (row) => row.email_verified,
            sortable: false,
            cell: row => {
                return <div className='d-flex align-items-center'>
                    <label className="form-check form-switch form-switch-sm">
                        <input type='checkbox' checked={row.email_verified}
                            onChange={() => handleVerifyEmail(row.id)}
                            disabled={row.email_verified}
                            className='me-3 form-check-input cursor-pointer' />
                        <div className='control__indicator' />
                    </label>
                </div>
            }
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status,
            sortable: false,
            cell: row => {
                return <div className='d-flex align-items-center'>
                    <label className="form-check form-switch form-switch-sm">
                        <input type='checkbox' checked={row.status}
                            onChange={(e) => handleStatusChange(row.id, e.target.checked)}
                            className='me-3 form-check-input cursor-pointer' />
                        <div className='control__indicator' />
                    </label>
                </div>
            }
        },
        {
            name: getFormattedMessage(
                "plan.title"
            ),
            selector: (row) => row.plan,
            sortField: "plan",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.react-table.column.created-date.label"
            ),
            selector: (row) => row.date,
            sortField: "created_at",
            sortable: true,
            cell: (row) => {
                return (
                    <span className="badge bg-light-info">
                        <div className="mb-1">{row.time}</div>
                        {row.date}
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
                    item={row}
                    isPasswordShow={true}
                    goToChangePassword={goToChangePassword}
                    goToEditProduct={goToEditProduct}
                    isEditMode={true}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("users.title")} />
            <ReactDataTable
                buttonValue={getFormattedMessage('user.create.title')}
                to='/app/admin/users/create'
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                selectableRows
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <DeleteUser
                onClickDeleteModel={onClickDeleteModel}
                deleteModel={deleteModel}
                onDelete={isDelete}
                setNotDeletedItemModal={setNotDeletedItemModal}
                clearSelectedDeleteItem={clearSelectedDeleteItem}
                // isShowFilterField
                // isPlanType
                // isPlanNameFilter
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />

            {isChangePassword && (
                <ChangeUserPassword
                    handleClose={() => setIsChangePassword(false)}
                    show={isChangePassword}
                    userDetails={isUserId}
                    role={ROLES.SUPER_ADMIN}
                />
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { adminUsers, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = state;
    return { adminUsers, totalRecord, isLoading, allConfigData, isCallFetchDataApi };
};

export default connect(mapStateToProps, { fetchAdminUsers })(Users);
