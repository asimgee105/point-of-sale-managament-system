import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import ImagePicker from "../../../shared/image-picker/ImagePicker";
import {
    getFormattedMessage,
    placeholderText
} from "../../../shared/sharedMethod";
import { fetchAdminSettings, updateAdminSettings, backupDatabase } from "../../../store/action/admin/adminSettingsAction";
import ReactSelect from "../../../shared/select/reactSelect";
import NoImage from '../../../assets/images/brand_logo.png';
import CountriesCode from "../../../assets/data/country-code.json";
import { fetchCacheClear } from "../../../store/action/settingAction";
import warning from "../../../assets/images/warning.png"
import EditHoldConfirmationModal from "../../../frontend/components/cart-product/EditHoldConfirmationModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

const SystemSettings = ({ fetchAdminSettings, adminSetting, updateAdminSettings, fetchCacheClear, backupDatabase }) => {
    const [settingValue, setSettingValue] = useState({
        logo: null,
        favicon: null,
        app_name: "",
        footer: "",
        show_version_on_footer: false,
        show_app_name_in_sidebar: false,
        send_registration_mail: true,
        show_landing_page: "1",
        default_country_code: "",
        plan_expire_notification_day: "",
        enable_nepali_datepicker: false,
    });
    const [errors, setErrors] = useState({
        app_name: "",
    });
    const [logoPreview, setLogoPreview] = useState(NoImage);
    const [faviconPreview, setFaviconPreview] = useState(null);
    const [disable, setDisable] = useState(true);
    const [logoFile, setLogoFile] = useState(null);
    const [faviconFile, setFaviconFile] = useState(null);
    const [isClearCache, setIsClearCache] = useState(false);
    const [isBackupDatabase, setIsBackupDatabase] = useState(false);

    useEffect(() => {
        fetchAdminSettings();
    }, []);

    const uniqueCountries = CountriesCode.sort((a, b) => a.countryNameEn.localeCompare(b.countryNameEn));

    const defaultCountryCode = uniqueCountries.find(country => country?.countryCallingCode === "91");
    const defaultCountryOption = {
        value: defaultCountryCode.countryCode,
        label: `${defaultCountryCode.flag} ${defaultCountryCode.countryNameEn} +${defaultCountryCode?.countryCallingCode} `
    };

    useEffect(() => {
        if (adminSetting) {
            const matchingCountry = uniqueCountries.find(country =>
                country?.countryCode?.toLowerCase() === adminSetting?.attributes?.default_country_code?.toLowerCase()
            );

            setSettingValue({
                logo: adminSetting?.attributes?.app_logo,
                favicon: adminSetting?.attributes?.app_favicon,
                app_name: adminSetting?.attributes?.app_name,
                footer: adminSetting?.attributes?.footer ?? "",
                plan_expire_notification_day: adminSetting?.attributes?.plan_expire_notification_day ?? "",
                show_version_on_footer: adminSetting?.attributes?.show_version_on_footer == "true" || adminSetting?.attributes?.show_version_on_footer == "1" ? true : false,
                show_app_name_in_sidebar: adminSetting?.attributes?.show_app_name_in_sidebar == "true" || adminSetting?.attributes?.show_app_name_in_sidebar == "1" ? true : false,
                send_registration_mail: adminSetting?.attributes?.send_registration_mail == "true" || adminSetting?.attributes?.send_registration_mail == "1" ? true : false,
                show_landing_page: adminSetting?.attributes?.show_landing_page == "true" || adminSetting?.attributes?.show_landing_page == "1" ? "1" : "0",
                default_country_code: matchingCountry ? {
                    value: matchingCountry.countryCode,
                    label: `${matchingCountry.flag} ${matchingCountry.countryNameEn} +${matchingCountry.countryCallingCode}`
                } : defaultCountryOption,
                enable_nepali_datepicker: adminSetting?.attributes?.enable_nepali_datepicker == "1" ? true : false,
            });
            setLogoPreview(adminSetting?.attributes?.app_logo ?? NoImage);
            setFaviconPreview(adminSetting?.attributes?.app_favicon ?? NoImage);
        }
    }, [adminSetting]);

    useEffect(() => {
        const originalSettings = {
            logo: adminSetting?.attributes?.app_logo,
            favicon: adminSetting?.attributes?.app_favicon,
            app_name: adminSetting?.attributes?.app_name,
            footer: adminSetting?.attributes?.footer,
            plan_expire_notification_day: adminSetting?.attributes?.plan_expire_notification_day,
            show_version_on_footer: adminSetting?.attributes?.show_version_on_footer === "true" ? true : false,
            show_app_name_in_sidebar: adminSetting?.attributes?.show_app_name_in_sidebar === "true" ? true : false,
            send_registration_mail: adminSetting?.attributes?.send_registration_mail === "true" ? true : false,
            show_landing_page: adminSetting?.attributes?.show_landing_page === "1" ? "1" : "0",
            default_country_code: adminSetting?.attributes?.default_country_code,
        };

        const isUnchanged =
            settingValue.logo === originalSettings.logo &&
            settingValue.favicon === originalSettings.favicon &&
            settingValue.app_name === originalSettings.app_name &&
            settingValue.footer === originalSettings.footer &&
            settingValue.plan_expire_notification_day === originalSettings.plan_expire_notification_day &&
            settingValue.show_version_on_footer === originalSettings.show_version_on_footer &&
            settingValue.show_app_name_in_sidebar === originalSettings.show_app_name_in_sidebar &&
            settingValue.send_registration_mail === originalSettings.send_registration_mail &&
            settingValue.show_landing_page === originalSettings.show_landing_page &&
            settingValue.default_country_code?.value?.toLowerCase() === originalSettings.default_country_code?.toLowerCase();
    }, [settingValue, adminSetting]);

    const onCountryCodeChange = (obj) => {
        setSettingValue((settingValue) => ({ ...settingValue, default_country_code: obj }));
    };

    const handleChanged = (event, checkboxType) => {
        let checked = event.target.checked;
        setDisable(false);
        if (checkboxType === "version") {
            setSettingValue((settingValue) => ({
                ...settingValue,
                show_version_on_footer: checked,
            }));
        } else if (checkboxType === "logo") {
            setSettingValue((settingValue) => ({
                ...settingValue,
                show_logo_in_receipt: checked,
            }));
        } else if (checkboxType === "appname") {
            setSettingValue((settingValue) => ({
                ...settingValue,
                show_app_name_in_sidebar: checked,
            }));
        } else if (checkboxType === "enable_nepali_datepicker") {
            setSettingValue((settingValue) => ({
                ...settingValue,
                enable_nepali_datepicker: checked,
            }));
        }
    };

    const handleImageChange = (e, type) => {
        e.preventDefault();
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    if (type === "logo") {
                        setLogoPreview(fileReader.result);
                        setLogoFile(file);
                        setSettingValue(prevState => ({
                            ...prevState,
                            logo: fileReader.result,
                        }));
                    } else {
                        setFaviconPreview(fileReader.result);
                        setFaviconFile(file);
                        setSettingValue(prevState => ({
                            ...prevState,
                            favicon: fileReader.result,
                        }));
                    }
                };
                fileReader.readAsDataURL(file);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettingValue(prevState => ({
            ...prevState,
            [name]: value,
        }));

    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        if (logoFile) {
            formData.append("app_logo", logoFile);
        }
        if (faviconFile) {
            formData.append("app_favicon", faviconFile);
        }
        formData.append("app_name", data.app_name);
        formData.append("show_version_on_footer", data.show_version_on_footer);
        formData.append("show_app_name_in_sidebar", data.show_app_name_in_sidebar);
        formData.append("footer", data.footer);
        formData.append("plan_expire_notification_day", data.plan_expire_notification_day);
        formData.append("send_registration_mail", data.send_registration_mail);
        formData.append("show_landing_page", data.show_landing_page);
        formData.append("enable_nepali_datepicker", data.enable_nepali_datepicker === true ? "1" : "0");
        if (data.default_country_code) {
            formData.append("default_country_code", data.default_country_code.value.toLowerCase());
        }
        return formData;
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!settingValue["app_name"]) {
            errorss["app_name"] = getFormattedMessage(
                "settings.system-settings.input.app-name.validate.label"
            );
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
            updateAdminSettings(prepareFormData(settingValue));
        }
    };

    const onConfirm = () => {
        fetchCacheClear(true);
        setIsClearCache(false)
    }

    const onBackupDatabase = () => {
        backupDatabase();
        setIsBackupDatabase(false);
    }

    const renderBackupTooltip = (props) => (
        <Tooltip id="backup-tooltip" {...props}>
            {getFormattedMessage("globally.backup.database.info.message")}
        </Tooltip>
    );

    return (
        <>
            <form onSubmit={onEdit}>
                <div className="d-flex align-items-center gap-3 gap-sm-1">
                    <div className="col-lg-2 mb-3">
                        <ImagePicker
                            imageTitle={placeholderText("globally.input.app-logo.tooltip")}
                            imagePreviewUrl={logoPreview}
                            handleImageChange={(e) => handleImageChange(e, "logo")}
                        />
                    </div>
                    <div className="col-lg-2 mb-3">
                        <ImagePicker
                            imageTitle={placeholderText("globally.input.favicon.tooltip")}
                            imagePreviewUrl={faviconPreview}
                            handleImageChange={(e) => handleImageChange(e, "favicon")}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">
                            {getFormattedMessage("settings.system-settings.input.app-name.label")}:<span className="required" />
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={placeholderText("settings.system-settings.input.app-name.placeholder.label")}
                            name="app_name"
                            value={settingValue.app_name || ''}
                            onChange={handleInputChange}
                        />
                        {errors.app_name && (
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors.app_name}
                            </span>
                        )}
                    </div>

                    <div className="col-lg-6 mb-3">
                        <label className="form-label">
                            {getFormattedMessage(
                                "settings.system-settings.input.footer.label"
                            )}
                            :
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={placeholderText(
                                "settings.system-settings.input.footer.placeholder.label"
                            )}
                            name="footer"
                            value={settingValue.footer}
                            onChange={handleInputChange}
                        />
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["footer"]
                                ? errors["footer"]
                                : null}
                        </span>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <ReactSelect
                            title={getFormattedMessage(
                                "settings.system-settings.select.default-country-code.label"
                            )}
                            placeholder={placeholderText(
                                "settings.system-settings.select.default-country-code.label"
                            )}
                            defaultValue={settingValue.default_country_code}
                            value={settingValue.default_country_code}
                            data={uniqueCountries.map(country => ({
                                value: country.countryCode,
                                label: `${country.flag} ${country.countryNameEn} +${country.countryCallingCode} `,
                            }))}
                            onChange={onCountryCodeChange}
                        />
                    </div>
                    <div className="col-lg-6 mb-3">
                        <label className="form-label">
                            {getFormattedMessage(
                                "plan.expire.notification.title"
                            )}
                            :
                        </label>
                        <input
                            type="number"
                            name="plan_expire_notification_day"
                            min={0}
                            value={settingValue.plan_expire_notification_day}
                            placeholder={placeholderText(
                                "plan.expire.notification.placeholder.title"
                            )}
                            className="form-control"
                            onChange={handleInputChange}
                        />
                        <span className="text-danger d-block fw-400 fs-small mt-2">
                            {errors["plan_expire_notification_day"]
                                ? errors["plan_expire_notification_day"]
                                : null}
                        </span>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <div className="col-md-12">
                            <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                <input
                                    type="checkbox"
                                    name="show_version_on_footer"
                                    value={settingValue.show_version_on_footer}
                                    checked={settingValue.show_version_on_footer}
                                    onChange={(event) =>
                                        handleChanged(
                                            event,
                                            "version"
                                        )
                                    }
                                    className="me-3 form-check-input cursor-pointer"
                                />
                                <div className="control__indicator" />{" "}
                                {getFormattedMessage(
                                    "settings.system-settings.select.default-version-footer.placeholder.label"
                                )}
                            </label>
                        </div>
                        <div className="col-md-12">
                            <label className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label">
                                <input
                                    type="checkbox"
                                    name="show_app_name_in_sidebar"
                                    value={settingValue.show_app_name_in_sidebar}
                                    checked={settingValue.show_app_name_in_sidebar}
                                    onChange={(event) =>
                                        handleChanged(
                                            event,
                                            "appname"
                                        )
                                    }
                                    className="me-3 form-check-input cursor-pointer"
                                />
                                <div className="control__indicator" />{" "}
                                {getFormattedMessage(
                                    "settings.system-settings.select.appname-sidebar.placeholder.label"
                                )}
                            </label>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <div className="row">
                            <div className="col-md-6">
                                <label className="form-label">
                                    {getFormattedMessage(
                                        "send.registration.mail.title"
                                    )}
                                    :
                                </label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="send_registration_mail"
                                        checked={settingValue.send_registration_mail}
                                        onChange={(e) => {
                                            setSettingValue(prev => ({
                                                ...prev,
                                                send_registration_mail: e.target.checked
                                            }));
                                            setDisable(false);
                                        }}
                                    />
                                    <label className="form-check-label">
                                        {getFormattedMessage(
                                            "send.registration.mail.title"
                                        )}
                                    </label>
                                </div>
                            </div>
                            <div className="col-lg-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage(
                                        "enable.landing.page.title"
                                    )}
                                    :
                                </label>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        name="show_landing_page"
                                        checked={settingValue.show_landing_page === "1"}
                                        onChange={(e) => {
                                            setSettingValue(prev => ({
                                                ...prev,
                                                show_landing_page: e.target.checked ? "1" : "0"
                                            }));
                                            setDisable(false);
                                        }}
                                    />
                                    <label className="form-check-label">
                                        {getFormattedMessage(
                                            "enable.landing.page.title"
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-12 mb-3">
                    <div>
                        <label className="form-check form-switch form-switch-sm">
                            <input
                                type="checkbox"
                                checked={settingValue.enable_nepali_datepicker}
                                name="enable_nepali_datepicker"
                                onChange={(event) =>
                                    handleChanged(
                                        event,
                                        "enable_nepali_datepicker"
                                    )
                                }
                                className="me-3 form-check-input cursor-pointer"
                            />
                            <div className="control__indicator" />{" "}
                            {getFormattedMessage(
                                "enable.nepali.datepicker.title"
                            )}
                        </label>
                    </div>
                </div>
                <div>
                    <button
                        disabled={disable}
                        className="btn btn-primary mt-4"
                        type="submit"
                    >
                        {getFormattedMessage("globally.save-btn")}
                    </button>
                </div>
            </form>
            <div className="w-100 mx-auto pt-2">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <button
                            className="btn btn-primary"
                            type="button"
                            onClick={() => setIsClearCache(true)}
                        >
                            {getFormattedMessage(
                                "globally.clear.cache.title"
                            )}
                        </button>
                    </div>
                    <div className="col-md-6 mb-3">
                        <div className="d-flex align-items-center">
                            <button
                                className="btn btn-warning me-2"
                                type="button"
                                onClick={onBackupDatabase}
                            >
                                <span className="me-2"><FontAwesomeIcon icon={faDatabase} /></span>
                                {getFormattedMessage(
                                    "globally.backup.database.title"
                                )}
                            </button>
                            <OverlayTrigger
                                placement="top"
                                overlay={renderBackupTooltip}
                            >
                                <span className="cursor-pointer"><FontAwesomeIcon icon={faQuestionCircle} /></span>
                            </OverlayTrigger>
                        </div>
                    </div>
                </div>
            </div>
            {isClearCache &&
                <EditHoldConfirmationModal
                    onConfirm={onConfirm}
                    onCancel={() => setIsClearCache(false)}
                    icon={warning}
                    title={getFormattedMessage("globally.clear.cache.warning.message")}
                />}
        </>
    );
};

const mapStateToProps = (state) => ({
    adminSetting: state.adminSetting,
});

export default connect(mapStateToProps, { fetchAdminSettings, updateAdminSettings, fetchCacheClear, backupDatabase })(SystemSettings);