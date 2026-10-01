import React, { useEffect, useState, useCallback } from "react";
import { connect } from "react-redux";
import {
    currencySymbolHandling,
    getFormattedMessage,
    placeholderText,
} from "../../../shared/sharedMethod";
import {
    fetchAdminSettings,
    updateAdminSettings,
} from "../../../store/action/admin/adminSettingsAction";
import { fetchCurrencies } from "../../../store/action/currencyAction";

import ReactSelect from "../../../shared/select/reactSelect";
import MasterLayout from "../../MasterLayout";
import SettingSidebar from "./SettingSidebar";
import TabTitle from "../../../shared/tab-title/TabTitle";
import TopProgressBar from "../../../shared/components/loaders/TopProgressBar";

import {
    decimalPlacesOptions,
    decimalSeparatorOptions,
    thousandsSeparatorOptions,
} from "../../../constants";
import { Form } from "react-bootstrap-v5";

const AdminCurrencySettings = ({
    fetchAdminSettings,
    updateAdminSettings,
    fetchCurrencies,
    adminSetting,
    currencies,
}) => {
    const [values, setValues] = useState({
        currency: "",
        decimal_places: "",
        thousands_separator: "",
        decimal_separator: "",
        currency_icon_right_side: false,
    });

    const [errors, setErrors] = useState({});
    const [disabled, setDisabled] = useState(true);

    /* --------------------------
     * INITIAL LOAD
     * ------------------------ */
    useEffect(() => {
        fetchAdminSettings();
        fetchCurrencies();
    }, []);

    /* --------------------------
     * SET DEFAULT VALUES
     * ------------------------ */
    useEffect(() => {
        if (!adminSetting?.attributes) return;

        const { attributes } = adminSetting;

        setValues({
            currency: attributes.admin_default_currency
                ? {
                      value: Number(attributes.admin_default_currency),
                      label: attributes.admin_default_currency_symbol,
                  }
                : "",
            decimal_places:
                decimalPlacesOptions.find(
                    (o) => o.value === Number(attributes.decimal_places)
                ) || "",
            thousands_separator:
                thousandsSeparatorOptions.find(
                    (o) => o.value === Number(attributes.thousands_separator)
                ) || "",
            decimal_separator:
                decimalSeparatorOptions.find(
                    (o) => o.value === Number(attributes.decimal_separator)
                ) || "",
            currency_icon_right_side:
                attributes.is_currency_right === "true" ||
                attributes.is_currency_right == "1",
        });
    }, [adminSetting]);

    /* --------------------------
     * CHANGE HANDLER
     * ------------------------ */
    const handleChange = (name, value) => {
        setDisabled(false);
        setValues((prev) => ({ ...prev, [name]: value }));
        setErrors({});
    };

    /* --------------------------
     * FORM VALIDATION
     * ------------------------ */
    const validate = () => {
        const _errors = {};

        if (!values.currency) _errors.currency = "Currency is required";

        setErrors(_errors);
        return Object.keys(_errors).length === 0;
    };

    /* --------------------------
     * PREPARE FORM DATA
     * ------------------------ */
    const buildFormData = () => {
        const fd = new FormData();

        fd.append("decimal_places", values.decimal_places.value);
        fd.append("thousands_separator", values.thousands_separator.value);
        fd.append("decimal_separator", values.decimal_separator.value);
        fd.append("is_currency_right", values.currency_icon_right_side ? "1" : "0");
        fd.append("admin_default_currency_symbol", values.currency.label);
        fd.append("admin_default_currency", values.currency.value);

        return fd;
    };

    /* --------------------------
     * SUBMIT HANDLER
     * ------------------------ */
    const onSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        updateAdminSettings(buildFormData(), true);
        setDisabled(true);
    };

    /* --------------------------
     * REUSABLE SELECT FIELD
     * ------------------------ */
    const SelectField = ({ label, name, options }) => (
        <div className="mb-3">
            <ReactSelect
                title={getFormattedMessage(label)}
                placeholder={placeholderText(label)}
                value={values[name]}
                data={options}
                onChange={(option) => handleChange(name, option)}
                errors={errors[name]}
            />
        </div>
    );

    /* --------------------------
     * LIVE PREVIEW
     * ------------------------ */
    const previewValue = (() => {
        const sample = 12345.67;

        if (!values.currency) return sample;

        const config = {
            decimal_places: values.decimal_places?.value,
            decimal_separator: values.decimal_separator?.value,
            thousands_separator: values.thousands_separator?.value,
            is_currency_right: values.currency_icon_right_side ? "true" : "false",
        };

        return currencySymbolHandling(config, values.currency.label, sample, false);
    })();

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("currency-settings.title")} />

            <div className="card">
                <div className="card-body">
                    <div className="d-md-flex gap-3">
                        <SettingSidebar />

                        <Form onSubmit={onSubmit} className="flex-grow-1">
                            <div className="row">
                                <div className="col-lg-6">
                                    <SelectField
                                        label="settings.system-settings.select.default-currency.label"
                                        name="currency"
                                        options={currencies}
                                    />

                                    <SelectField
                                        label="thousands-separator.title"
                                        name="thousands_separator"
                                        options={thousandsSeparatorOptions}
                                    />
                                </div>

                                <div className="col-lg-6">
                                    <SelectField
                                        label="decimal-places.title"
                                        name="decimal_places"
                                        options={decimalPlacesOptions}
                                    />

                                    <SelectField
                                        label="decimal-separator.title"
                                        name="decimal_separator"
                                        options={decimalSeparatorOptions}
                                    />
                                </div>
                            </div>

                            {/* ----- SWITCH ----- */}
                            <div className="mt-3">
                                <div>
                                    {getFormattedMessage("currency.icon.right.side.lable")}
                                </div>

                                <div className="d-flex align-items-center mt-2">
                                    <label className="form-check form-switch form-switch-sm">
                                        <input
                                            type="checkbox"
                                            checked={values.currency_icon_right_side}
                                            onChange={(e) =>
                                                handleChange(
                                                    "currency_icon_right_side",
                                                    e.target.checked
                                                )
                                            }
                                            className="me-3 form-check-input cursor-pointer"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* ----- PREVIEW ----- */}
                            <div className="mt-4">
                                <h6 className="mb-2">
                                    {getFormattedMessage("currency.preview.label")}
                                </h6>

                                <div className="border rounded p-3 bg-light fw-bold fs-5">
                                    {previewValue}
                                </div>
                            </div>

                            <button disabled={disabled} className="btn btn-primary mt-4">
                                {getFormattedMessage("globally.save-btn")}
                            </button>
                        </Form>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

const mapStateToProps = (state) => ({
    adminSetting: state.adminSetting,
    currencies: state.currencies,
});

export default connect(mapStateToProps, {
    fetchAdminSettings,
    fetchCurrencies,
    updateAdminSettings,
})(AdminCurrencySettings);
