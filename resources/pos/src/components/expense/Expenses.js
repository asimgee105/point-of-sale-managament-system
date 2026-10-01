import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import moment from "moment";
import MasterLayout from "../MasterLayout";
import { useNavigate } from "react-router-dom";
import ReactDataTable from "../../shared/table/ReactDataTable";
import { fetchExpenses } from "../../store/action/expenseAction";
import DeleteExpense from "./DeleteExpense";
import TabTitle from "../../shared/tab-title/TabTitle";
import {
    currencySymbolHandling,
    getFormattedDate,
    getFormattedMessage,
    getPermission,
    placeholderText,
} from "../../shared/sharedMethod";
import ActionButton from "../../shared/action-buttons/ActionButton";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import NotDeletedItemModal from "../../shared/action-buttons/NotDeletedItemModal";
import { Permissions } from "../../constants";

const Expenses = (props) => {
    const {
        fetchExpenses,
        expenses,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = props;
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

    const onChange = (filter) => {
        fetchExpenses(filter, true);
    };

    const goToEditProduct = (item) => {
        navigate(`/app/user/expenses/edit/${item.id}`);
    };

    const currencySymbol =
        frontSetting &&
        frontSetting.value &&
        frontSetting.value.currency_symbol;

    const itemsValue =
        currencySymbol &&
        expenses.length >= 0 &&
        expenses.map((expense) => ({
            date: getFormattedDate(
                expense.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(expense.attributes.created_at).format("LT"),
            reference_code: expense.attributes.reference_code,
            title: expense.attributes.title,
            warehouse_name: expense.attributes.warehouse_name,
            username: expense.attributes.user_name
                ? expense.attributes.user_name
                : "-",
            expense_category_name: expense.attributes.expense_category_name,
            amount: expense.attributes.amount,
            details: expense.attributes.details,
            id: expense.id,
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
            name: getFormattedMessage("users.table.user.column.title"),
            selector: (row) => row.username,
            sortField: "username",
            sortable: false,
        },
        {
            name: getFormattedMessage("expense.input.title.label"),
            selector: (row) => row.title,
            sortField: "title",
            sortable: false,
        },
        {
            name: getFormattedMessage("warehouse.title"),
            selector: (row) => row.warehouse_name,
            sortField: "warehouse_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("expense-category.title"),
            selector: (row) => row.expense_category_name,
            sortField: "expense_category_name",
            sortable: false,
        },
        {
            name: getFormattedMessage("amount.title"),
            selector: (row) =>
                currencySymbolHandling(allConfigData, row.currency, row.amount),
            sortField: "amount",
            sortable: true,
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
        ...(getPermission(
            allConfigData?.permissions,
            Permissions.EDIT_EXPENSES
        ) ||
        getPermission(allConfigData?.permissions, Permissions.DELETE_EXPENSES)
            ? [
                  {
                      name: getFormattedMessage(
                          "react-data-table.action.column.label"
                      ),
                      right: true,
                      ignoreRowClick: true,
                      allowOverflow: true,
                      button: true,
                      cell: (row) => (
                          <ActionButton
                              item={row}
                              goToEditProduct={goToEditProduct}
                              isEditMode={getPermission(
                                  allConfigData?.permissions,
                                  Permissions.EDIT_EXPENSES
                              )}
                              onClickDeleteModel={onClickDeleteModel}
                              isDeleteMode={getPermission(
                                  allConfigData?.permissions,
                                  Permissions.DELETE_EXPENSES
                              )}
                          />
                      ),
                  },
              ]
            : []),
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("expenses.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                {...(getPermission(
                    allConfigData?.permissions,
                    Permissions.CREATE_EXPENSES
                ) && {
                    to: "/app/user/expenses/create",
                    buttonValue: getFormattedMessage("expense.create.title"),
                })}
                isCallFetchDataApi={isCallFetchDataApi}
                selectableRows={getPermission(
                    allConfigData?.permissions,
                    Permissions.DELETE_EXPENSES
                )}
                onSelectedRowsChange={handleSelectedRowsChange}
                isShowDeleteButton={selectedIds.length > 1}
                handleDeleteMultiples={handleDeleteMultiples}
                clearSelectedRows={clearSelectedRows}
            />
            <DeleteExpense
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
        expenses,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    } = state;
    return {
        expenses,
        totalRecord,
        isLoading,
        frontSetting,
        allConfigData,
        isCallFetchDataApi,
    };
};

export default connect(mapStateToProps, { fetchExpenses })(Expenses);
