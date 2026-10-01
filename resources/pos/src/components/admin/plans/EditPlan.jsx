import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { useParams } from 'react-router'
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod'
import { fetchPlan } from '../../../store/action/admin/plansAction'
import HeaderTitle from '../../header/HeaderTitle'
import MasterLayout from '../../MasterLayout'
import PlanForm from './PlanForm'
import { frequencies } from '../../../constants'
import TabTitle from '../../../shared/tab-title/TabTitle'

const EditPlan = (props) => {
  const { plans, fetchPlan } = props;
  const { id } = useParams();

  useEffect(() => {
    fetchPlan(id);
  }, []);

  const itemsValue = plans && plans.length === 1 && plans.map(plan => ({
    name: plan.attributes.name,
    price: plan.attributes.price,
    frequency: { label: getFormattedMessage(frequencies?.filter(f => f.id == plan.attributes.frequency)[0]?.name), value: plan.attributes.frequency },
    trial_days: plan.attributes.trial_days,
    currency_id: { label: plan.attributes.currency_symbol, value: plan.attributes.currency_id },
    id: plan.id,
    features: plan.attributes.features,
    no_of_stores: plan.attributes.no_of_stores
  }));

  return (
    <MasterLayout>
      <TabTitle title={placeholderText('edit.plan.title')} />
      <HeaderTitle title={getFormattedMessage('edit.plan.title')} to='/app/admin/plans' />
      {plans.length === 1 && <PlanForm singlePlan={itemsValue} id={id} />}
    </MasterLayout>
  )
}

const mapStateToProps = (state) => {
  const { plans } = state;
  return { plans }
};


export default connect(mapStateToProps, { fetchPlan })(EditPlan);