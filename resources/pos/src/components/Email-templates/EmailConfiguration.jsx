import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap-v5';
import { connect } from 'react-redux';
import MasterLayout from '../MasterLayout';
import TopProgressBar from '../../shared/components/loaders/TopProgressBar';
import TabTitle from '../../shared/tab-title/TabTitle';
import { getFormattedMessage, placeholderText } from '../../shared/sharedMethod';
import { editUserMailSettings, fetchUserMailSettings } from '../../store/action/emailTemplatesAction';

const EmailConfiguration = (props) => {

    const { emailTemplates, fetchUserMailSettings, editUserMailSettings } = props;

    const [mailValue, setMailValue] = useState({
        mail_mailer: '',
        mail_host: '',
        mail_port: '',
        sender_name: '',
        mail_username: '',
        mail_password: "",
        mail_encryption: ""
    })

    const [errors, setErrors] = useState({
        mail_mailer: '',
        mail_host: '',
        mail_port: '',
        sender_name: '',
        mail_username: '',
        mail_password: "",
        mail_encryption: ""
    })

    const [disable, setDisable] = useState(true);
    const [isTestEmailDisabled, setIsTestEmailDisabled] = useState(true);

    useEffect(() => {
        fetchUserMailSettings();
    }, []);

    useEffect(() => {
        if (emailTemplates && Array.isArray(emailTemplates)) {
            const mapped = {};
            emailTemplates.forEach(item => {
                mapped[item.key] = item.value === "null" ? "" : item.value;
            });
            setMailValue({
                mail_mailer: mapped.mail_mailer || "",
                mail_host: mapped.mail_host || "",
                mail_port: mapped.mail_port || "",
                sender_name: mapped.mail_from_address || "",
                mail_username: mapped.mail_username || "",
                mail_password: mapped.mail_password || "",
                mail_encryption: mapped.mail_encryption || ""
            });
        }
    }, [emailTemplates]);


    useEffect(() => {
        setIsTestEmailDisabled(!isFormValid());
    }, [mailValue]);

    const isFormValid = () => {
        return mailValue.mail_mailer &&
            mailValue.mail_host &&
            mailValue.mail_port &&
            mailValue.sender_name &&
            mailValue.mail_username &&
            mailValue.mail_password &&
            mailValue.mail_encryption;
    };

    const onChangeInput = (event) => {
        event.preventDefault();
        setDisable(false);
        setMailValue(inputs => ({ ...inputs, [event.target.name]: event.target.value }))
        setErrors('');
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append('mail_mailer', data.mail_mailer);
        formData.append('mail_host', data.mail_host);
        formData.append('mail_port', data.mail_port);
        formData.append('mail_from_address', data.sender_name);
        formData.append('mail_username', data.mail_username);
        formData.append('mail_password', data.mail_password);
        formData.append('mail_encryption', data.mail_encryption);
        return formData;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!mailValue['mail_mailer']) {
            errorss['mail_mailer'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['mail_host']) {
            errorss['mail_host'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['mail_port']) {
            errorss['mail_port'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['sender_name']) {
            errorss['sender_name'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['mail_username']) {
            errorss['mail_username'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['mail_password']) {
            errorss['mail_password'] = getFormattedMessage("globally.require-input.validate.label");
        } else if (!mailValue['mail_encryption']) {
            errorss['mail_encryption'] = getFormattedMessage("globally.require-input.validate.label");
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const onEdit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            editUserMailSettings(prepareFormData(mailValue));
            setDisable(true);
        }
    };

    const sendTestEmailButton = (event) => {
        event.preventDefault();
        sendTestEmail();
    }

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("email.configuration.title")} />
            <>
                <div className='card'>
                    <div className='card-body'>
                        <div className="w-100 d-md-flex">
                            <Form>
                                <div className='row'>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-mailer.lable")}:
                                        </label>
                                        <span className='required' />
                                        <Form.Control type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-mailer.lable")}
                                            name='mail_mailer'
                                            onChange={onChangeInput} value={mailValue.mail_mailer} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_mailer'] ? errors['mail_mailer'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-host.lable")}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-host.lable")}
                                            name='mail_host'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.mail_host} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_host'] ? errors['mail_host'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-port.lable")}:
                                        </label>
                                        <span className='required' />
                                        <Form.Control type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-port.lable")}
                                            name='mail_port'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.mail_port} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_port'] ? errors['mail_port'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("mail-settings.sender-name.title")}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' className="form-control"
                                            placeholder={placeholderText("mail-settings.sender-name.title")}
                                            name='sender_name'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.sender_name} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['sender_name'] ? errors['sender_name'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-user-name.lable")}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-user-name.lable")}
                                            name='mail_username'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.mail_username} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_username'] ? errors['mail_username'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-password.lable")}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-password.lable")}
                                            name='mail_password'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.mail_password} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_password'] ? errors['mail_password'] : null}
                                        </span>
                                    </div>
                                    <div className='col-lg-6 mb-3'>
                                        <label className='form-label'>
                                            {getFormattedMessage("setting.mail-encryption.lable")}:
                                        </label>
                                        <span className='required' />
                                        <input type='text' className="form-control"
                                            placeholder={placeholderText("setting.mail-encryption.lable")}
                                            name='mail_encryption'
                                            onChange={(e) => onChangeInput(e)} value={mailValue.mail_encryption} />
                                        <span className='text-danger d-block fw-400 fs-small mt-2'>
                                            {errors['mail_encryption'] ? errors['mail_encryption'] : null}
                                        </span>
                                    </div>
                                    <div>
                                        <button disabled={disable} className='btn btn-primary'
                                            onClick={(event) => onEdit(event)}>
                                            {getFormattedMessage("globally.save-btn")}
                                        </button>

                                        {/* <button disabled={isTestEmailDisabled} className='ms-2 btn btn-primary' type="button"
                                            onClick={(event) => sendTestEmailButton(event)}>
                                            {getFormattedMessage("send.test.email.title")}
                                        </button> */}
                                    </div>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </>
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const { isLoading, emailTemplates } = state;
    return { isLoading, emailTemplates }
};

export default connect(mapStateToProps, { fetchUserMailSettings, editUserMailSettings })(EmailConfiguration);
