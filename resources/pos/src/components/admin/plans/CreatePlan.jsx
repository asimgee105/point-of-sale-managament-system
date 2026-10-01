import React from 'react'
import MasterLayout from '../../MasterLayout'
import PlanForm from './PlanForm'
import HeaderTitle from '../../header/HeaderTitle'
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod'
import { useNavigate } from 'react-router'
import { createPlan } from '../../../store/action/admin/plansAction'
import { connect } from 'react-redux'
import { Filters } from '../../../constants'
import TabTitle from '../../../shared/tab-title/TabTitle'

const CreatePlan = (props) => {
      const { createPlan } = props;
      const navigate = useNavigate();
      const createPlanData = ( formValue ) => {
        createPlan( formValue, navigate, Filters.OBJ );
      };
  
  return (
    <MasterLayout>
      <TabTitle title={placeholderText('new.plan.title')} />
      <HeaderTitle title={getFormattedMessage('new.plan.title')} to='/app/admin/plans' />
      <PlanForm createPlan={createPlanData}/>
    </MasterLayout>
  )
}

export default connect( null, { createPlan } )( CreatePlan );