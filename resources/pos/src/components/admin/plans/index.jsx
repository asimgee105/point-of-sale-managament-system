import moment from "moment";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";
import {
    getFormattedDate,
    getFormattedMessage,
    getFrequency,
    placeholderText,
} from "../../../shared/sharedMethod";
import TabTitle from "../../../shared/tab-title/TabTitle";
import ReactDataTable from "../../../shared/table/ReactDataTable";
import { fetchPlans, makeDefaultPlanRequest } from "../../../store/action/admin/plansAction";
import MasterLayout from "../../MasterLayout";
import DeletePlan from "./DeletePlan";
import NotDeletedItemModal from "../../../shared/action-buttons/NotDeletedItemModal";

const Plans = ({ fetchPlans, plans, totalRecord, isLoading, allConfigData, isCallFetchDataApi }) => {
    const [deleteModel, setDeleteModel] = useState(false);
    const [isDelete, setIsDelete] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [notDeletedItemModal, setNotDeletedItemModal] = useState({});
    const [clearSelectedRows, setClearSelectedRows] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onClickDeleteModel = (isDelete = null) => {
        setDeleteModel(!deleteModel);
        setIsDelete([isDelete?.id]);
    };

    const onChange = (filter) => {
        fetchPlans(filter, true);
    };

    const goToEditProduct = (item) => {
        const id = item.id;
        navigate(`/app/admin/plans/edit/${id}`);
    };

    const [localItemsValue, setLocalItemsValue] = useState([]);

    // useEffect(() => {
    //     if (plans.length >= 0) {
    //         const mappedPlans = plans.map((plan) => ({
    //             date: getFormattedDate(
    //                 plan.attributes.created_at,
    //                 allConfigData && allConfigData
    //             ),
    //             time: moment(plan.attributes.created_at).format("LT"),
    //             name: plan.attributes.name,
    //             price: plan.attributes.price,
    //             currency_symbol: plan.attributes.currency_symbol,
    //             frequency: getFrequency(plan.attributes.frequency),
    //             id: plan.id,
    //             is_default: plan.attributes.assign_while_register
    //         }));
    //         setLocalItemsValue(mappedPlans);
    //     }
    // }, [plans, allConfigData]);

    const itemsValue = plans.length >= 0 && plans.map((plan) => ({
        date: getFormattedDate(
            plan.attributes.created_at,
            allConfigData && allConfigData
        ),
        time: moment(plan.attributes.created_at).format("LT"),
        name: plan.attributes.name,
        price: plan.attributes.price,
        currency_symbol: plan.attributes.currency_symbol,
        frequency: getFrequency(plan.attributes.frequency),
        id: plan.id,
        is_default: plan.attributes.assign_while_register
    }));

    const handleDefaultPlan = (id) => {
        dispatch(makeDefaultPlanRequest(id));

        setLocalItemsValue((prevState) =>
            prevState.map((item) => ({
                ...item,
                is_default: item.id == id,
            }))
        );
    };

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

    const columns = [
        {
            name: getFormattedMessage("globally.input.name.label"),
            selector: (row) => row.name,
            sortField: "name",
            sortable: true,
            cell: (row) => {
                return (
                    <div>
                        <div>{row.name}</div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("price.title"),
            selector: (row) => row.price,
            sortField: "price",
            sortable: true,
            cell: (row) => {
                return (
                    <div>
                        <div>{row.currency_symbol}{row.price}</div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("frequency.title"),
            selector: (row) => row.frequency,
            sortField: "frequency",
            sortable: false,
            cell: (row) => {
                return (
                    <div>
                        <div>{getFormattedMessage(row.frequency)}</div>
                    </div>
                );
            },
        },
        {
            name: getFormattedMessage("default-plan.title"),
            selector: (row) => row.is_default,
            sortable: false,
            cell: row => {
                return <div className='d-flex align-items-center'>
                    {
                        row.is_default ? <span className="badge bg-light-success">
                            {getFormattedMessage(
                                "default-plan.title"
                            )}
                        </span> : <label className="form-check form-switch form-switch-sm">
                            <input type='checkbox' checked={row.is_default}
                                onChange={() => handleDefaultPlan(row.id)}
                                className='me-3 form-check-input cursor-pointer' />
                            <div className='control__indicator' />
                        </label>
                    }
                </div>
            }
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
            <TabTitle title={placeholderText("plans.title")} />
            <ReactDataTable
                buttonValue={getFormattedMessage('new.plan.title')}
                to='/app/admin/plans/create'
                columns={columns}
                items={itemsValue}
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
            <DeletePlan 
                onClickDeleteModel={onClickDeleteModel} 
                deleteModel={deleteModel} 
                onDelete={isDelete} 
                setNotDeletedItemModal={setNotDeletedItemModal} 
                setSelectedIds={setSelectedIds}
                setClearSelectedRows={setClearSelectedRows}
            />
            <NotDeletedItemModal show={notDeletedItemModal?.ids?.length > 0} setNotDeletedItemModal={setNotDeletedItemModal} data={notDeletedItemModal} />
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { plans, totalRecord, isLoading, allConfigData, isCallFetchDataApi } = state;
    return { plans, totalRecord, isLoading, allConfigData, isCallFetchDataApi };
};

export default connect(mapStateToProps, { fetchPlans })(Plans);
