import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap-v5'
import { useDispatch } from 'react-redux';
import { getFormattedMessage, placeholderText } from '../../../shared/sharedMethod';
import ReactDatePicker from '../../../shared/datepicker/ReactDatePicker';
import { updateSubscription } from '../../../store/action/admin/subscriptionAction';
import moment from 'moment';

const SubscriptionForm = ({ show, data, handleClose, title, onUpdate }) => {
    const dispatch = useDispatch();
    const [subscriptionValue, setSubscriptionValue] = useState({
        end_date: new Date(),
    });

    const [errors, setErrors] = useState({
        end_date: "",
    });

    useEffect(() => {
        if (show) {
            setErrors({
                end_date: "",
            })
        }
    }, [show])

    useEffect(() => {
        if (data) {
            // Use the raw date if available, otherwise try to parse the formatted date
            let endDate = null;
            if (data?.end_date_raw) {
                endDate = new Date(data.end_date_raw);
            } else if (data?.end_date) {
                // Attempt to parse the formatted date
                const parsedDate = moment(data.end_date, 'Do MMM, YYYY');
                if (parsedDate.isValid()) {
                    endDate = parsedDate.toDate();
                } else {
                    endDate = new Date(data.end_date);
                }
            }
            
            setSubscriptionValue({
                end_date: endDate || new Date(),
            })
        }
    }, [data, show])

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!subscriptionValue["end_date"] || subscriptionValue["end_date"] === "") {
            errorss["end_date"] = getFormattedMessage(
                "end.date.validate.title"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const handleCallback = (date) => {
        setSubscriptionValue((inputs) => ({
            ...inputs,
            end_date: date,
        }));
        setErrors("");
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("end_date", data.end_date ? moment(data.end_date).format("YYYY-MM-DD") : "");
        return formData;
    };

    const onSubmit = async () => {
        const valid = handleValidation();
        if (valid) {
            const payload = prepareFormData(subscriptionValue);
            await dispatch(
                updateSubscription(payload, data?.id, () => {
                    handleClose();
                    // Pass updated date to parent
                    if (typeof onUpdate === "function") {
                        onUpdate(moment(subscriptionValue.end_date).format("YYYY-MM-DD"));
                    }
                })
            );
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='pb-0'>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("globally.plan.end.date.title")}: </label>
                        <span className='required' />
                        <ReactDatePicker
                            onChangeDate={handleCallback}
                            newStartDate={subscriptionValue?.end_date}
                            readOnlyref={false}
                            disablePast={true}
                            disableFuture={false}
                            placeholder={placeholderText("expiry.date.placeholder.title")}
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['end_date'] ? errors['end_date'] : null}</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='pt-0'>
                <button
                    className="btn btn-primary mt-4"
                    type="button"
                    onClick={onSubmit}
                >
                    {getFormattedMessage("globally.save-btn")}
                </button>
                <button
                    onClick={handleClose}
                    className='btn btn-secondary mt-4 mx-2'
                    type='button'
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default SubscriptionForm

