import React from 'react'
import FAQsForm from './FAQsForm';
import { getFormattedMessage } from '../../../../shared/sharedMethod';

const EditFAQs = (props) => {
  const { handleClose, show, data } = props;

  return (
    <>
      <FAQsForm data={data} isEdit={true} handleClose={handleClose} show={show}
        title={getFormattedMessage('front-cms.edit.faqs.title')} />
    </>
  )
}

export default EditFAQs