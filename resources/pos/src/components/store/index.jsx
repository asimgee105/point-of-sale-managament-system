import React, { useEffect, useState } from 'react'
import MasterLayout from '../MasterLayout'
import TopProgressBar from '../../shared/components/loaders/TopProgressBar'
import TabTitle from '../../shared/tab-title/TabTitle'
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod'
import ReactDataTable from '../../shared/table/ReactDataTable'
import AddStoreButton from './AddStoreButton'
import ActionButton from '../../shared/action-buttons/ActionButton'
import { useDispatch, useSelector } from 'react-redux'
import { changeStoreStatus, fetchStore } from '../../store/action/storeAction'
import StoreForm from './StoreForm'
import DeleteStore from './DeleteStore'

const Store = () => {
    const dispatch = useDispatch();
    const { stores, allConfigData, isLoading } = useSelector(state => state);
    const isCallFetchDataApi = useSelector((state) => state.isCallFetchDataApi);
    const [deleteModel, setDeleteModel] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [editData, setEditData] = useState();
    const [localItemsValue, setLocalItemsValue] = useState([]);

    useEffect(() => {
        if (stores.length >= 0) {
            const mappedStore = stores.map((item) => ({
                name: item?.attributes?.name,
                status: parseInt(item?.attributes?.status) ? 1 : 0,
                active: item?.attributes?.active,
                users: item?.attributes?.users,
                id: item?.id,
            }));
            setLocalItemsValue(mappedStore);
        }
    }, [stores, allConfigData]);

    const onChange = (filter) => {
        dispatch(fetchStore());
    };

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete(isDelete);
    };

    const goToEditProduct = (data) => {
        setEditData(data);
        setShowEditModal(true)
    };

    const handleStatusChange = async (id, status) => {
        if (!id) return;

        const result = await dispatch(changeStoreStatus(id));

        if (result.success) {
            // Only update local state if API succeeded
            setLocalItemsValue((prevState) =>
                prevState.map((item) =>
                    item.id == id ? { ...item, status: parseInt(status) ? 1 : 0 } : item
                )
            );
        }
        // else do nothing: toggle will remain visually unchanged
    };


    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row?.name,
            className: "",
            sortField: "name",
            sortable: false,
        },
        {
            name: getFormattedMessage("globally.detail.status"),
            selector: (row) => row.status,
            sortable: false,
            cell: (row) => {
                return (
                    <div className="d-flex align-items-center">
                        <label className="form-check form-switch form-switch-sm">
                            <input
                                type="checkbox"
                                checked={row.status}
                                disabled={row.active} // assuming 'active' means it can't be disabled
                                onChange={(e) =>
                                    handleStatusChange(row.id, e.target.checked)
                                }
                                className="me-3 form-check-input cursor-pointer"
                            />
                            <div className="control__indicator" />
                        </label>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("users.title"),
            selector: (row) => row?.users,
            className: "",
            sortField: "users",
            sortable: false,
            cell: (row) => {
                return (
                    <span className="badge bg-light-primary">
                        <span>{row?.users}</span>
                    </span>
                )
            }
        },
        {
            name: getFormattedMessage("react-data-table.action.column.label"),
            right: true,
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: "120px",
            cell: (row) => (
                <ActionButton
                    item={row}
                    goToEditProduct={() => goToEditProduct(row)}
                    isEditMode={true}
                    onClickDeleteModel={onClickDeleteModel}
                />
            ),
        },
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("store.title")} />
            <ReactDataTable
                columns={columns}
                items={localItemsValue}
                onChange={onChange}
                isLoading={isLoading}
                pagination={false}
                isShowSearch
                AddButton={stores.length < allConfigData?.no_of_stores ? <AddStoreButton /> : null}
                isCallFetchDataApi={isCallFetchDataApi}
            />
            <StoreForm show={showEditModal} isEdit={true} data={editData} handleClose={() => setShowEditModal(false)} title={placeholderText("edit.store.title")} />
            <DeleteStore onClickDeleteModel={onClickDeleteModel} deleteModel={deleteModel} onDelete={isDelete} />
        </MasterLayout>
    )
}

export default Store
