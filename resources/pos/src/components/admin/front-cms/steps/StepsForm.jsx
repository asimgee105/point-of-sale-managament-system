import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap-v5';
import { useDispatch } from 'react-redux';
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import { editStep } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import NoImage from '../../../../assets/images/brand_logo.png';

const StepsForm = ({ show, data, handleClose, title }) => {
    const dispatch = useDispatch();
    const [logoPreview, setLogoPreview] = useState(NoImage);
    const [logoFile, setLogoFile] = useState(null);
    const [stepValue, setStepValue] = useState({
        sub_title: "",
        image: "",
        title: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        sub_title: "",
        image: "",
        title: "",
        description: ""
    });

    useEffect(() => {
        setLogoPreview(data?.image ? data?.image : NoImage);
        setStepValue({
            sub_title: data?.sub_title ? data?.sub_title : "",
            image: data?.image ? data?.image : "",
            title: data?.title ? data?.title : "",
            description: data?.description ? data?.description : "",
            id: data?.id
        })
        setErrors('')
    }, [data, show]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!stepValue.sub_title) {
            errorss["sub_title"] = getFormattedMessage("front.cms.step.validate.title");
        } else if (!stepValue.title) {
            errorss["title"] = getFormattedMessage("front-cms.title.validate.label");
        } else if (!stepValue.description) {
            errorss["description"] = getFormattedMessage("front-cms.description.validate.label");
        } else if (!stepValue.image) {
            errorss["image"] = getFormattedMessage("image.select.validate.title");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const handleImageChange = (e) => {
        e.preventDefault();
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setLogoPreview(fileReader.result);
                    setLogoFile(file);
                    setStepValue(prevState => ({
                        ...prevState,
                        image: fileReader,
                    }));
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setStepValue(inputs => ({
            ...inputs,
            [e.target.name]: e.target.value
        }))
        setErrors('');
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        if (logoFile) {
            formData.append("image", logoFile);
        }
        formData.append("sub_title", data.sub_title);
        formData.append("title", data.title);
        formData.append("description", data.description);
        if (data) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            dispatch(editStep(prepareFormData(stepValue), stepValue.id, handleClose));
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
                            className='form-label'>{getFormattedMessage("front.cms.step.name.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='sub_title'
                            value={stepValue.sub_title}
                            placeholder={placeholderText("front.cms.step.placeholder.title")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['sub_title'] ? errors['sub_title'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("front-cms.table.column.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='title'
                            value={stepValue.title}
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
                            value={stepValue.description}
                            placeholder={placeholderText("front-cms.description.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['description'] ? errors['description'] : null}</span>
                    </div>
                    <div className="mb-4">
                        <ImagePicker
                            imageTitle={placeholderText("front-cms.image.title")}
                            imagePreviewUrl={logoPreview}
                            handleImageChange={handleImageChange}
                            required
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['image'] ? errors['image'] : null}</span>
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
                    onClick={() => handleClose()}
                    className='btn btn-secondary mt-4 mx-2'
                    type='button'
                >
                    {getFormattedMessage("globally.cancel-btn")}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default StepsForm

