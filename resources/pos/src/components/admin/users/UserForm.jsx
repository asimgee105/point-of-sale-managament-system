import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as EmailValidator from "email-validator";
import PhoneNumber from 'libphonenumber-js';
import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { connect, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import user from "../../../assets/images/avatar.png";
import ModelFooter from "../../../shared/components/modelFooter";
import ImagePicker from "../../../shared/image-picker/ImagePicker";
import ReactSelect from "../../../shared/select/reactSelect";
import {
    getAvatarName,
    getFormattedMessage,
    placeholderText
} from "../../../shared/sharedMethod";
import { changeUserPlan, editUser } from "../../../store/action/admin/adminUsersAction";
import { fetchPlans } from "../../../store/action/admin/plansAction";
import { comparePlans } from "../../../store/action/plansAction";
import { fetchStoreWarehouses } from "../../../store/action/storeAction";

const UserForm = (props) => {
    const {
        createUser,
        id,
        singleUser,
        isEdit,
        isCreate,
        plans,
        fetchPlans,
        changeUserPlan,
        frontSetting
    } = props;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlans();
    }, [])

    const [userValue, setUserValue] = useState({
        first_name: singleUser ? singleUser[0].first_name : "",
        last_name: singleUser ? singleUser[0].last_name : "",
        email: singleUser ? singleUser[0].email : "",
        phone: singleUser ? singleUser[0].phone : "",
        password: "",
        confirm_password: "",
        image: singleUser ? singleUser[0].image : "",
        plan_id: singleUser && singleUser[0]?.plan_name && singleUser[0]?.plan_id ? { label: singleUser[0].plan_name, value: singleUser[0].plan_id } : "",
    });

    const [errors, setErrors] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
        stores: "",
    });
    const [showPassword, setShowPassword] = useState({
        new: false,
        confirm: false,
    });

    const [isValidPhone, setIsValidPhone] = useState(false);
    const [selectStore, setSelectStore] = useState([]);
    const [changePlan, setChangePlan] = useState();

    const avatarName = getAvatarName(
        singleUser &&
        singleUser[0].image === "" &&
        singleUser[0].first_name &&
        singleUser[0].last_name &&
        singleUser[0].first_name + " " + singleUser[0].last_name
    );
    const newImg =
        singleUser &&
        singleUser[0].image &&
        singleUser[0].image === null &&
        avatarName;
    const [imagePreviewUrl, setImagePreviewUrl] = useState(newImg && newImg);
    const [selectImg, setSelectImg] = useState(null);
    const disabled = selectImg
        ? false
        : singleUser &&
        singleUser[0].first_name === userValue.first_name &&
        singleUser[0].last_name === userValue.last_name &&
        singleUser[0].email === userValue.email &&
        singleUser[0].phone === userValue.phone &&
        singleUser[0].image === userValue.image &&
        singleUser[0].plan_id === userValue.plan_id?.value

    useEffect(() => {
        setImagePreviewUrl(
            singleUser ? singleUser[0].image && singleUser[0].image : user
        );
    }, []);

    useEffect(() => {
        if (isEdit && userValue.phone) {
            setIsValidPhone(true);
        }
    }, [isEdit]);

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (!userValue["first_name"]) {
            errorss["first_name"] = getFormattedMessage(
                "user.input.first-name.validate.label"
            );
        } else if (!userValue["last_name"]) {
            errorss["last_name"] = getFormattedMessage(
                "user.input.last-name.validate.label"
            );
        } else if (!EmailValidator.validate(userValue["email"])) {
            if (!userValue["email"]) {
                errorss["email"] = getFormattedMessage(
                    "globally.input.email.validate.label"
                );
            } else {
                errorss["email"] = getFormattedMessage(
                    "globally.input.email.valid.validate.label"
                );
            }
        } else if (!userValue["phone"]) {
            errorss["phone"] = getFormattedMessage(
                "globally.input.phone-number.validate.label"
            );
        } else if (isValidPhone === false) {
            errorss["phone"] = getFormattedMessage(
                "user.input.valid.phone-number.validate.label"
            );
        } else if (!isEdit && !userValue["password"]) {
            errorss["password"] = getFormattedMessage(
                "user.input.password.validate.label"
            );
        } else if (!isEdit && userValue["password"]?.length < 6) {
            errorss["password"] = getFormattedMessage(
                "user.input.password.length.validate.label"
            );
        } else if (!isEdit && !userValue["confirm_password"]) {
            errorss["confirm_password"] = getFormattedMessage(
                "user.input.confirm-password.validate.label"
            );
        } else if (!isEdit && userValue["password"] !== userValue["confirm_password"]) {
            errorss["confirm_password"] = getFormattedMessage(
                "reset-password.password.validate.label"
            );
        } else if (changePlan?.new_plan_stores < selectStore.length) {
            errorss["stores"] = getFormattedMessage(
                "store.not.grater.validation.title"
            );
            isValid = false;
        } else {
            isValid = true;
        }

        setErrors(errorss);
        return isValid;
    };

    const validatePhoneNumber = (phoneNumber, country) => {
        const number = PhoneNumber('+' + phoneNumber, country?.countryCode);
        if (number?.isValid()) {
            return setIsValidPhone(true);
        } else {
            return setIsValidPhone(false);
        }
    };

    const onChangeInput = (e, country) => {
        if (e.target.name === 'phone') {
            validatePhoneNumber(e.target.value, country)
        }

        setUserValue((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
        setErrors("");
    };

    const handleImageChanges = (e) => {
        e.preventDefault();
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/svg+xml") {
                setSelectImg(file);
                const fileReader = new FileReader();
                fileReader.onloadend = () => {
                    setImagePreviewUrl(fileReader.result);
                };
                fileReader.readAsDataURL(file);
                setErrors("");
            }
        }
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        formData.append("first_name", data.first_name);
        formData.append("last_name", data.last_name);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        if (data.stores) {
            formData.append("stores", data.stores);
        }
        if (data.plan_id?.value) {
            formData.append("plan_id", data.plan_id?.value);
        }
        if (!isEdit) {
            formData.append("password", data.password);
            formData.append("confirm_password", data.confirm_password);
        }
        if (selectImg) {
            formData.append("image", data.image);
        }
        if (isEdit) {
            formData.append("_method", "PATCH");
        }
        return formData;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        userValue.image = selectImg;
        const valid = handleValidation();
        if (singleUser && valid) {
            if (!disabled) {
                userValue.image = selectImg;
                dispatch(editUser(id,
                    prepareFormData({
                        ...userValue,
                        ...(changePlan?.current_plan_stores > changePlan?.new_plan_stores &&
                            changePlan?.user_active_stores > changePlan?.new_plan_stores &&
                            { stores: selectStore }),
                    }), navigate));
            }
        } else {
            if (valid) {
                setUserValue(userValue);
                createUser(prepareFormData(userValue));
                setImagePreviewUrl(imagePreviewUrl ? imagePreviewUrl : user);
            }
        }
    };
    const handleHideShowPassword = (type) => {
        if (type === "new") {
            setShowPassword({ ...showPassword, new: !showPassword.new });
        } else if (type === "confirm") {
            setShowPassword({
                ...showPassword,
                confirm: !showPassword.confirm,
            });
        }
    };

    const onPlanChange = (obj) => {
        const playload = {
            plan_id: obj.value,
            user_id: id
        }
        setUserValue((user) => ({ ...user, plan_id: obj }));
        setErrors("");
        if (isEdit) {
            dispatch(changeUserPlan(playload, setChangePlan));
        }
    };

    const handleChanged = (event, store) => {
        const { checked } = event.target;
        let storeData = [...selectStore];
        if (checked) {
            storeData.push(store.id);
        } else {
            storeData = storeData.filter(id => id !== store.id);
        }
        setSelectStore(storeData);
    };

    useEffect(() => {
        if (changePlan) {
            const activeStoreIds = Object.values(changePlan?.user_stores || {}).filter(store => store.active).map(store => store.id);
            // const activeStoreIds = changePlan?.user_stores.filter(store => store.active).map(store => store.id);
            setSelectStore(activeStoreIds);
        }
    }, [changePlan]);

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
                                    "user.input.first-name.label"
                                )}{" "}
                                :<span className="required" />
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                value={userValue.first_name}
                                placeholder={placeholderText(
                                    "user.input.first-name.placeholder.label"
                                )}
                                className="form-control"
                                autoFocus={true}
                                onChange={(e) => onChangeInput(e)}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["first_name"]
                                    ? errors["first_name"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "user.input.last-name.label"
                                )}
                                :
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                name="last_name"
                                className="form-control"
                                placeholder={placeholderText(
                                    "user.input.last-name.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={userValue.last_name}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["last_name"]
                                    ? errors["last_name"]
                                    : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage("globally.input.email.label")}:
                            </label>
                            <span className="required" />
                            <input
                                type="text"
                                name="email"
                                className="form-control"
                                placeholder={placeholderText(
                                    "globally.input.email.placeholder.label"
                                )}
                                onChange={(e) => onChangeInput(e)}
                                value={userValue.email}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["email"] ? errors["email"] : null}
                            </span>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                {getFormattedMessage(
                                    "globally.input.phone-number.label"
                                )}
                                :
                            </label>
                            <span className="required" />

                            <PhoneInput
                                country={frontSetting.value?.default_country_code ?? "in"}
                                placeholder={placeholderText("globally.input.phone-number.placeholder.label")}
                                autocompleteSearch
                                value={userValue.phone}
                                onChange={(phone, country) => onChangeInput({ target: { name: "phone", value: phone } }, country)}
                                containerClass="phone-input-container"
                                inputClass="form-control"
                                inputProps={{
                                    name: "phone",
                                    required: true,
                                }}
                                enableSearch={true}
                            />
                            <span className="text-danger d-block fw-400 fs-small mt-2">
                                {errors["phone"] ? errors["phone"] : null}
                            </span>
                        </div>
                        {isEdit ? (
                            ""
                        ) : (
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage(
                                        "user.input.password.label"
                                    )}
                                    :
                                </label>
                                <span className="required" />
                                <div className="input-group">
                                    <input
                                        type={
                                            showPassword.new
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        placeholder={placeholderText(
                                            "user.input.password.placeholder.label"
                                        )}
                                        className="form-control"
                                        value={userValue.password}
                                        onChange={(e) => onChangeInput(e)}
                                    />
                                    <span
                                        className="showpassword"
                                        onClick={() =>
                                            handleHideShowPassword("new")
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showPassword.new
                                                    ? faEye
                                                    : faEyeSlash
                                            }
                                            className="top-0 m-0 fa"
                                        />
                                    </span>
                                </div>
                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                    {errors["password"]
                                        ? errors["password"]
                                        : null}
                                </span>
                            </div>
                        )}
                        {isEdit ? (
                            ""
                        ) : (
                            <div className="col-md-6 mb-3">
                                <label className="form-label">
                                    {getFormattedMessage(
                                        "user.input.confirm-password.label"
                                    )}
                                    :
                                </label>
                                <span className="required" />
                                <div className="input-group">
                                    <input
                                        type={
                                            showPassword.confirm
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirm_password"
                                        className="form-control"
                                        placeholder={placeholderText(
                                            "user.input.confirm-password.placeholder.label"
                                        )}
                                        onChange={(e) => onChangeInput(e)}
                                        value={userValue.confirm_password}
                                    />
                                    <span
                                        className="showpassword"
                                        onClick={() =>
                                            handleHideShowPassword("confirm")
                                        }
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                showPassword.confirm
                                                    ? faEye
                                                    : faEyeSlash
                                            }
                                            className="top-0 m-0 fa"
                                        />
                                    </span>
                                </div>
                                <span className="text-danger d-block fw-400 fs-small mt-2">
                                    {errors["confirm_password"]
                                        ? errors["confirm_password"]
                                        : null}
                                </span>
                            </div>
                        )}
                        <div className="col-md-6">
                            <ReactSelect
                                title={getFormattedMessage(
                                    "plan.title"
                                )}
                                placeholder={placeholderText(
                                    "select-plan.title"
                                )}
                                value={userValue?.plan_id}
                                data={plans}
                                onChange={onPlanChange}
                                isRequired
                            />
                        </div>
                        <div className="col-md-6">
                            <ImagePicker
                                user={user}
                                isCreate={isCreate}
                                avtarName={avatarName}
                                imageTitle={placeholderText(
                                    "globally.input.change-image.tooltip"
                                )}
                                imagePreviewUrl={imagePreviewUrl}
                                handleImageChange={handleImageChanges}
                            />
                        </div>
                        {changePlan?.current_plan_stores > changePlan?.new_plan_stores &&
                            changePlan?.user_active_stores > changePlan?.new_plan_stores &&
                            (
                                <div className="card plan-warning">
                                    <div className="text-center mb-4">
                                        <h5 className="fw-bold text-warning mb-2">
                                            ⚠️ {getFormattedMessage("plan.downgrade.warning.title")}
                                        </h5>
                                        <p className="text-muted mb-0">
                                            {getFormattedMessage("plan.warning.message.title")}
                                        </p>
                                        <p className="text-muted">
                                            {getFormattedMessage("plan.warning.message2.title")}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            {getFormattedMessage("store.title")} <span className="required">*</span>
                                        </label>
                                        <div className="row g-3">
                                            {Object.values(changePlan?.user_stores || {}).map((store, index) => (
                                                <div className="col-md-3 col-sm-6" key={index}>
                                                    <div className="form-check form-switch d-flex align-items-center">
                                                        <input
                                                            className="form-check-input me-2"
                                                            type="checkbox"
                                                            disabled={store.active}
                                                            id={`store-${store?.id}`}
                                                            name={store?.name}
                                                            value={store?.name}
                                                            checked={selectStore.includes(store?.id)}
                                                            onChange={(e) => handleChanged(e, store)}
                                                        />
                                                        <label className="form-check-label" htmlFor={`store-${store?.id}`}>
                                                            {getFormattedMessage(store?.name)}
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-danger d-block fw-400 fs-small mt-2">
                                            {errors["stores"] ? errors["stores"] : null}
                                        </span>
                                    </div>
                                </div>
                            )}
                        <ModelFooter
                            onEditRecord={singleUser}
                            onSubmit={onSubmit}
                            editDisabled={disabled}
                            link="/app/admin/users"
                            addDisabled={!userValue.first_name}
                        />
                    </div>
                </Form>
            </div>
        </div>
    );
};


const mapStateToProps = (state) => {
    const { plans, frontSetting } = state;
    return { plans, frontSetting}
};

export default connect(mapStateToProps, { fetchPlans, changeUserPlan })(UserForm);
