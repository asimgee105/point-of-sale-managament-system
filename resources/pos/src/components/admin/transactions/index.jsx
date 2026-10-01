import React from 'react'
import moment from 'moment';
import { connect } from 'react-redux';
import MasterLayout from '../../MasterLayout'
import TopProgressBar from '../../../shared/components/loaders/TopProgressBar';
import { getFormattedDate, getFormattedMessage, getPaymentMethodName, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { fetchTransaction } from '../../../store/action/admin/transactionAction';
import ReactDataTable from '../../../shared/table/ReactDataTable';
import { PAYMENT_STATUS } from '../../../constants';

const Transactions = ({ fetchTransaction, transactions, totalRecord, isLoading, allConfigData }) => {

    const onChange = (filter) => {
        fetchTransaction(filter, true);
    };

    const itemsValue =
        transactions.length >= 0 &&
        transactions.map((transaction) => ({
            date: getFormattedDate(
                transaction.attributes.created_at,
                allConfigData && allConfigData
            ),
            time: moment(transaction.attributes.created_at).format("LT"),
            id: transaction.id,
            amount: `${transaction?.attributes?.currency} ${transaction.attributes.amount}`,
            user_name: transaction.attributes.user_name,
            payment_type: getFormattedMessage(getPaymentMethodName(transaction.attributes.type)),
            payment_status: transaction.attributes.status,
        }));

    const columns = [
        {
            name: getFormattedMessage(
                "user-name.title"
            ),
            selector: (row) => row.user_name,
            sortField: "user_name",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "amount.title"
            ),
            selector: (row) => row.amount,
            sortField: "amount",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "select.payment-type.label"
            ),
            selector: (row) => row.payment_type,
            sortField: "payment_type",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.detail.payment.status"
            ),
            selector: (row) => row.payment_status,
            sortField: "payment_status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.payment_status == PAYMENT_STATUS.SUCCESSFUL && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "toast.successful.title"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.payment_status == PAYMENT_STATUS.FAILED && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "failed.status.lable"
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
        }
    ];

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("transactions.title")} />
            <ReactDataTable
                columns={columns}
                items={itemsValue}
                onChange={onChange}
                isLoading={isLoading}
                totalRows={totalRecord}
                isShowFilterField
                isPlanPaymentType
            />
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { transactions, totalRecord, isLoading, allConfigData } = state;
    return { transactions, totalRecord, isLoading, allConfigData };
};

export default connect(mapStateToProps, { fetchTransaction })(Transactions);
