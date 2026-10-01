import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap-v5';
import { useDispatch } from 'react-redux';
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import { addPartner, editPartner } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import NoImage from '../../../../assets/images/brand_logo.png';

const PartnerForm = ({ show, data, handleClose, title, isEdit }) => {
    const dispatch = useDispatch();
    const [logoPreview, setLogoPreview] = useState(NoImage);
    const [logoFile, setLogoFile] = useState(null);
    const [partnerValue, setPartnerValue] = useState({
        name: "",
        partner_image: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        partner_image: "",
    });

    useEffect(() => {
        setLogoPreview(data?.image ? data?.image : NoImage);
        setPartnerValue({
            name: data?.name ? data?.name : "",
            partner_image: data?.image ? data?.image : "",
        })
        setErrors('')
    }, [data, show]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!partnerValue.name) {
            errorss["name"] = getFormattedMessage("globally.input.name.validate.label");
        }
        else if (!partnerValue.partner_image) {
            errorss["partner_image"] = getFormattedMessage("image.select.validate.title");
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
                    setPartnerValue(prevState => ({
                        ...prevState,
                        partner_image: fileReader,
                    }));
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setPartnerValue(inputs => ({
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
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const clearData = () => {
        setLogoPreview(NoImage)
        setPartnerValue({
            name: '',
            partner_image: "",
        });
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
                dispatch(editPartner(prepareFormData(partnerValue), data?.id, handleClose));
            } else {
                dispatch(addPartner(prepareFormData(partnerValue), handleClose, clearData));
            }
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
                            className='form-label'>{getFormattedMessage("globally.input.name.label")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='name'
                            value={partnerValue.name}
                            placeholder={placeholderText("globally.input.name.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['name'] ? errors['name'] : null}</span>
                    </div>
                    <div className="mb-4">
                        <ImagePicker
                            imageTitle={placeholderText("front-cms.image.title")}
                            imagePreviewUrl={logoPreview}
                            handleImageChange={handleImageChange}
                            required
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['partner_image'] ? errors['partner_image'] : null}</span>
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

export default PartnerForm

