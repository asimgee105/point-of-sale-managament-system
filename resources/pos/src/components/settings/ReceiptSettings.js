import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap-v5";
import { connect } from "react-redux";
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import TabTitle from "../../shared/tab-title/TabTitle";
import { editReceiptSettings } from "../../store/action/receiptSettingsAction";
import { fetchSetting } from "../../store/action/settingAction";
import HeaderTitle from "../header/HeaderTitle";
import MasterLayout from "../MasterLayout";
import { Font_style, Paper_size, Thermal_sizes } from "../../constants";
import ReactSelect from "../../shared/select/reactSelect";

const ReceiptSettings = (props) => {
    const { settings, editReceiptSettings, isLoading, fetchSetting } = props;

    const [formValues, setFormValues] = useState({
        show_note: true,
        notes: "",
        show_phone: true,
        show_customer: true,
        show_address: true,
        show_email: true,
        show_tax_discount_shipping: true,
        show_barcode_in_receipt: true,
        show_logo_in_receipt: true,
        show_product_code: true,
        show_tax: true,
        other_font_style: null,
        label_font_style: null,
        paper_size: null,
        margin: 0,
        thermal_size: null,
    });

    const [disable, setDisable] = React.useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchSetting();
    }, []);

    useEffect(() => {
        if (settings) {
            setFormValues({
                show_phone: settings.attributes?.show_phone == 1,
                show_address: settings.attributes?.show_address == 1,
                show_customer: settings.attributes?.show_customer == 1,
                show_email: settings.attributes?.show_email == 1,
                show_tax_discount_shipping:
                    settings.attributes?.show_tax_discount_shipping == 1,
                show_note: settings.attributes?.show_note == 1,
                notes: settings.attributes?.notes ?? "",
                show_barcode_in_receipt:
                    settings.attributes?.show_barcode_in_receipt == 1,
                show_logo_in_receipt:
                    settings.attributes?.show_logo_in_receipt == 1,
                show_product_code:
                    settings.attributes?.show_product_code == 1,
                show_tax: settings.attributes?.show_tax == 1,
                other_font_style: Font_style.find(item => item.value == Number(settings.attributes?.receipt_other_font_style)) || Font_style[0],
                label_font_style: Font_style.find(item => item.value == Number(settings.attributes?.receipt_label_font_style)) || Font_style[0],
                paper_size: Paper_size.find(item => item.value == Number(settings.attributes?.receipt_paper_size)) || Paper_size[0],
                thermal_size: Thermal_sizes.find(item => item.value == Number(settings.attributes?.receipt_thermal_size)) || Thermal_sizes[0],
                margin: settings.attributes?.receipt_margin !== undefined ? parseInt(settings.attributes?.receipt_margin) : 0,
            });
        }
    }, [settings]);

    const handleInputChange = (e) => {
        setDisable(false);
        const { name, value, type, checked } = e.target;
        setFormValues({
            ...formValues,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const onChangeSelect = (selectedOption, name) => {
        setDisable(false);
        setFormValues({
            ...formValues,
            [name]: selectedOption,
        });
    };

    const onChangeMargin = (e) => {
        setDisable(false);
        const value = e.target.value;
        if (value === '' || value === null) {
            setFormValues({
                ...formValues,
                margin: 0,
            });
            return;
        }
        const numValue = parseInt(value);
        if(numValue > 20 || numValue < 0) return;
        setFormValues({
            ...formValues,
            margin: numValue,
        });
    };

    const handleValidation = () => {
        let isValid = false;
        if (formValues.show_note && formValues["notes"].trim() === "") {
            setError(
                getFormattedMessage(
                    "receipt-settigns.input.note.validate.label"
                )
            );
        } else {
            isValid = true;
        }
        return isValid;
    };

    const onEdit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            const payload = {
                ...formValues,
                receipt_other_font_style: formValues.other_font_style?.value ?? 0,
                receipt_label_font_style: formValues.label_font_style?.value ?? 0,
                receipt_paper_size: formValues.paper_size?.value ?? 0,
                receipt_thermal_size: formValues.thermal_size?.value ?? 0,
                receipt_margin: formValues.margin,
            };
            editReceiptSettings(payload);
            setDisable(true);
            setError("");
        }
    };

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText("receipt-settings.title")} />
            <HeaderTitle
                title={getFormattedMessage("receipt-settings.title")}
            />
            {isLoading ? (
                <Spinner />
            ) : (
                <div className="card">
                    <div className="card-body">
                        <Form onSubmit={onEdit}>
                            <div className="row">
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_note"
                                            checked={formValues.show_note}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-note.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_phone"
                                            checked={formValues.show_phone}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-phone.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_customer"
                                            checked={formValues.show_customer}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-customer.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_address"
                                            checked={formValues.show_address}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-address.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_email"
                                            checked={formValues.show_email}
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-email.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_tax_discount_shipping"
                                            checked={
                                                formValues.show_tax_discount_shipping
                                            }
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-discount-shipping.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="show_barcode_in_receipt"
                                            checked={
                                                formValues.show_barcode_in_receipt
                                            }
                                            onChange={handleInputChange}
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-barcode.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            name="show_logo_in_receipt"
                                            checked={
                                                formValues.show_logo_in_receipt
                                            }
                                            onChange={handleInputChange}
                                            className="form-check-input cursor-pointer"
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "settings.system-settings.select.logo.placeholder.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            name="show_product_code"
                                            checked={
                                                formValues.show_product_code
                                            }
                                            onChange={handleInputChange}
                                            className="form-check-input cursor-pointer"
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "receipt-settings.show-product-code.label"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            name="show_tax"
                                            checked={
                                                formValues.show_tax
                                            }
                                            onChange={handleInputChange}
                                            className="form-check-input cursor-pointer"
                                        />
                                        <label className="form-check-label">
                                            {getFormattedMessage(
                                                "show.tax.title"
                                            )}
                                        </label>
                                    </div>
                                </div>
                                <div className="col-12"/>
                                <div className="col-lg-4 mb-3">
                                    <ReactSelect
                                        title={getFormattedMessage(
                                            "labels.font.style.title"
                                        )}
                                        placeholder={"Normal"}
                                        value={formValues.label_font_style}
                                        defaultValue={formValues.label_font_style}
                                        data={Font_style}
                                        onChange={(selectedOption) => onChangeSelect(selectedOption, "label_font_style")}
                                        />
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <ReactSelect
                                        title={getFormattedMessage(
                                            "other.font.size.title"
                                        )}
                                        placeholder={"Normal"}
                                        value={formValues.other_font_style}
                                        defaultValue={formValues.other_font_style}
                                        data={Font_style}
                                        onChange={(selectedOption) => onChangeSelect(selectedOption, "other_font_style")}
                                        />
                                </div>
                                <div className="col-lg-4 mb-3">
                                    <ReactSelect
                                        title={getFormattedMessage(
                                            "globally.paper.size.title"
                                        )}
                                        name="paper_size"
                                        placeholder={"A4"}
                                        value={formValues.paper_size}
                                        defaultValue={formValues.paper_size}
                                        data={Paper_size}
                                        onChange={(selectedOption) => onChangeSelect(selectedOption, "paper_size")}
                                        />
                                </div>
                                { formValues.paper_size?.value == 1 && <div className="col-lg-4 mb-3">
                                    <ReactSelect
                                        title={getFormattedMessage(
                                            "globally.thermal.paper.size.title"
                                        )}
                                        name="thermal_size"
                                        placeholder={"58mm"}
                                        value={formValues.thermal_size}
                                        defaultValue={formValues.thermal_size}
                                        data={Thermal_sizes}
                                        onChange={(selectedOption) => onChangeSelect(selectedOption, "thermal_size")}
                                        />
                                </div>}
                                <div className="col-lg-4 mb-3">
                                    <label className="form-label">
                                           {getFormattedMessage("globally.margin.title")}
                                        :<span className="required" />
                                    </label>
                                    <input className="form-control" name="margin" type="number" value={formValues.margin} onChange={(e) => onChangeMargin(e)} placeholder="Enter Number of margin"/>
                                </div>
                                {formValues.show_note && (
                                    <div className="col-lg-12 mb-3">
                                        <label className="form-label">
                                            {getFormattedMessage(
                                                "globally.input.note.label"
                                            )}
                                            :<span className="required" />
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={2}
                                            placeholder={placeholderText(
                                                "globally.input.note.label"
                                            )}
                                            name="notes"
                                            value={formValues.notes}
                                            onChange={handleInputChange}
                                        />
                                        <span className="text-danger d-block fw-400 fs-small mt-2">
                                            {error ? error : ""}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <button
                                    disabled={disable}
                                    className="btn btn-primary"
                                    type="submit"
                                >
                                    {getFormattedMessage("globally.save-btn")}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}
        </MasterLayout>
    );
};

const mapStateToProps = (state) => {
    const { isLoading, settings } = state;
    return { isLoading, settings };
};

export default connect(mapStateToProps, {
    editReceiptSettings,
    fetchSetting,
})(ReceiptSettings);
