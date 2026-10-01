import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap-v5'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod'
import { useDispatch } from 'react-redux';
import { addFAQs, editFAQs } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const FAQsForm = ({ show, data, isEdit, handleClose, title }) => {
    const dispatch = useDispatch();
    const [faqsValue, setFaqsValue] = useState({
        title: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        title: "",
        description: ""
    });

    useEffect(() => {
        setFaqsValue({
            title: data?.title ? data?.title : "",
            description: data?.description ? data?.description : ""
        })
    }, [data])

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!faqsValue["title"]) {
            errorss["title"] = getFormattedMessage(
                "front-cms.title.validate.label"
            );
        } else if (!faqsValue["description"]) {
            errorss["description"] = getFormattedMessage(
                "front-cms.description.validate.label"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setFaqsValue(inputs => ({
            ...inputs,
            [e.target.name]: e.target.value
        }))
        setErrors('');
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const clearData = () => {
        setFaqsValue({
            name: "",
            description: ""
        })
        setErrors({});
    }

    const handleCancleButton = () => {
        clearData();
        handleClose();
    }

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            if (isEdit) {
                dispatch(editFAQs(prepareFormData(faqsValue), data.id, handleClose));
            } else {
                dispatch(addFAQs(prepareFormData(faqsValue), clearData, handleClose));
            }
        }
    }

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
                            className='form-label'>{getFormattedMessage("front-cms.table.column.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='title'
                            value={faqsValue.title}
                            placeholder={placeholderText("front-cms.title.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['title'] ? errors['title'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <span className='required' />
                        <textarea
                            type='text'
                            name='description'
                            value={faqsValue.description}
                            placeholder={placeholderText("front-cms.description.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)}
                            rows={4} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['description'] ? errors['description'] : null}</span>
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
                    onClick={handleCancleButton}
                    className='btn btn-secondary mt-4 mx-2'
                    type='button'
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default FAQsForm