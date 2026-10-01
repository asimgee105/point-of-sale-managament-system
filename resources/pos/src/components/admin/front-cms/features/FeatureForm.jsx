import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap-v5';
import { useDispatch } from 'react-redux';
import ImagePicker from '../../../../shared/image-picker/ImagePicker';
import { getFormattedMessage, placeholderText } from '../../../../shared/sharedMethod';
import { editFeature } from '../../../../store/action/admin/frontCMS/frontCMSAction';
import NoImage from '../../../../assets/images/brand_logo.png';

const FeatureForm = ({ show, data, handleClose, isEdit, input }) => {
    const dispatch = useDispatch();
    const [iconPreview, setIconPreview] = useState(NoImage);
    const [iconFile, setIconFile] = useState(null);
    const [featureValue, setFeatureValue] = useState({
        title: input?.title || '',
        description: input?.description || '',
        points: input?.points || ['', '', '', ''],
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setIconPreview(data?.image ? data?.image : NoImage);
        setFeatureValue({
            title: data?.title || '',
            description: data?.description || '',
            points: data?.points || ['', '', '', ''],
        });
        setErrors('');
    }, [data, show]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;
        if (!featureValue.title) {
            errorss.title = getFormattedMessage("front-cms.title.validate.label");
            isValid = false;
        }
        else if (!featureValue.description) {
            errorss.description = getFormattedMessage("front-cms.description.validate.label");
            isValid = false;
        }
        else if (featureValue.points.some((point) => !point)) {
            errorss.points = getFormattedMessage("point.validate.label");
            isValid = false;
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
                    setIconPreview(fileReader.result);
                    setIconFile(file);
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("point")) {
            const index = Number(name.replace("point", "")) - 1;
            setFeatureValue((prev) => {
                const updatedPoints = [...prev.points];
                updatedPoints[index] = value;
                return { ...prev, points: updatedPoints };
            });
        } else {
            setFeatureValue((prev) => ({ ...prev, [name]: value }));
        }
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        if (iconFile) {
            formData.append("image", iconFile);
        }
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("points", JSON.stringify(data.points));
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const clearData = () => {
        setIconPreview(NoImage);
        setFeatureValue({
            title: '',
            description: '',
            points: ['', '', '', ''],
        });
        setErrors({});
    };

    const handleCancleButton = () => {
        clearData();
        handleClose();
    };

    const onSubmit = () => {
        const valid = handleValidation();
        if (valid) {
            dispatch(editFeature(prepareFormData(featureValue), data?.id, handleClose));
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>{getFormattedMessage("edit-features.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='pb-0'>
                <div className='row'>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label'>{getFormattedMessage("front-cms.table.column.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='title'
                            value={featureValue.title}
                            placeholder={placeholderText("front-cms.title.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={onChangeInput} />
                        <span className='text-danger d-block fw-400 fs-small'>{errors.title}</span>
                    </div>
                    <div className='col-md-12 mb-3'>
                        <label className='form-label'>{getFormattedMessage("front-cms.description.title")}: </label>
                        <span className='required' />
                        <input
                            type='text'
                            name='description'
                            value={featureValue.description}
                            placeholder={placeholderText("front-cms.description.placeholder.label")}
                            className='form-control'
                            autoComplete='off'
                            onChange={onChangeInput} />
                        <span className='text-danger d-block fw-400 fs-small'>{errors.description}</span>
                    </div>
                    <label className='form-label'>{getFormattedMessage(`feature-points.title`)}: <span className='required' /> </label>
                    {featureValue.points.map((point, index) => (
                        <div className='col-md-12 mb-1' key={index}>
                            <input
                                type='text'
                                name={`point${index + 1}`}
                                value={point}
                                placeholder={placeholderText(`placeholder.feature-point.title`)}
                                className='form-control'
                                autoComplete='off'
                                onChange={onChangeInput} />
                        </div>
                    ))}
                    {errors.points && <span className='text-danger d-block fw-400 fs-small'>{errors.points}</span>}
                    <div className="mb-4 mt-2">
                        <ImagePicker
                            imageTitle={placeholderText("front-cms.image.title")}
                            imagePreviewUrl={iconPreview}
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

export default FeatureForm

