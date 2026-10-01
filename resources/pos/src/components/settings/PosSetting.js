import React, { useEffect, useState } from "react";
import MasterLayout from "../MasterLayout";
import HeaderTitle from "../header/HeaderTitle";
import {
    getFormattedMessage,
    placeholderText,
} from "../../shared/sharedMethod";
import TabTitle from "../../shared/tab-title/TabTitle";
import { useDispatch, useSelector } from "react-redux";
import {
    editPosSetting,
    fetchPosSetting,
} from "../../store/action/posSettingAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PosSetting = () => {
    const dispatch = useDispatch();
    const { posSettings } = useSelector((state) => state);

    const [posSettingValue, setPosSettingValue] = useState({
        enable_pos_click_audio: false,
        click_audio: "",
        show_pos_stock_product: false,
        auto_refresh_products: false,
        refresh_interval_seconds: "",
    });

    const [errors, setErrors] = useState({
        click_audio: "",
    });

    const [disable, setDisable] = useState(true);
    const [selectAudio, setSelectAudio] = useState(null);

    useEffect(() => {
        dispatch(fetchPosSetting());
    }, []);

    useEffect(() => {
        if (posSettings?.attributes) {
            setPosSettingValue({
                enable_pos_click_audio:
                    posSettings.attributes.enable_pos_click_audio === "true",
                click_audio: posSettings.attributes.click_audio || "",
                show_pos_stock_product:
                    posSettings.attributes.show_pos_stock_product === "true",
                auto_refresh_products:
                    posSettings.attributes.auto_refresh_products === "true",
                refresh_interval_seconds:
                    posSettings.attributes.refresh_interval_seconds || "",
            });
        }
    }, [posSettings]);

    const handleInputChange = (e) => {
        setDisable(false);
        const { name, value, type, checked } = e.target;
        setPosSettingValue((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setErrors({});
    };

    const onSelectAudio = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const audio = new Audio();
        audio.src = URL.createObjectURL(file);

        audio.onloadedmetadata = () => {
            if (audio.duration > 3) {
                setErrors((prev) => ({
                    ...prev,
                    click_audio: getFormattedMessage(
                        "pos.audio.length.tooltip.title"
                    ),
                }));
                e.target.value = "";
                return;
            }

            setDisable(false);
            setSelectAudio(file);
            setPosSettingValue((inputs) => ({
                ...inputs,
                [e.target.name]: file,
            }));
            setErrors({});
        };
    };

    const handleValidation = () => {
        let errorss = {};
        let isValid = false;
        if (
            posSettingValue.enable_pos_click_audio &&
            !posSettingValue.click_audio
        ) {
            errorss["click_audio"] = getFormattedMessage("pos.audio.required");
            isValid = false;
        } else if (
            posSettingValue.auto_refresh_products &&
            !posSettingValue.refresh_interval_seconds
        ) {
            errorss["refresh_interval_seconds"] = getFormattedMessage(
                "pos.refresh.interval.required"
            );
            isValid = false;
        } else {
            isValid = true;
        }
        setErrors(errorss);
        return isValid;
    };

    const prepareFormData = (data) => {
        const formData = new FormData();
        if (selectAudio && posSettingValue?.enable_pos_click_audio) {
            formData.append("click_audio", data.click_audio);
        }
        formData.append("enable_pos_click_audio", data.enable_pos_click_audio);
        formData.append("show_pos_stock_product", data.show_pos_stock_product);
        formData.append("auto_refresh_products", data.auto_refresh_products);
        formData.append(
            "refresh_interval_seconds",
            data.refresh_interval_seconds
        );
        return formData;
    };

    const onEdit = (event) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            dispatch(editPosSetting(prepareFormData(posSettingValue)));
            setDisable(true);
        }
    };

    const renderTooltip = () => (
        <Tooltip id="button-tooltip">
            {getFormattedMessage("pos.audio.length.tooltip.title")}
        </Tooltip>
    );

    return (
        <MasterLayout>
            <TabTitle title={placeholderText("pos.settings.title")} />
            <HeaderTitle title={getFormattedMessage("pos.settings.title")} />
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 col-lg-4 mb-4">
                            <div className="d-flex align-items-center mt-2">
                                <label className="form-check form-switch form-switch-sm">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "enable.pos.sound.title"
                                        )}
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            posSettingValue.enable_pos_click_audio
                                        }
                                        name="enable_pos_click_audio"
                                        onChange={(event) =>
                                            handleInputChange(event)
                                        }
                                        className="me-3 form-check-input cursor-pointer"
                                    />
                                </label>
                            </div>

                            <div className="row mt-3 g-3">
                                <div className="col-12 col-sm-6 col-lg-3 pos-audio-button">
                                    <label className="form-label d-flex align-items-center">
                                        {getFormattedMessage("pos.sound.title")}
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={renderTooltip()}
                                        >
                                            <span>
                                                <FontAwesomeIcon
                                                    className="ms-1"
                                                    icon={faQuestionCircle}
                                                />
                                            </span>
                                        </OverlayTrigger>
                                    </label>
                                    <div className="input-group">
                                        <label
                                            style={{
                                                cursor: posSettingValue?.enable_pos_click_audio
                                                    ? "pointer"
                                                    : "not-allowed",
                                            }}
                                            className={`btn ${
                                                posSettingValue?.enable_pos_click_audio
                                                    ? "btn-outline-primary"
                                                    : "border-secondary text-secondary"
                                            } w-100 text-start`}
                                        >
                                            <i className="bi bi-upload me-2"></i>{" "}
                                            {getFormattedMessage(
                                                "upload.audio.title"
                                            )}
                                            <input
                                                onChange={onSelectAudio}
                                                className="d-none"
                                                name="click_audio"
                                                type="file"
                                                accept=".mp3,audio/mp3"
                                                disabled={
                                                    !posSettingValue?.enable_pos_click_audio
                                                }
                                            />
                                        </label>
                                    </div>
                                </div>

                                {posSettingValue?.enable_pos_click_audio && (
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label">
                                            {getFormattedMessage(
                                                "preview.title"
                                            )}
                                        </label>
                                        <audio
                                            controls
                                            src={
                                                posSettingValue.click_audio
                                                    ? typeof posSettingValue.click_audio ===
                                                      "string"
                                                        ? posSettingValue.click_audio
                                                        : URL.createObjectURL(
                                                              posSettingValue.click_audio
                                                          )
                                                    : undefined
                                            }
                                            className="audio-preview w-100"
                                        />
                                    </div>
                                )}
                            </div>
                            <span className="text-danger d-block fw-400 fs-small">
                                {errors["click_audio"]
                                    ? errors["click_audio"]
                                    : null}
                            </span>
                        </div>

                        <div className="col-md-4 col-lg-4 mb-4">
                            <div className="d-flex align-items-center mt-2">
                                <label className="form-check form-switch form-switch-sm">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "auto.refresh.products.title"
                                        )}
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            posSettingValue.auto_refresh_products
                                        }
                                        name="auto_refresh_products"
                                        onChange={handleInputChange}
                                        className="me-3 form-check-input cursor-pointer"
                                    />
                                </label>
                            </div>

                            {posSettingValue.auto_refresh_products && (
                                <div className="mt-3">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "refresh.interval.seconds.title"
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="refresh_interval_seconds"
                                        className={`form-control`}
                                        value={
                                            posSettingValue.refresh_interval_seconds
                                        }
                                        onChange={handleInputChange}
                                        placeholder={placeholderText(
                                            "enter.seconds"
                                        )}
                                    />
                                    <span className="text-danger fw-400 fs-small">
                                        {errors["refresh_interval_seconds"]
                                            ? errors["refresh_interval_seconds"]
                                            : null}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="col-md-4 col-lg-4 mb-4">
                            <div className="d-flex align-items-center mt-2">
                                <label className="form-check form-switch form-switch-sm">
                                    <label className="form-label">
                                        {getFormattedMessage(
                                            "show.out.of.stock.product.in.pos"
                                        )}
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={
                                            posSettingValue.show_pos_stock_product
                                        }
                                        name="show_pos_stock_product"
                                        onChange={(event) =>
                                            handleInputChange(event)
                                        }
                                        className="me-3 form-check-input cursor-pointer"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            disabled={disable}
                            className="btn btn-primary mt-4"
                            onClick={(event) => onEdit(event)}
                        >
                            {getFormattedMessage("globally.save-btn")}
                        </button>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default PosSetting;
