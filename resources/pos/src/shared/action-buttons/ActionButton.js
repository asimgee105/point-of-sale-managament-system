import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClone,
    faEye,
    faKey,
    faPenToSquare,
    faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
    getFormattedMessage,
    getFormattedOptions,
    placeholderText,
} from "../sharedMethod";
import {
    cashPaymentStatusMethodOptions,
    PLAN_STATUS,
} from "../../constants";
import ReactSelect from "../select/reactSelect";

const ActionButton = (props) => {
    const {
        goToEditProduct,
        item,
        isPasswordShow = false,
        goToChangePassword,
        onClickDeleteModel = true,
        isDeleteMode = true,
        isEditMode = true,
        goToDetailScreen,
        isViewIcon = false,
        onStatusChange,
        isActionDropDown = false,
        isCustomWidth = false,
        isDuplicateShow = false,
        onClickDuplicate
    } = props;
    const cashPaymentStatusMethodOption = getFormattedOptions(
        cashPaymentStatusMethodOptions
    );
    const cashPaymentStatusMethodOptionValue =
        cashPaymentStatusMethodOption?.map((option) => {
            return {
                value: option.id,
                label: option.name,
            };
        });

    return (
        <>
            {isPasswordShow ? (
                <button
                    title={placeholderText("user.input.password.label")}
                    className="btn text-warning px-1 fs-3 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToChangePassword(item.id);
                    }}
                >
                    <FontAwesomeIcon icon={faKey} />
                </button>
            ) : null}
            {isDuplicateShow ? (
                <button
                    title={placeholderText("duplicate.title")}
                    className="btn text-warning px-1 fs-3 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickDuplicate(item.id);
                    }}
                >
                    <FontAwesomeIcon icon={faClone} />
                </button>
            ) : null}
            {isViewIcon ? (
                <button
                    title={placeholderText("globally.view.tooltip.label")}
                    className="btn text-success px-1 fs-3 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToDetailScreen(item.id);
                    }}
                >
                    <FontAwesomeIcon icon={faEye} />
                </button>
            ) : null}
            {isEditMode === false ? null : (
                <button
                    title={placeholderText("globally.edit-btn")}
                    className="btn text-primary px-1 fs-3 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        goToEditProduct(item);
                    }}
                >
                    <FontAwesomeIcon icon={faPenToSquare} />
                </button>
            )}
            {isDeleteMode === false ? null : (
                <button
                    title={placeholderText("globally.delete.tooltip.label")}
                    className="btn pe-0 text-danger px-1 fs-3 border-0"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickDeleteModel(item);
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
            {isActionDropDown ? (
                item.status == PLAN_STATUS.ACTIVE ? (
                    <span className="badge bg-light-success">
                        <div>
                            {getFormattedMessage("globally.approved.label")}
                        </div>
                    </span>
                ) : item.status == PLAN_STATUS.REJECTED ? (
                    <span className="badge bg-light-danger">
                        <div>
                            {getFormattedMessage("rejected.title")}
                        </div>
                    </span>
                ) : item.status == PLAN_STATUS.INACTIVE ? (
                    <span className="badge bg-light-warning">
                        <div>
                            {getFormattedMessage("in-active.status.lable")}
                        </div>
                    </span>
                ) : (
                    <div style={{ width: isCustomWidth ? "" : "width: 117px" }}>
                        <ReactSelect
                            isCustomWidth={isCustomWidth}
                            isRequired
                            defaultValue={cashPaymentStatusMethodOptionValue[0]}
                            multiLanguageOption={cashPaymentStatusMethodOption}
                            onChange={(e) => onStatusChange(e.value, item?.id)}
                        />
                    </div>
                )
            ) : null}
        </>
    );
};
export default ActionButton;
