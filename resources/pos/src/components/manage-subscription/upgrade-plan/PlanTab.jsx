import React from 'react';
import { Link } from 'react-router-dom';
import { formatAmount, getFormattedMessage } from '../../../shared/sharedMethod';
import { planFeatures } from '../../../constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';

const PlanTab = (props) => {
    const { plans, frequencyType, activePlan } = props;
    const { allConfigData } = useSelector(state => state);
    // Filter plans based on the frequencyType
    const filteredPlans = plans?.filter(plan => plan?.attributes?.frequency == frequencyType);

    const getFeatureStatus = (plan, featureKey) => {
        return plan?.attributes?.features?.[featureKey] == 1 ? true : false;
    };

    return (
        <div className="row justify-content-center align-items-stretch">
            {filteredPlans?.length > 0 ? filteredPlans?.map((plan) => (
                <div className="col-xl-4 col-lg-5 col-md-5 col-sm-6 d-block h-auto my-3" key={plan?.id}>
                    <div className="card pricing-card bg-light p-5 shadow-lg mb-8 h-100">
                        <h1>{plan?.attributes?.name}</h1>
                        <h1 className="pricing-amount">
                            {(plan?.attributes?.currency_symbol)}{formatAmount(plan?.attributes?.price)}
                        </h1>
                        <p>{getFormattedMessage("trial-days.title")}: {plan?.attributes?.trial_days}</p>
                        <div className='d-flex justify-content-center mb-5'>
                            <tbody>
                                <tr>
                                    <td className="text-start w-100">{getFormattedMessage("number.of.stores.title")}: ( {plan?.attributes?.no_of_stores} )</td>
                                    <td className='text-success fs-3'>
                                        <div className='ml-20px'>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </div>
                                    </td>
                                </tr>
                                {planFeatures.map((feature) => (
                                    <tr key={feature?.key}>
                                        <td className={getFeatureStatus(plan, feature?.key) ? 'text-start w-100' : 'text-secondary text-start'}>{getFormattedMessage(feature?.name)}</td>
                                        <td key={`${plan?.id}-${feature?.key}`} className={getFeatureStatus(plan, feature?.key) ? 'text-success fs-3' : 'text-secondary fs-3'}>
                                            <div className='ml-20px'>
                                                <FontAwesomeIcon icon={getFeatureStatus(plan, feature?.key) ? faCheck : faXmark} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </div>

                        <div className="p-0">
                            {activePlan ? (
                                (activePlan !== null && plan?.id === activePlan)
                                    ? allConfigData?.is_expired
                                        ? (
                                            <Link className="btn btn-primary rounded-pill mx-auto my-0" to={`/app/user/compare-plan/${plan.id}`}>
                                                {getFormattedMessage("globally.buy.plan.btn.title")}
                                            </Link>
                                        )
                                        : (
                                            <p className="btn btn-success rounded-pill mx-auto my-0">
                                                {getFormattedMessage("globally.currently.active.btn.title")}
                                            </p>
                                        )
                                    : (
                                        <Link className="btn btn-primary rounded-pill mx-auto my-0" to={`/app/user/compare-plan/${plan.id}`}>
                                            {allConfigData?.is_expired
                                                ? getFormattedMessage("globally.buy.plan.btn.title")
                                                : getFormattedMessage("globally.switch.plan.btn.title")}
                                        </Link>
                                    )
                            ) : (
                                <Link className="btn btn-primary rounded-pill mx-auto my-0" to={`/app/user/compare-plan/${plan.id}`}>
                                    {getFormattedMessage("globally.choose.plan.btn.title")}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )) : (
                <div className="text-center fs-3 my-5 nodata">
                    {getFormattedMessage("globally.no.plan.available.title")}
                </div>
            )}
        </div>
    );
};

export default PlanTab;
