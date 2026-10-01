import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap-v5'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod'
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { updateServicesFrontCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import { useDispatch } from 'react-redux';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import NoImage from '../../../../assets/images/brand_logo.png';

const ServiceForm = ({ show, data, handleClose, title }) => {
    const dispatch = useDispatch();
    const [logoPreview, setLogoPreview] = useState(NoImage);
    const [logoFile, setLogoFile] = useState(null);
    const [serviceValue, setServiceValue] = useState({
        service_image: null,
        name: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        service_image: "",
        name: "",
        description: ""
    });

    useEffect(() => {
        if (show) {
            setErrors({
                service_image: "",
                name: "",
                description: ""
            })
        }
    }, [show])

    useEffect(() => {
        if (data) {
            setServiceValue({
                name: data?.name ? data?.name : "",
                description: data?.description ? data?.description : "",
                service_image: data?.image ? data?.image : NoImage
            })
            setLogoPreview(data?.icon ?? NoImage)
        }
    }, [data, show])

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!serviceValue["name"]) {
            errorss["name"] = getFormattedMessage(
                "globally.input.name.validate.label"
            );
        } else if (!serviceValue["description"]) {
            errorss["description"] = getFormattedMessage(
                "front-cms.description.validate.label"
            );
        } else if (!serviceValue["service_image"]) {
            errorss["service_image"] = getFormattedMessage(
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
                    if (type === "service_image") {
                        setLogoPreview(fileReader.result);
                        setLogoFile(file);
                        setServiceValue(prevState => ({
                            ...prevState,
                            service_image: fileReader.result,
                        }));
                    }
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setServiceValue(inputs => ({
            ...inputs,
            [e.target.name]: e.target.value
        }))
        setErrors('');
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        if (logoFile) {
            formData.append("icon", logoFile);
        }
        formData.append("title", data.name);
        formData.append("description", data.description);
        return formData;
    };

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            dispatch(updateServicesFrontCMS(
                prepareFormData(serviceValue),
                adminApiBaseURL.FRONT_CMS_SERVICES_SECTION,
                adminActionType.FETCH_SERVICES_SECTION,
                data?.id,
                handleClose
            ));
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
                            value={serviceValue.name}
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
                            value={serviceValue.description}
                            placeholder={placeholderText("front-cms.description.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)}
                            rows={3} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['description'] ? errors['description'] : null}</span>
                    </div>
                    <div className="mb-4">
                        <ImagePicker
                            imageTitle={placeholderText("front-cms.image.title")}
                            imagePreviewUrl={logoPreview}
                            handleImageChange={(e) => handleImageChange(e, "service_image")}
                            required
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['service_image'] ? errors['service_image'] : null}</span>
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

export default ServiceForm

