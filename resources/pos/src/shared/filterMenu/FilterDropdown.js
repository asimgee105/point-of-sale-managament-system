import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { Dropdown } from "react-bootstrap";
import ReactSelect from "../select/reactSelect";
import { getFormattedMessage, getFormattedOptions } from "../sharedMethod";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    baseUnitOptions,
    cashPaymentStatusOptions,
    paymentStatusOptions,
    paymentTypeOptions,
    planPaymentTypeOptions,
    planTypeOptions,
    quotationFilterStatusOptions,
    statusOptions,
    subsctiptionStatusOptions,
    transferStatusOptions,
} from "../../constants";
import { fetchAllBaseUnits } from "../../store/action/baseUnitsAction";
import { Button } from "react-bootstrap-v5";
import { fetchAllBrands } from "../../store/action/brandsAction";
import { fetchAllProductCategories } from "../../store/action/productCategoryAction";
import { setProductUnitId } from "../../store/action/productUnitIdAction";
import { fetchPlans } from "../../store/action/plansAction";

const FilterDropdown = (props) => {
    const {
        onExcelClick,
        goToImport,
        setPaymentStatusData,
        setStatusData,
        isUnitFilter,
        isStatus,
        isQuotationStatus,
        isPaymentStatus,
        setProductUnitData,
        title,
        onResetClick,
        setPaymentTypeData,
        isPaymentType,
        isWarehouseType,
        onWarehouseChange,
        warehouseOptions,
        tableWarehouseValue,
        isTransferStatus,
        setTransferStatusData,
        fetchAllBaseUnits,
        base,
        isExportDropdown,
        isImportDropdown,
        isProductCategoryFilter,
        isBrandFilter,
        brands,
        productCategories,
        setBrandData,
        setProductCategoryData,
        brandFilterTitle,
        productCategoryFilterTitle,
        fetchAllBrands,
        fetchAllProductCategories,
        isSubscriptionStatus,
        isPlanPaymentType,
        isPlanType,
        setPlanTypeData,
        isCashPaymentStatus,
        isPlanNameFilter,
        fetchPlans,
        setPlanNameData,
        filters,
    } = props;

    const dispatch = useDispatch();
    const isReset = useSelector((state) => state.resetOption);
    const isShow = useSelector((state) => state.dropDownToggle);
    const paymentMethods = useSelector((state) => state.paymentMethods);
    const plans = useSelector((state) => state.plans);
    const menuRef = useRef(null);
    const baseUnitFilterOptions = getFormattedOptions(baseUnitOptions);
    const statusFilterOptions = getFormattedOptions(statusOptions);
    const quotationStatusFilterOptions = getFormattedOptions(quotationFilterStatusOptions);
    const subscriptionStatusFilterOptions = getFormattedOptions(subsctiptionStatusOptions);
    const cashPaymentFilterStatusOptions = getFormattedOptions(cashPaymentStatusOptions);
    const planPaymentTypeFilterOptions = getFormattedOptions(planPaymentTypeOptions);
    const planTypeFilterOptions = getFormattedOptions(planTypeOptions);
    const paymentFilterOptions = getFormattedOptions(paymentStatusOptions);
    const [productUnit, setProductUnit] = useState();
    const [brand, setBrand] = useState();
    const [productCategory, setProductCategory] = useState();
    const [status, setStatus] = useState();
    const [transferStatus, setTransferStatus] = useState();
    const [paymentStatus, setPaymentStatus] = useState();
    const [paymentType, setPaymentType] = useState();
    const [planType, setPlanType] = useState();
    const [planName, setPlanName] = useState();

    const formattedPaymentMethods = [
        { value: 0, label: getFormattedMessage("unit.filter.all.label") },
        ...(
            paymentMethods?.length > 0
                ? paymentMethods
                    .filter(p => p.attributes.status == 1)
                    .map(p => ({
                        value: p.id,
                        label: p.attributes.name
                    }))
                : []
        )
    ];

    const formattedPlans = [
        { value: 0, label: getFormattedMessage("unit.filter.all.label") },
        ...(
            plans?.length > 0
                ? plans.map(p => ({
                        value: p.id,
                        label: p.attributes.name
                    }))
                : []
        )
    ];

    useEffect(() => {
        if(isBrandFilter){
            fetchAllBrands();
        }
        if(isProductCategoryFilter){
            fetchAllProductCategories();
        }
        if(isUnitFilter){
            fetchAllBaseUnits();
        }
        if(isPlanNameFilter) {
            fetchPlans();
        }
    }, [fetchAllBaseUnits, fetchAllBrands, fetchAllProductCategories, fetchPlans]);

    const transferStatusFilterOptions = getFormattedOptions(
        transferStatusOptions
    );

    let unitDefaultValue = baseUnitFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    let baseOptions = [{ value: "0", label: "All" }, ...base];

    const statusDefaultValue = statusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const quotationStatusDefaultValue = quotationStatusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const subscriptionStatusDefaultValue = subscriptionStatusFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const planTypeDefaultValue = planTypeFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const planPaymentTypeDefaultValue = planPaymentTypeFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const cashPaymentStatusDefaultValue = cashPaymentFilterStatusOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const transferStatusDefaultValue = transferStatusFilterOptions.map(
        (option) => {
            return {
                value: option.id,
                label: option.name,
            };
        }
    );

    const paymentStatusDefaultValue = paymentFilterOptions.map((option) => {
        return {
            value: option.id,
            label: option.name,
        };
    });

    const warehouseDefaultValue =
        warehouseOptions &&
        warehouseOptions.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    let brandDefaultValue =
        brands &&
        brands.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    brandDefaultValue = [{ value: "0", label: "All" }, ...brandDefaultValue];

    let productCategoryDefaultValue =
        productCategories &&
        productCategories.map((option) => {
            return {
                value: option.id,
                label: option.attributes.name,
            };
        });

    productCategoryDefaultValue = [
        { value: "0", label: "All" },
        ...productCategoryDefaultValue,
    ];

    const onReset = () => {
        dispatch({ type: "RESET_OPTION", payload: true });
        dispatch(setProductUnitId(0));
        setProductUnit({ label: "All", value: "0" });
        setProductUnitData({ label: "All", value: "0" });
        setBrand({ label: "All", value: "0" });
        setStatus({ label: "All", value: "0" });
        setProductCategory({ label: "All", value: "0" });
        setTransferStatus({ label: "All", value: "0" });
        setPaymentStatus({ label: "All", value: "0" });
        setPaymentType({ label: "All", value: "0" });
        setPlanType({ label: "All", value: "0" });
        setPlanName({ label: "All", value: "0" });
        onResetClick();
    };

    const onToggle = () => {
        dispatch({ type: "ON_TOGGLE", payload: !isShow });
    };

    const escFunction = useCallback((event) => {
        if (event.keyCode === 27) {
            dispatch({ type: "ON_TOGGLE", payload: false });
        }
    }, []);

    useEffect(() => {
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, []);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (menuRef?.current?.contains(event.target)) {
                return;
            }
            dispatch({ type: "ON_TOGGLE", payload: false });
        };
        document.body.addEventListener("click", onClickOutside);
        return () => {
            document.body.removeEventListener("click", onClickOutside);
        };
    }, []);

    const onProductUnitChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        dispatch(setProductUnitId(obj.value));
        dispatch({ type: "ON_TOGGLE", payload: false });
        setProductUnit(obj);
        setProductUnitData(obj);
    };

    const onBrandChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setBrand(obj);
        setBrandData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onProductCategoryChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setProductCategory(obj);
        setProductCategoryData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setStatus(obj);
        setStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onTransferStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setTransferStatus(obj);
        setTransferStatusData(obj);
        setStatus(obj);
        setStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPaymentTypeChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPaymentType(obj);
        setPaymentTypeData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };
    
    const onPlanNameChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPlanName(obj);
        setPlanNameData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPlanTypeChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPlanType(obj);
        setPlanTypeData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };

    const onPaymentStatusChange = (obj) => {
        dispatch({ type: "RESET_OPTION", payload: false });
        setPaymentStatus(obj);
        setPaymentStatusData(obj);
        dispatch({ type: "ON_TOGGLE", payload: false });
    };
    return (
        <Dropdown
            className="mb-2 filter-dropdown order-1 order-sm-0"
            show={isShow}
            ref={menuRef}
        >
            <Dropdown.Toggle
                variant="primary"
                className="text-white btn-icon hide-arrow"
                id="filterDropdown"
                onClick={() => onToggle()}
            >
                <FontAwesomeIcon icon={faFilter} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="px-7 py-5">
                {isStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={statusFilterOptions}
                            onChange={onStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "globally.detail.status"
                            )}
                            value={isReset ? statusDefaultValue[0] : status}
                            isRequired
                            defaultValue={statusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isQuotationStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={quotationStatusFilterOptions}
                            onChange={onStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "globally.detail.status"
                            )}
                            value={isReset ? quotationStatusDefaultValue[0] : status}
                            isRequired
                            defaultValue={quotationStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isSubscriptionStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={subscriptionStatusFilterOptions}
                            onChange={onStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "globally.detail.status"
                            )}
                            value={isReset ? subscriptionStatusDefaultValue[0] : status}
                            isRequired
                            defaultValue={subscriptionStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isCashPaymentStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={cashPaymentFilterStatusOptions}
                            onChange={onStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "globally.detail.status"
                            )}
                            value={isReset ? cashPaymentStatusDefaultValue[0] : status}
                            isRequired
                            defaultValue={cashPaymentStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPlanType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={planTypeFilterOptions}
                            onChange={onPlanTypeChange}
                            name="plan_type"
                            title={getFormattedMessage(
                                "plan.type.title"
                            )}
                            value={isReset ? planTypeDefaultValue[0] : planType}
                            isRequired
                            defaultValue={planTypeDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "plan.type.title"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPlanPaymentType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={planPaymentTypeFilterOptions}
                            onChange={onPaymentTypeChange}
                            name="payment_type"
                            title={getFormattedMessage(
                                "select.payment-type.label"
                            )}
                            value={isReset ? planPaymentTypeDefaultValue[0] : paymentType}
                            isRequired
                            defaultValue={planPaymentTypeDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "select.payment-type.label"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPaymentStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="2"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={paymentFilterOptions}
                            onChange={onPaymentStatusChange}
                            name="payment_status"
                            title={getFormattedMessage(
                                "globally.detail.payment.status"
                            )}
                            value={
                                isReset
                                    ? paymentStatusDefaultValue[0]
                                    : paymentStatus
                            }
                            isRequired
                            defaultValue={paymentStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.payment.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isUnitFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onProductUnitChange}
                            name="product_unit"
                            title={title}
                            value={isReset ? unitDefaultValue[0] : productUnit}
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={title}
                            data={baseOptions}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPlanNameFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="4"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            title={getFormattedMessage('plans.title')}
                            data={formattedPlans}
                            name='plan_id'
                            value={planName}
                            placeholder={getFormattedMessage('plans.title')}
                            defaultValue={formattedPlans[0]}
                            onChange={onPlanNameChange}
                        />
                    </Dropdown.Header>
                ) : null}
                {isPaymentType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="4"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            title={getFormattedMessage('select.payment-type.label')}
                            data={formattedPaymentMethods}
                            name='payment_type'
                            value={paymentType}
                            placeholder={getFormattedMessage('select.payment-type.label')}
                            defaultValue={formattedPaymentMethods[0]}
                            onChange={onPaymentTypeChange}
                        />
                    </Dropdown.Header>
                ) : null}
                {isWarehouseType ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="4"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            data={warehouseOptions}
                            onChange={onWarehouseChange}
                            name="payment_type"
                            title={getFormattedMessage(
                                "warehouse.title"
                            )}
                            value={
                                isReset
                                    ? warehouseDefaultValue[0]
                                    : tableWarehouseValue
                            }
                            isRequired
                            defaultValue={warehouseDefaultValue[0]}
                        />
                    </Dropdown.Header>
                ) : null}
                {isTransferStatus ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            multiLanguageOption={transferStatusFilterOptions}
                            onChange={onTransferStatusChange}
                            name="status"
                            title={getFormattedMessage(
                                "globally.detail.status"
                            )}
                            value={
                                isReset
                                    ? transferStatusDefaultValue[0]
                                    : transferStatus
                            }
                            isRequired
                            defaultValue={transferStatusDefaultValue[0]}
                            placeholder={getFormattedMessage(
                                "globally.detail.status"
                            )}
                        />
                    </Dropdown.Header>
                ) : null}
                {isBrandFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onBrandChange}
                            name="brand"
                            title={brandFilterTitle}
                            value={isReset ? unitDefaultValue[0] : brand}
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={brandFilterTitle}
                            data={brandDefaultValue}
                        />
                    </Dropdown.Header>
                ) : null}
                {isProductCategoryFilter ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="3"
                        className="mb-5 p-0"
                    >
                        <ReactSelect
                            onChange={onProductCategoryChange}
                            name="product_category"
                            title={productCategoryFilterTitle}
                            value={
                                isReset ? unitDefaultValue[0] : productCategory
                            }
                            isRequired
                            defaultValue={unitDefaultValue[0]}
                            placeholder={productCategoryFilterTitle}
                            data={productCategoryDefaultValue}
                        />
                    </Dropdown.Header>
                ) : null}
                {isExportDropdown ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => onExcelClick(filters)}
                            className="me-md-0 btn-light-primary  w-100"
                        >
                            {" "}
                            {getFormattedMessage("product.export.title")}
                        </Button>
                    </Dropdown.Header>
                ) : null}
                {isImportDropdown ? (
                    <Dropdown.Header
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        eventkey="1"
                        className="mb-5 p-0"
                    >
                        <Button
                            variant="primary"
                            className="me-md-0 btn-light-primary w-100"
                            onClick={goToImport}
                        >
                            {getFormattedMessage("product.import.title")}
                        </Button>
                    </Dropdown.Header>
                ) : null}
                <div className="btn btn-secondary me-5" onClick={onReset}>
                    {getFormattedMessage("reset.title")}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
};

const mapStateToProps = (state) => {
    const { base, brands, productCategories } = state;
    return { base, brands, productCategories };
};

export default connect(mapStateToProps, {
    fetchAllBaseUnits,
    fetchAllBrands,
    fetchAllProductCategories,
    fetchPlans
})(FilterDropdown);
