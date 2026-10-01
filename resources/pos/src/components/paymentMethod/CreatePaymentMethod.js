import React, {useState} from 'react';
import {Button} from 'react-bootstrap-v5';
import {useDispatch} from 'react-redux';
import {getFormattedMessage} from "../../shared/sharedMethod";
import PaymentMethodForm from './PaymentMethodForm';

const CreatePaymentMethod = () => {
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(!show);

    return (
        <div className='text-end w-sm-auto'>
            <Button variant='primary mb-lg-0 mb-4' onClick={handleClose}>
                {getFormattedMessage('create.payment.methods.title')}
            </Button>
            <PaymentMethodForm 
                handleClose={handleClose} 
                show={show}
                title={getFormattedMessage("create.payment.methods.title")}/>
        </div>

    )
};

export default CreatePaymentMethod;
