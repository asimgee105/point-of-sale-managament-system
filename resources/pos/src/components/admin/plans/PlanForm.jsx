import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { frequencies, planFeatures } from "../../../constants";
import ModelFooter from "../../../shared/components/modelFooter";
import ReactSelect from "../../../shared/select/reactSelect";
import {
    getFormattedMessage,
    getFormattedOptions,
    placeholderText
} from "../../../shared/sharedMethod";
import { fetchCurrencies } from "../../../store/action/currencyAction";
import { editPlan } from "../../../store/action/admin/plansAction";

const PlanForm = (props) => {
    const {
        singlePlan,
        createPlan,
        id,
        fetchCurrencies,
        currencies
    } = props;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [planValue, setPlanValue] = useState({
        name: singlePlan ? singlePlan[0].name : "",
        price: singlePlan ? singlePlan[0].price : "",
        frequency: singlePlan ? singlePlan[0].frequency : {
            label: getFormattedMessage("monthly.title"),
            value: 2,
        },
        currency_id: singlePlan ? singlePlan[0].currency_id : null,
        trial_days: singlePlan ? singlePlan[0].trial_days : "",
        no_of_stores: singlePlan ? singlePlan[0].no_of_stores : "",
    });

    useEffect(() => {
        fetchCurrencies()
    }, [])

    const [errors, setErrors] = useState({
        name: "",
        price: "",
        frequency: "",
        currency_id: "",
        features: ""
    });

    const disabled = singlePlan &&
        singlePlan[0].name === planValue.name &&
        singlePlan[0].price === planValue.price &&
        singlePlan[0].frequency?.value == planValue.frequency?.value &&
        singlePlan[0].no_of_stores == planValue.no_of_stores &&
        singlePlan[0].trial_days === planValue.trial_days &&
        singlePlan[0].currency_id == planValue.currency_id?.value

    const [features, setFeatures] = useState(planFeatures);
    const [allChecked, setAllChecked] = useState(false)

    useEffect(() => {
        if (singlePlan && singlePlan.length === 1 && singlePlan[0]?.features) {
            const featureData = singlePlan[0].features;
            const updatedFeatures = planFeatures.map(feature => ({
                ...feature,
                selected: featureData[feature.key] == 1
            }));
            setFeatures(updatedFeatures);
        }
    }, [singlePlan]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = true;

        // Name validation
        if (!planValue["name"]) {
            errorss["name"] = getFormattedMessage("globally.input.name.validate.label");
            isValid = false;
        } else if (!planValue["price"]) {
            errorss["price"] = getFormattedMessage("price.input.validate.label");
            isValid = false;
        } else if (!planValue["currency_id"]) {
            errorss["currency_id"] = getFormattedMessage("currency.input.validate.label");
            isValid = false;
        } else if (!planValue["no_of_stores"]) {
            errorss["no_of_stores"] = getFormattedMessage("number.of.stores.validate.title");
            isValid = false;
        } else if (!planValue["frequency"]) {
            errorss["frequency"] = getFormattedMessage("frequency.input.validate.label");
            isValid = false;
        }
        if (!features.some(feature => feature.selected)) {
            errorss["features"] = getFormattedMessage("features.validate.label");
            isValid = false;
        }
        setErrors(errorss);
        return isValid;
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setPlanValue((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
        setErrors("");
    };

    const formattedFrequencyOptions = getFormattedOptions(frequencies)

    const onSubmit = (event) => {
        event.preventDefault();
        const valid = handleValidation();

        const selectedFeatures = features
            .filter(feature => feature.selected)
            .map((key) => key.key);

        const formattedData = { ...planValue, frequency: planValue.frequency?.value, currency_id: planValue?.currency_id?.value, features: selectedFeatures }
        if (singlePlan && valid) {
            if (!disabled) {
                dispatch(editPlan(id, formattedData, navigate));
            }
        } else {
            if (valid) {
                setPlanValue(planValue);
                createPlan(formattedData);
            }
        }
    };

    const onFrequencyChange = (obj) => {
        setPlanValue((plan) => ({ ...plan, frequency: obj }));
        setErrors("");
    };

    const onCurrencyChange = (obj) => {
        setPlanValue((plan) => ({ ...plan, currency_id: obj }));
        setErrors("");
    };

    const handleChanged = (event) => {
        let itemName = event.target.name;
        let checked = event.target.checked;

        if (itemName === "all_check") {
            setAllChecked(!allChecked);
            setFeatures(features.map(item => ({ ...item, selected: checked })));
        } else {
            setFeatures(features.map(item =>
                item.key === itemName ? { ...item, selected: checked } : item
            ));
        }
    };

    useEffect(() => {
        setAllChecked(features.every(item => item.selected));
    }, [features, allChecked]);

    return (
        <div className="card">
            <div className="card-body">
                <Form>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="exampleInputEmail1"
                                className="form-label"
                            >
                                {getFormattedMessage(
                                    "globally.input.name.label"
                                )}
                                :<span className="required" />
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={planValue.name}
                                placeholder={placeholderText(
                                    "globally.input.name.label"
                                )}
                                className="form-control"
                                autoFocus={true}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["name"]
                                    ? errors["name"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-6">
                            <ReactSelect
                                title={getFormattedMessage(
                                    "frequency.title"
                                )}
                                placeholder={placeholderText(
                                    "frequency.title"
                                )}
                                defaultValue={planValue?.frequency}
                                value={planValue?.frequency}
                                multiLanguageOption={formattedFrequencyOptions}
                                onChange={onFrequencyChange}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="exampleInputEmail1"
                                className="form-label"
                            >
                                {getFormattedMessage(
                                    "price.title"
                                )}
                                :<span className="required" />
                            </label>
                            <input
                                type="number"
                                name="price"
                                min={0}
                                value={planValue.price}
                                placeholder={placeholderText(
                                    "price.title"
                                )}
                                className="form-control"
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["price"]
                                    ? errors["price"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-6">
                            <ReactSelect
                                title={getFormattedMessage(
                                    "currency.title"
                                )}
                                placeholder={placeholderText(
                                    "currency.title"
                                )}
                                value={planValue?.currency_id}
                                data={currencies}
                                onChange={onCurrencyChange}
                                errors={errors["currency_id"]}
                            />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label
                                className="form-label"
                            >
                                {getFormattedMessage(
                                    "number.of.stores.title"
                                )}
                                :<span className="required" />
                            </label>
                            <input
                                type="number"
                                name="no_of_stores"
                                value={planValue.no_of_stores}
                                placeholder={placeholderText(
                                    "number.of.stores.placeholder"
                                )}
                                className="form-control"
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["no_of_stores"]
                                    ? errors["no_of_stores"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label
                                htmlFor="exampleInputEmail1"
                                className="form-label"
                            >
                                {getFormattedMessage(
                                    "trial-days.title"
                                )}
                                :
                            </label>
                            <input
                                type="number"
                                name="trial_days"
                                min={0}
                                value={planValue.trial_days}
                                placeholder={placeholderText(
                                    "trial-days.title"
                                )}
                                className="form-control"
                                onChange={(e) => onChangeInput(e)}
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <div className="row">
                                <div className="d-flex col-md-12 flex-wrap align-items-center">
                                    <label
                                        className="form-label"
                                    >
                                        {getFormattedMessage(
                                            "features.title"
                                        )}
                                        <span className="required" />
                                        :
                                    </label>
                                    <div className="d-flex col-md-6 flex-wrap ps-5">
                                        <div className="col-md-8">
                                            <label
                                                className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label"
                                            >
                                                <input type="checkbox" checked={allChecked}
                                                    name="all_check"
                                                    onChange={(event) => handleChanged(event)}
                                                    className="me-3 form-check-input cursor-pointer" />
                                                <div className="control__indicator" />
                                                {getFormattedMessage("select-all.features.label")}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex col-md-12 flex-wrap">
                                    {features.map((feature, index) => (
                                        <div className="col-md-6" key={index}>
                                            <label
                                                className="form-check form-check-custom form-check-solid form-check-inline d-flex align-items-center my-3 cursor-pointer custom-label"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name={feature.key}
                                                    value={feature.key}
                                                    checked={features[index].selected}
                                                    onChange={(event) => handleChanged(event)}
                                                    className="me-3 form-check-input cursor-pointer"
                                                />
                                                <div className="control__indicator" />
                                                {getFormattedMessage(feature.name)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                    {errors["features"] ? errors["features"] : null}
                                </span>
                            </div>
                        </div>
                        <ModelFooter
                            onEditRecord={singlePlan}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            link="/app/admin/plans"
                            addDisabled={!planValue.name}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};


const mapStateToProps = (state) => {
    const { currencies } = state;
    return { currencies }
};

export default connect(mapStateToProps, { fetchCurrencies })(PlanForm);
