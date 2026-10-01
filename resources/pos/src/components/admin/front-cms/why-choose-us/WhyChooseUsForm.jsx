import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap-v5'
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod'
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import ReactQuill from 'react-quill';
import { useDispatch } from 'react-redux';
import { adminActionType, adminApiBaseURL } from '../../../../constants';
import { updateWhyChooseUsForntCMS } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import NoImage from '../../../../assets/images/brand_logo.png';

const WhyChooseUsForm = ({ show, data, handleClose, title }) => {
    const dispatch = useDispatch();
    const [logoPreview, setLogoPreview] = useState(NoImage);
    const [logoFile, setLogoFile] = useState(null);

    const [whyChooseUsValue, setWhyChooseUsValue] = useState({
        image: null,
        title: "",
        description: ""
    });

    const [errors, setErrors] = useState({
        image: "",
        title: "",
        description: ""
    });

    useEffect(() => {
        setWhyChooseUsValue({
            image: data?.image ? data?.image : null,
            title: data?.title ? data?.title : "",
            description: data?.description ? data?.description : ""
        })
        setLogoPreview(data?.image ? data?.image : NoImage)
    }, [data])

    const handleValidation = () => {
        const isDescriptionEmpty = (desc) => {
            if (!desc || desc.trim() === "" || desc === "<p><br></p>") {
                return true;
            }
            return false;
        };
        let errorss = {};
        let isValid = false;
        if (!whyChooseUsValue["image"]) {
            errorss["image"] = getFormattedMessage(
                "image.select.validate.title"
            );
        } else if (!whyChooseUsValue["title"]) {
            errorss["title"] = getFormattedMessage(
                "front-cms.title.validate.label"
            );
        } else if (isDescriptionEmpty(whyChooseUsValue["description"])) {
            errorss["description"] = getFormattedMessage("front-cms.description.validate.label");
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
                    if (type === "image") {
                        setLogoPreview(fileReader.result);
                        setLogoFile(file);
                        setWhyChooseUsValue(prevState => ({
                            ...prevState,
                            image: fileReader.result,
                        }));
                    }
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        setWhyChooseUsValue(inputs => ({
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
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("_method", "PATCH");
        return formData;
    };

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            dispatch(updateWhyChooseUsForntCMS(prepareFormData(whyChooseUsValue), adminApiBaseURL.FRONT_CMS_WHY_CHOOSE_US, adminActionType.FETCH_WHY_CHOOSE_US, data?.id));
            handleClose()
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
                    <div className="mb-4">
                        <ImagePicker
                            imageTitle={placeholderText("front-cms.image.title")}
                            imagePreviewUrl={logoPreview}
                            handleImageChange={(e) => handleImageChange(e, "image")}
                        />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['image'] ? errors['image'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage("front-cms.table.column.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='title'
                            value={whyChooseUsValue.title}
                            placeholder={placeholderText("front-cms.title.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={(e) => onChangeInput(e)} />
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors['title'] ? errors['title'] : null}</span>
                    </div>
                    <div className='col-md-12 mb-3 '>
                        <label
                            className='form-label'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <span className='required' />
                        <ReactQuill
                            theme="snow"
                            value={whyChooseUsValue.description}
                            onChange={(content) =>
                                onChangeInput({ target: { name: "description", value: content } })
                            }
                        />
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

export default WhyChooseUsForm