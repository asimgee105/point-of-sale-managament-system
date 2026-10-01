import React, { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap-v5';
import { connect } from 'react-redux';
import { FREQUENCY_TYPE } from '../../../constants';
import TopProgressBar from '../../../shared/components/loaders/TopProgressBar';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import TabTitle from '../../../shared/tab-title/TabTitle';
import { fetchCurrentUserPlan, fetchPlans } from '../../../store/action/plansAction';
import MasterLayout from '../../MasterLayout';
import PlanTab from './PlanTab';

const UpgradePlan = (props) => {
    const { userPlans, fetchPlans, fetchCurrentUserPlan, allConfigData } = props;
    const [key, setKey] = useState('Weekly');

    useEffect(() => {
        fetchPlans();
        fetchCurrentUserPlan();
    }, [])

    return (
        <>
            <MasterLayout>
                <TopProgressBar />
                <TabTitle title={placeholderText('upgrade-plan.title')} />
                <div className='card'>
                    <div className='card-body'>
                        {allConfigData?.is_expired &&
                            <div className='fs-2 text-center text-danger'>
                                {getFormattedMessage("subscription.expired.message.title")}
                            </div>
                        }
                        <div>
                            <Tabs defaultActiveKey='Weekly' variant="pills" id='uncontrolled-tab-example' onSelect={(k) => setKey(k)}
                                className='mt-7 mb-5 justify-content-center'>
                                <Tab eventKey='Weekly' title={getFormattedMessage('weekly.title')}
                                    tabClassName='position-relative mb-3'>
                                    <div className='w-100 mx-auto'>
                                        {key === 'Weekly' && <PlanTab plans={userPlans?.plans} activePlan={userPlans?.currentPlan && userPlans?.currentPlan?.plan_id} isDefault={userPlans && userPlans.user_has_plan} frequencyType={FREQUENCY_TYPE.WEEKLY}/>}
                                    </div>
                                </Tab>
                                <Tab eventKey='Monthly' title={getFormattedMessage('monthly.title')}
                                    tabClassName='position-relative mb-3'>
                                    <div className='w-100 mx-auto'>
                                    {key === 'Monthly' && <PlanTab plans={userPlans?.plans} activePlan={userPlans?.currentPlan && userPlans?.currentPlan?.plan_id} isDefault={userPlans && userPlans.user_has_plan} frequencyType={FREQUENCY_TYPE.MONTHLY} />}
                                    </div>
                                </Tab>
                                <Tab eventKey='Yearly' title={getFormattedMessage("yearly.title")}
                                    tabClassName='position-relative mb-3'>
                                    <div className='w-100 mx-auto'>
                                    {key === 'Yearly' && <PlanTab plans={userPlans?.plans} activePlan={userPlans?.currentPlan && userPlans?.currentPlan?.plan_id} isDefault={userPlans && userPlans.user_has_plan} frequencyType={FREQUENCY_TYPE.YEARLY} />}
                                    </div>
                                </Tab>
                                <Tab eventKey='Unlimited' title={getFormattedMessage("unlimited.title")}
                                    tabClassName='position-relative mb-3'>
                                    <div className='w-100 mx-auto'>
                                    {key === 'Unlimited' && <PlanTab plans={userPlans?.plans} activePlan={userPlans?.currentPlan && userPlans?.currentPlan?.plan_id} isDefault={userPlans && userPlans.user_has_plan} frequencyType={FREQUENCY_TYPE.UNLIMITED} />}
                                    </div>
                                </Tab>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </MasterLayout>
        </>
    )
}

const mapStateToProps = (state) => {
    const { userPlans, totalRecord, isLoading, allConfigData } = state;
    return { userPlans, totalRecord, isLoading, allConfigData }
};
export default connect(mapStateToProps, { fetchPlans, fetchCurrentUserPlan })(UpgradePlan);
