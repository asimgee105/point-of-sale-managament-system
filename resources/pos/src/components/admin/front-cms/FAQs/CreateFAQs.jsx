import React, { useState } from 'react'
import { Button } from 'react-bootstrap-v5'
import FAQsForm from './FAQsForm'
import { getFormattedMessage } from '../../../../shared/sharedMethod';

const CreateFAQs = ({clearSelectedDeleteItem}) => {
    const [show, setShow] = useState(false);
    const handleClose = () => {
        setShow(!show);
        clearSelectedDeleteItem();
    };

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('front-cms.add.faqs.title')}
            </Button>
            <FAQsForm handleClose={handleClose} show={show}
                title={getFormattedMessage('front-cms.add.faqs.title')} />
        </div>
    )
}

export default CreateFAQs