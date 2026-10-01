import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap-v5';
import { useDispatch } from 'react-redux';
import NoImage from '../../../../assets/images/brand_logo.png';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import { addTestimonials, updateTestimonials } from '../../../../store/action/admin/frontCMS/frontCMSAction';

const TestimonialsForm = ({ show, handleClose, title, isEdit, singleTestimonial }) => {

    const [logoPreview, setLogoPreview] = useState(NoImage);
    const dispatch = useDispatch();
    const [testimonialsValue, setTestimonialsValue] = useState({
        testimonials_image: null,
        name: "",
        description: ""
    });
    const [logoFile, setLogoFile] = useState(null);

    const [errors, setErrors] = useState({
        testimonials_image: "",
        name: "",
        description: ""
    });

    useEffect(() => {
        if (isEdit) {
            setTestimonialsValue({
                name: singleTestimonial?.name,
                description: singleTestimonial?.description,
                testimonials_image: singleTestimonial?.image,
                id: singleTestimonial.id
            });
            setLogoPreview(singleTestimonial?.image ? singleTestimonial?.image : NoImage);
        }
    }, [isEdit, singleTestimonial]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!testimonialsValue["name"]) {
            errorss["name"] = getFormattedMessage(
                "globally.input.name.validate.label"
            );
        } else if (!testimonialsValue["description"]) {
            errorss["description"] = getFormattedMessage(
                "front-cms.description.validate.label"
            );
        } else if (!testimonialsValue["testimonials_image"]) {
            errorss["testimonials_image"] = getFormattedMessage(
                "image.select.validate.title"
            );
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const handleImageChange = (e, type) => {
        e.preventDefault();
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    if (type === "testimonials_image") {
                        setLogoPreview(fileReader.result);
                        setLogoFile(file);
                        setTestimonialsValue(prevState => ({
                            ...prevState,
                            testimonials_image: fileReader,
                        }));
                    }
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setTestimonialsValue(inputs => ({
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
        formData.append("name", data.name);
        formData.append("description", data.description);
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const clearData = () => {
        setLogoPreview(NoImage)
        setTestimonialsValue({
            testimonials_image: null,
            name: "",
            description: ""
        })
        setErrors({});
    }

    const handleCancleButton = () => {
        handleClose();
        clearData();
    }

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            if (isEdit) {
                dispatch(updateTestimonials(prepareFormData(testimonialsValue), testimonialsValue.id, handleClose));
            } else {
                dispatch(addTestimonials(prepareFormData(testimonialsValue), handleClose, clearData));
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
                            className='form-label'>{getFormattedMessage("globally.input.name.label")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='name'
                            value={testimonialsValue.name}
                            placeholder={placeholderText("globally.input.name.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['name'] ? errors['name'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <span className='required' />
                        <textarea
                            type='text'
                            name='description'
                            value={testimonialsValue.description}
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
                            handleImageChange={(e) => handleImageChange(e, "testimonials_image")}
                            required
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['testimonials_image'] ? errors['testimonials_image'] : null}</span>
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

export default TestimonialsForm