import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { getFrequency, placeholderText, getFormattedMessage, formatDate } from '../../shared/sharedMethod'; // Ensure getFormattedMessage is imported
import TabTitle from '../../shared/tab-title/TabTitle';
import ReactDataTable from '../../shared/table/ReactDataTable';
import { fetchCurrentUserPlan, getUserSubscriptions } from '../../store/action/plansAction';
import MasterLayout from '../MasterLayout';
import { PLAN_STATUS, toastType } from '../../constants';
import { addToast } from '../../store/action/toastAction';
import { useNavigate } from 'react-router';

const ManageSubscription = (props) => {
    const { userPlans, fetchCurrentUserPlan, getUserSubscriptions, totalRecord } = props;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isRequestPending, setIsRequestPending] = useState(false);

    useEffect(() => {
        fetchCurrentUserPlan();
        getUserSubscriptions();
    }, []);

    useEffect(() => {
        if (userPlans?.subscriptions?.length > 0) {
            const hasPending = userPlans.subscriptions.some(subscription => subscription?.attributes?.status == PLAN_STATUS.PENDING);
            setIsRequestPending(hasPending);
        }
    }, [userPlans?.subscriptions]);

    const subscriptionValue = userPlans?.subscriptions?.length > 0 && userPlans?.subscriptions?.map((subscription) => {
        return {
            plan: subscription?.attributes?.plan_name,
            amount: `${subscription?.attributes?.currency_symbol} ${subscription?.attributes?.plan_amount}`,
            start_date: formatDate(subscription?.attributes?.start_date),
            end_date: formatDate(subscription?.attributes?.end_date),
            status: subscription?.attributes?.status,
            id: subscription?.id,
        };
    })

    const onChange = (filter) => {
        getUserSubscriptions(filter, true);
    };

    const columns = [
        {
            name: getFormattedMessage(
                "plan-name.title"
            ),
            selector: (row) => row.plan,
            sortField: "plan",
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
                "subscribed-date.title"
            ),
            selector: (row) => row.start_date,
            sortField: "start_date",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "expired-date.title"
            ),
            selector: (row) => row.end_date,
            sortField: "end_date",
            sortable: false,
        },
        {
            name: getFormattedMessage(
                "globally.detail.status"
            ),
            selector: (row) => row.status,
            sortField: "status",
            sortable: false,
            cell: (row) => {
                return (
                    (row.status == PLAN_STATUS.ACTIVE && (
                        <span className="badge bg-light-success">
                            <span>
                                {getFormattedMessage(
                                    "active.status.lable"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == PLAN_STATUS.PENDING && (
                        <span className="badge bg-light-info">
                            <span>
                                {getFormattedMessage(
                                    "status.filter.pending.label"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == PLAN_STATUS.REJECTED && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "rejected.title"
                                )}
                            </span>
                        </span>
                    )) ||
                    (row.status == PLAN_STATUS.INACTIVE && (
                        <span className="badge bg-light-danger">
                            <span>
                                {getFormattedMessage(
                                    "in-active.status.lable"
                                )}
                            </span>
                        </span>
                    ))
                );
            },
        }
    ];

    const handleUpgradePlan = () => {
        if (isRequestPending) {
            dispatch(addToast({
                text: getFormattedMessage('manage-subscription.pending-subscription'),
                type: toastType.ERROR
            }))
            return;
        }

        navigate("/app/user/manage-subscription/upgrade")
    }

    return (
        <MasterLayout>
            <TabTitle title={placeholderText('header.profile-menu.manage-subscriptions.label')} />
            <div className='card'>
                <div className='card-body'>
                    <div className="row">
                        <div className="col-lg-7">
                            <h2>{userPlans?.currentPlan?.plan?.name}</h2>
                            <h5>{getFormattedMessage("number.of.stores.title")}: {userPlans?.currentPlan?.plan?.no_of_stores}</h5>
                            <h5 className="mb-12">
                                <span className="text-success">
                                    {getFormattedMessage("active-till.title")} {formatDate(userPlans?.currentPlan?.end_date)}
                                </span>
                            </h5>
                            <div className="fs-5 mb-2">
                                <div className="text-gray-800 fw-bolder me-1">
                                    {userPlans?.currentPlan?.currency_symbol}{userPlans?.currentPlan?.plan_amount} / {getFrequency(userPlans?.currentPlan?.plan_frequency) && getFormattedMessage(getFrequency(userPlans?.currentPlan?.plan_frequency))}
                                </div>
                            </div>
                            <div className="fs-6 text-gray-600 fw-bold mb-2">
                                {getFormattedMessage("subscribed-date.title")}: {formatDate(userPlans?.currentPlan?.start_date)}
                            </div>
                        </div>
                        <div className="col-lg-5 mt-lg-0 mt-5">
                            <div className="d-flex justify-content-end">
                                <button className="btn btn-primary" onClick={handleUpgradePlan}>
                                    {getFormattedMessage("upgrade-plan.title")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mt-8'>
                <ReactDataTable
                    columns={columns}
                    items={subscriptionValue}
                    isLoading={false}
                    totalRows={totalRecord}
                    onChange={onChange}
                />
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { userPlans, totalRecord } = state;
    return { userPlans, totalRecord };
};

export default connect(mapStateToProps, { fetchCurrentUserPlan, getUserSubscriptions })(ManageSubscription);
