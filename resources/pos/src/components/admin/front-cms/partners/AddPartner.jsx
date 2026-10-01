import React, { useState } from 'react'
import { Button } from 'react-bootstrap-v5'
import { getFormattedMessage } from '../../../../shared/sharedMethod';
import PartnerForm from './PartnerForm';

const AddPartner = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(!show);

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('front-cms.add.partner.title')}
            </Button>
            <PartnerForm handleClose={handleClose} show={show}
                title={getFormattedMessage('front-cms.add.partner.title')} />
        </div>
    )
}

export default AddPartner