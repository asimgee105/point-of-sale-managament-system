import React, { useState, useEffect, useRef } from "react";
import { Col, Container, Row, Table } from "react-bootstrap-v5";
import { connect, useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import Category from "./Category";
import Brands from "./Brand";
import Product from "./product/Product";
import ProductCartList from "./cart-product/ProductCartList";
import {
    posSearchNameProduct,
    posSearchCodeProduct,
} from "../../store/action/pos/posfetchProductAction";
import ProductSearchbar from "./product/ProductSearchbar";
import { prepareCartArray } from "../shared/PrepareCartArray";
import ProductDetailsModel from "../shared/ProductDetailsModel";
import CartItemMainCalculation from "./cart-product/CartItemMainCalculation";
import PosHeader from "./header/PosHeader";
import { posCashPaymentAction } from "../../store/action/pos/posCashPaymentAction";
import PaymentButton from "./cart-product/PaymentButton";
import CashPaymentModel from "./cart-product/paymentModel/CashPaymentModel";
import PrintData from "./printModal/PrintData";
import PaymentSlipModal from "./paymentSlipModal/PaymentSlipModal";
import { fetchSetting } from "../../store/action/settingAction";
import { calculateProductCost } from "../shared/SharedMethod";
import {
    fetchBrandClickable,
    posAllProduct,
} from "../../store/action/pos/posAllProductAction";
import TabTitle from "../../shared/tab-title/TabTitle";
import HeaderAllButton from "./header/HeaderAllButton";
import RegisterDetailsModel from "./register-detailsModal/RegisterDetailsModel";
import PrintRegisterDetailsData from "./printModal/PrintRegisterDetailsData";
import {
    closeRegisterAction,
    fetchTodaySaleOverAllReport,
    getAllRegisterDetailsAction,
} from "../../store/action/pos/posRegisterDetailsAction";
import {
    getFormattedMessage,
    getFormattedOptions,
} from "../../shared/sharedMethod";
import { discountType, paymentMethodOptions, productActionType, toastType } from "../../constants";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import CustomerForm from "./customerModel/CustomerForm";
import HoldListModal from "./holdListModal/HoldListModal";
import { fetchHoldLists } from "../../store/action/pos/HoldListAction";
import { useNavigate } from "react-router";
import PosCloseRegisterDetailsModel from "../../components/posRegister/PosCloseRegisterDetailsModel.js";
import { addToast } from "../../store/action/toastAction";
import PosRegisterModel from "../../components/posRegister/PosRegisterModel.js";
import { fetchTax } from "../../store/action/taxAction.js";
import { setCartProduct } from "../../store/action/cartAction.js";
import RecentSaleModal from "./recentSaleModal/RecentSaleModal.js";
import { fetchSales } from "../../store/action/salesAction.js";
import { fetchPaymentMethods } from "../../store/action/paymentMethodAction.js";
import { fetchAllWarehouses } from "../../store/action/warehouseAction.js";

const PosMainPage = (props) => {
    const {
        onClickFullScreen,
        posAllProducts,
        customCart,
        posCashPaymentAction,
        frontSetting,
        settings,
        fetchSetting,
        paymentDetails,
        allConfigData,
        fetchBrandClickable,
        posAllTodaySaleOverAllReport,
        fetchHoldLists,
        holdListData,
        taxes,
        sales,
        fetchPaymentMethods,
        paymentMethods,
        warehouses
    } = props;
    const componentRef = useRef();
    const registerDetailsRef = useRef();
    const [openCalculator, setOpenCalculator] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [updateProducts, setUpdateProducts] = useState([]);
    const [isOpenCartItemUpdateModel, setIsOpenCartItemUpdateModel] =
        useState(false);
    const [product, setProduct] = useState(null);
    const [cartProductIds, setCartProductIds] = useState([]);
    const [newCost, setNewCost] = useState("");
    const [paymentPrint, setPaymentPrint] = useState({});
    const [cashPayment, setCashPayment] = useState(false);
    const [modalShowPaymentSlip, setModalShowPaymentSlip] = useState(false);
    const [modalShowCustomer, setModalShowCustomer] = useState(false);
    const [productMsg, setProductMsg] = useState(0);
    const [brandId, setBrandId] = useState();
    const [categoryId, setCategoryId] = useState();
    const [selectedCustomerOption, setSelectedCustomerOption] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [updateHolList, setUpdateHoldList] = useState(false);
    const [hold_ref_no, setHold_ref_no] = useState("");
    const [page, setPage] = useState(1);
    const [salePage, setSalePage] = useState(1);
    const [cartItemValue, setCartItemValue] = useState({
        discount_type: discountType.FIXED,    // 0 = fixed, 1 = percentage
        discount_value: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
    });
    const [cashPaymentValue, setCashPaymentValue] = useState({
        notes: "",
        payment_status: {
            label: getFormattedMessage("globally.detail.paid"),
            value: 1,
        },
        payment_details: [{
            amount: '',
            payment_type: ''
        }]
    });
    const [errors, setErrors] = useState({ notes: "" });
    const [changeReturn, setChangeReturn] = useState(0);
    const [showCloseDetailsModal, setShowCloseDetailsModal] = useState(false);
    const [showPosRegisterModel, setShowPosRegisterModel] = useState(false)
    const { closeRegisterDetails } = useSelector((state) => state);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //total Qty on cart item
    const localCart = updateProducts.map((updateQty) =>
        Number(updateQty.quantity)
    );
    const totalQty =
     localCart.length > 0 && Number(localCart?.reduce((cart, current) => cart + current, 0)).toFixed(settings?.attributes?.decimal_places || 2);
    //subtotal on cart item
    const localTotal = updateProducts.map(
        (updateQty) =>
            calculateProductCost(updateQty) * updateQty.quantity
    );
    const subTotal =
        localTotal.length > 0 &&
        localTotal.reduce((cart, current) => {
            const decimalPlaces = settings?.attributes?.decimal_places || 2;
            const roundedCart = parseFloat(cart.toFixed(decimalPlaces));
            const roundedCurrent = parseFloat(current.toFixed(decimalPlaces));
            return roundedCart + roundedCurrent;
        }, 0);

    const [holdListId, setHoldListValue] = useState({
        referenceNumber: "",
    });

    //grand total on cart item
    const discountTotal = subTotal - cartItemValue.discount;
    const taxTotal = (discountTotal * cartItemValue.tax) / 100;
    const mainTotal = discountTotal + taxTotal;
    const decimalPlaces = settings?.attributes?.decimal_places || 2;
    const grandTotal = (
        parseFloat(mainTotal) + parseFloat(cartItemValue.shipping)
    ).toFixed(decimalPlaces);

    useEffect(() => {
        setPaymentPrint({
            ...paymentPrint,
            barcode_url:
                paymentDetails.attributes &&
                paymentDetails.attributes.barcode_url,
            reference_code:
                paymentDetails.attributes &&
                paymentDetails.attributes.reference_code,
            paid_amount:
                paymentDetails.attributes &&
                paymentDetails.attributes.paid_amount,
            payments: paymentDetails.attributes &&
                paymentDetails.attributes.payments,
        });
    }, [paymentDetails]);

    const SelectDefautwarehouse = () => {
        let warehouse = warehouses && warehouses?.find(warehouse => warehouse?.id == settings?.attributes?.default_warehouse);
        if(warehouse) return warehouse
        return warehouses[0];
    };

    useEffect(() => {
        let warehouse = SelectDefautwarehouse();
        setSelectedOption(warehouse);
        setSelectedCustomerOption(
            settings.attributes && {
                value: Number(settings.attributes.default_customer),
                label: settings.attributes.customer_name,
            }
        );
        setSelectedOption(
            settings.attributes && {
                value: warehouse && warehouse?.id,
                label: warehouse && warehouse?.attributes?.name,
            }
        );
    }, [settings]);

    useEffect(() => {
        fetchSetting();
        fetchTodaySaleOverAllReport();
        fetchHoldLists();
        fetchPaymentMethods();
    }, []);

    useEffect(() => {
        if(allConfigData){
            setShowPosRegisterModel(allConfigData?.open_register)
        }
    },[allConfigData])

    useEffect(() => {
        if (updateHolList === true) {
            fetchHoldLists();
            setUpdateHoldList(false);
        }
    }, [updateHolList]);

    // payment type dropdown functionality
    const paymentTypeFilterOptions = paymentMethods.length > 0 && paymentMethods.filter(item => (item.attributes.status == 1));
    const paymentTypeDefaultValue = paymentTypeFilterOptions && paymentTypeFilterOptions?.map((option) => {
        return {
            value: option?.id,
            label: option?.attributes?.name,
        };
    });

    const [paymentValue, setPaymentValue] = useState({
        payment_type: paymentTypeDefaultValue && paymentTypeDefaultValue[0],
    });

    useEffect(() => {
        setUpdateProducts(updateProducts);
        setCashPaymentValue({
            ...cashPaymentValue,
            payment_details: [
                {
                    amount: grandTotal,
                    payment_type: paymentTypeDefaultValue[0],
                },
            ],
        })
        if (cashPayment) {
            setErrors('');
        }
    }, [quantity, grandTotal, cashPayment]);

    const handleValidation = () => {
        let errors = {};
        let isValid = false;
        if (
            cashPaymentValue["notes"] &&
            cashPaymentValue["notes"].length > 100
        ) {
            errors["notes"] =
                "The notes must not be greater than 100 characters";
        } 

        if (
            cashPaymentValue?.payment_status?.value == 1 ||
            cashPaymentValue?.payment_status?.value == 3
        ) {
            const decimalPlaces = settings?.attributes?.decimal_places || 2;
            const paymentErrors = [];
            let totalAmount = 0;
            const isMultiplePayments = cashPaymentValue.payment_details?.length > 1;
            const totalAmounts = cashPaymentValue.payment_details?.reduce((sum, item) => {
                const amount = parseFloat(item.amount)?.toFixed(decimalPlaces);
                return !isNaN(amount) && amount > 0 ? sum + amount : sum;
            }, 0) || 0;

            if (!cashPaymentValue.payment_details || cashPaymentValue.payment_details.length === 0) {
                errors["payment_details"] = "At least one payment method is required";
            } else {
                cashPaymentValue.payment_details.forEach((item, index) => {
                    const entryError = {};
                    const decimalPlaces = settings?.attributes?.decimal_places || 2;
                    const amount = parseFloat(item.amount)?.toFixed(decimalPlaces);

                    if (!item.amount || isNaN(item.amount) || amount <= 0) {
                        entryError.amount = getFormattedMessage('expense.input.amount.validate.label');
                    } else if (
                        isMultiplePayments &&
                        totalAmounts > grandTotal
                    ) {
                        entryError.amount = getFormattedMessage('pos.payment.amount.exceeds.total.error');
                    }

                    if (!item.payment_type || !item.payment_type.value) {
                        entryError.payment_type = getFormattedMessage('globally.payment.type.validate.label');
                    } else {
                        totalAmount += parseFloat(amount);
                    }

                    paymentErrors.push(entryError);
                });

                errors["payment_details"] = paymentErrors;
            }
        }

        const hasErrors = Object.keys(errors).some(key => {
            if (key === "payment_details" && Array.isArray(errors[key])) {
                return errors[key].some(error => Object.keys(error).length > 0);
            }
            return errors[key];
        });

        isValid = !hasErrors;
        setErrors(errors);
        return isValid;
    };

    //filter on category id
    const setCategory = (item) => {
        setCategoryId(item);
    };

    const autoRefreshProducts = settings?.attributes?.auto_refresh_products === "true" || false;

    const refreshIntervalSeconds = settings?.attributes?.refresh_interval_seconds;

    const fetchProductInterval = () => {
        if (selectedOption) {
            dispatch({
                type:productActionType.RESET_PRODUCT
            })
            setPage(1);
            fetchBrandClickable(brandId, categoryId, selectedOption?.value);
        }
    };

    useEffect(() => {
        if (!selectedOption) return;

        fetchProductInterval();

        if (!autoRefreshProducts || !refreshIntervalSeconds) return;

        const intervalId = setInterval(() => {
            fetchProductInterval();
        }, refreshIntervalSeconds * 1000);

        return () => clearInterval(intervalId);

    }, [
        selectedOption,
        brandId,
        categoryId,
        autoRefreshProducts,
        refreshIntervalSeconds
    ]);

    //filter on brand id
    const setBrand = (item) => {
        setBrandId(item);
    };

    const onChangeInput = (e) => {
        e.preventDefault();
        setCashPaymentValue((inputs) => ({
            ...inputs,
            [e.target.name]: e.target.value,
        }));
    };

    const onPaymentStatusChange = (obj) => {
        setCashPaymentValue(inputs => ({
            ...inputs,
            payment_status: obj,
            payment_details: (obj.value === 1 || obj.value === 3) ? [getEmptyPaymentDetail()] : []
        }));
    };

    const onChangeReturnChange = (change) => {
        setChangeReturn(change);
    };

    const getEmptyPaymentDetail = () => ({
        amount: '',
        payment_type: ''
    });

    const handlePaymentDetailChange = (index, name, value) => {
        const updatedDetails = [...cashPaymentValue.payment_details];
        updatedDetails[index][name] = value;
        setCashPaymentValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
        setPaymentValue({ ...paymentValue, payment_type: cashPaymentValue.payment_details[index].payment_type });
        setErrors('');
    };

    const handleAddPayment = () => {
        setCashPaymentValue(prev => ({
            ...prev,
            payment_details: [...prev.payment_details, getEmptyPaymentDetail()]
        }));
        setErrors('');
    };

    const handleRemovePayment = (index) => {
        const updatedDetails = cashPaymentValue.payment_details.filter((_, i) => i !== index);
        setCashPaymentValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
        setErrors('');
    };

    const onPaymentTypeChange = (obj) => {
        setPaymentValue({ ...paymentValue, payment_type: obj });
    };

    useEffect(() => {
        const newCartData = {
            cartProduct: updateProducts,
            customer: selectedCustomerOption,
            cartItemValue: cartItemValue,
            subTotal: Number(subTotal),
            grandTotal: Number(grandTotal),
            paymentMethod: paymentValue?.payment_type !== false ? paymentValue?.payment_type : paymentTypeDefaultValue && paymentTypeDefaultValue[0],
        };
        dispatch(setCartProduct(newCartData));
        localStorage.setItem('cart-sync', JSON.stringify(newCartData));
    }, [updateProducts, selectedCustomerOption, selectedOption, cartItemValue, subTotal, grandTotal, cashPaymentValue, paymentValue]);

    const onChangeCart = (event) => {
        if(updateProducts.length == 0){
            dispatch(addToast({text: getFormattedMessage("pos.cash-payment.product-error.message"), type: toastType.ERROR}))
            return;
        }
        const { value } = event.target;
        // check if value includes a decimal point
        const decimalPlaces = settings?.attributes?.decimal_places || 2;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            // restrict value to only specified decimal places
            if (decimal?.length > 3) {
                // do nothing
                return;
            }
        }
        let discount = cartItemValue.discount;
        if (event.target.name == 'discount_value') {
            if (cartItemValue.discount_type == discountType.FIXED) {
                discount = value;
            } else {
                discount = (Number(subTotal) * Number(value)) / 100;
            }
        }
        if (event.target.name === 'discount_type') {
            if (value == discountType.FIXED) {
                discount = cartItemValue.discount_value;
            } else {
                discount = (Number(subTotal) * Number(cartItemValue.discount_value)) / 100;
            }
        }

        setCartItemValue((inputs) => ({
            ...inputs,
            discount: discount,
            [event.target.name]: value,
        }));
    };

    const onChangeTaxCart = (event) => {
        if(updateProducts.length == 0){
            dispatch(addToast({text: getFormattedMessage("pos.cash-payment.product-error.message"), type: toastType.ERROR}))
            return;
        }
        const min = 0;
        const max = 100;
        const { value } = event.target;
        const values = value;
        // check if value includes a decimal point
        const decimalPlaces = settings?.attributes?.decimal_places || 2;
        if(values > max || values < min) return;
        if (value.match(/\./g)) {
            const [, decimal] = value.split(".");
            // restrict value to only specified decimal places
            if (decimal?.length > 3) {
                // do nothing
                return;
            }
        }
        setCartItemValue((inputs) => ({
            ...inputs,
            [event.target.name]: values,
        }));
    };

    //payment slip model onchange
    const handleCashPayment = () => {
        setCashPaymentValue({
            notes: "",
            payment_status: {
                label: getFormattedMessage("globally.detail.paid"),
                value: 1,
            },
            payment_details: [{
                amount: '',
                payment_type: ''
            }]
        });
        setCashPayment(!cashPayment);
    };

    const updateCost = (item) => {
        setNewCost(item);
    };

    //product details model onChange
    const openProductDetailModal = () => {
        setIsOpenCartItemUpdateModel(!isOpenCartItemUpdateModel);
    };

    //product details model updated value
    const onClickUpdateItemInCart = (item) => {
        setProduct(item);
        setIsOpenCartItemUpdateModel(true);
    };

    const onProductUpdateInCart = () => {
        const localCart = updateProducts.slice();
        updateCart(localCart);
    };

    //updated Qty function
    const updatedQty = (qty) => {
        setQuantity(qty);
    };

    const updateCart = (cartProducts) => {
        setUpdateProducts(cartProducts);
    };

    //cart item delete
    const onDeleteCartItem = (productId) => {
        const existingCart = updateProducts.filter((e) => e.id !== productId);
        updateCart(existingCart);
    };

    //product add to cart function
    const addToCarts = (items) => {
        updateCart(items);
    };

    const onScrollCallAPI = (page) => {
        fetchBrandClickable(
            brandId,
            categoryId,
            selectedOption.value && selectedOption.value,
            page
        );
    };

    const onSearchProduct = (search) => {
        fetchBrandClickable(
            brandId,
            categoryId,
            selectedOption.value && selectedOption.value,
            1,
            search,
            true
        );
    };

    // create customer model
    const customerModel = (val) => {
        setModalShowCustomer(val);
    };

    //prepare data for print Model
    const preparePrintData = () => {
        const formValue = {
            products: updateProducts,
            discount: cartItemValue.discount ? cartItemValue.discount : 0,
            tax: cartItemValue.tax ? cartItemValue.tax : 0,
            cartItemPrint: cartItemValue,
            taxTotal: taxTotal,
            grandTotal: grandTotal,
            shipping: cartItemValue.shipping,
            subTotal: subTotal,
            frontSetting: frontSetting,
            customer_name: selectedCustomerOption,
            settings: settings,
            note: cashPaymentValue.notes,
            changeReturn,
            payment_status: cashPaymentValue.payment_status,
        };
        return formValue;
    };

    //prepare data for payment api
    const prepareData = (updateProducts) => {
        const formValue = {
            date: moment(new Date()).locale('en').format("YYYY-MM-DD"),
            customer_id:
                selectedCustomerOption && selectedCustomerOption[0]
                    ? selectedCustomerOption[0].value
                    : selectedCustomerOption && selectedCustomerOption.value,
            warehouse_id:
                selectedOption && selectedOption[0]
                    ? selectedOption[0].value
                    : selectedOption && selectedOption.value,
            sale_items: updateProducts,
            grand_total: grandTotal, 
            ...(cashPaymentValue?.payment_status?.value == 1
                ? { payment_type: paymentValue?.payment_type?.value || paymentTypeDefaultValue && paymentTypeDefaultValue[0].value }
                : {}),
            discount: cartItemValue.discount,
            discount_type: parseInt(cartItemValue.discount_type),
            discount_value: parseInt(cartItemValue.discount_value),
            shipping: cartItemValue.shipping,
            tax_rate: cartItemValue.tax,
            note: cashPaymentValue.notes,
            status: 1,
            hold_ref_no: hold_ref_no,
            payment_status: cashPaymentValue?.payment_status?.value,
            payment_details: (cashPaymentValue?.payment_status?.value == 1 || cashPaymentValue?.payment_status?.value == 3)
                ? cashPaymentValue.payment_details?.length === 1 &&
                    parseFloat(cashPaymentValue.payment_details[0]?.amount) > parseFloat(grandTotal)
                    ? [
                        {
                            ...cashPaymentValue.payment_details[0],
                            amount: grandTotal,
                        },
                    ]
                    : cashPaymentValue.payment_details || []
                : []
        };
        return formValue;
    };

    //cash payment method
    const onCashPayment = (event,printSlip=false) => {
        event.preventDefault();
        const valid = handleValidation();
        if (valid) {
            // Capture payment print data BEFORE resetting cashPaymentValue
            setPaymentPrint(preparePrintData);

            posCashPaymentAction(
                prepareData(updateProducts),
                setUpdateProducts,
                printSlip && setModalShowPaymentSlip,
                {
                    brandId,
                    categoryId,
                    selectedOption,
                },
                printSlip
            );
            setCashPayment(false);
            setCartItemValue({
                discount_type: discountType.FIXED,
                discount_value: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
            });
            setCashPaymentValue({
                notes: "",
                payment_status: {
                    label: getFormattedMessage(
                        "globally.detail.paid"
                    ),
                    value: 1,
                },
                payment_details: [{
                    amount: '',
                    payment_type: ''
                }]
            });
            dispatch(fetchTax());
            setCartProductIds("");
        }
    };

    const printPaymentReceiptPdf = () => {
        document.getElementById("printReceipt").click();
    };

    const printRegisterDetails = () => {
        document.getElementById("printRegisterDetailsId").click();
    };

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    const handleRegisterDetailsPrint = useReactToPrint({
        content: () => registerDetailsRef.current,
    });

    //payment print
    const loadPrintBlock = () => {
        return (
            <div className="d-none">
                <button id="printReceipt" onClick={handlePrint}>
                    Print this out!
                </button>
                <PrintData
                    ref={componentRef}
                    paymentType={paymentValue.payment_type.label || paymentTypeDefaultValue && paymentTypeDefaultValue[0].label}
                    paymentTypeOption={paymentValue.payment_type.value}
                    allConfigData={allConfigData}
                    updateProducts={paymentPrint}
                    frontSetting={frontSetting}
                    settings={settings}
                    taxes={taxes}
                />
            </div>
        );
    };

    //Register details  slip
    const loadRegisterDetailsPrint = () => {
        return (
            <div className="d-none">
                <button
                    id="printRegisterDetailsId"
                    onClick={handleRegisterDetailsPrint}
                >
                    Print this out!
                </button>
                <PrintRegisterDetailsData
                    ref={registerDetailsRef}
                    allConfigData={allConfigData}
                    frontSetting={frontSetting}
                    posAllTodaySaleOverAllReport={posAllTodaySaleOverAllReport}
                    updateProducts={paymentPrint}
                    closeRegisterDetails={closeRegisterDetails}
                />
            </div>
        );
    };

    //payment slip
    const loadPaymentSlip = () => {
        return (
            <div className="d-none">
                <PaymentSlipModal
                    printPaymentReceiptPdf={printPaymentReceiptPdf}
                    setPaymentValue={setPaymentValue}
                    setModalShowPaymentSlip={setModalShowPaymentSlip}
                    settings={settings}
                    frontSetting={frontSetting}
                    modalShowPaymentSlip={modalShowPaymentSlip}
                    allConfigData={allConfigData}
                    paymentDetails={paymentDetails}
                    updateProducts={paymentPrint}
                    paymentType={paymentValue.payment_type.label || paymentTypeDefaultValue && paymentTypeDefaultValue[0].label}
                    paymentTypeOption={paymentValue.payment_type.value}
                    paymentTypeDefaultValue={paymentTypeDefaultValue}
                    taxes={taxes}
                    paymentStatus={paymentPrint?.payment_status?.value || cashPaymentValue.payment_status.value}
                />
            </div>
        );
    };
    const [lgShow, setLgShow] = useState(false);
    const [holdShow, setHoldShow] = useState(false);
    const [recentSaleModal, setRecentSaleModal] = useState(false);

    const onClickDetailsModel = (isDetails = null) => {
        setLgShow(true);
    };

    const onClickHoldModel = (isDetails = null) => {
        setHoldShow(true);
    };

    const filters = {
        order_By: "created_at",
        direction: "desc",
        page: salePage,
        pageSize: 10,
    }
    
    const onClickRecentSalesModal = () => {
        setSalePage(1)
        dispatch(fetchSales({...filters, page: 1}));
        setRecentSaleModal(true);
    };

    const handleLoadMore = () => {
        setSalePage(salePage + 1);
        dispatch(fetchSales({...filters, page: salePage + 1}, true, true));
    };

    const handleClickCloseRegister = () => {
        dispatch(getAllRegisterDetailsAction());
        setShowCloseDetailsModal(true);
    };

    const handleCloseRegisterDetails = (data) => {
        if (data.cash_in_hand_while_closing.toString().trim()?.length === 0) {
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "pos.cclose-register.enter-total-cash.message"
                    ),
                    type: toastType.ERROR,
                })
            );
        } else {
            setShowCloseDetailsModal(false);
            dispatch(closeRegisterAction(data, navigate));
        }
    };

    return (
        <Container className="pos-screen px-3" fluid>
            <TabTitle title="POS" />
            {loadPrintBlock()}
            {loadPaymentSlip()}
            {loadRegisterDetailsPrint()}
            <Row>
                <TopProgressBar />
                <Col lg={5} xxl={4} xs={6} className="pos-left-scs px-1 px-sm-3">
                    <div className="d-flex flex-column h-100">
                        <PosHeader
                            setSelectedCustomerOption={setSelectedCustomerOption}
                            selectedCustomerOption={selectedCustomerOption}
                            setSelectedOption={setSelectedOption}
                            selectedOption={selectedOption}
                            customerModel={customerModel}
                            updateCustomer={modalShowCustomer}
                        />
                        <div className="left-content custom-card mb-3 p-3 d-flex flex-column justify-content-between">
                            <div className="main-table overflow-auto">
                                <Table className="mb-0">
                                    <thead className="position-sticky top-0">
                                        <tr>
                                            <th>
                                                {getFormattedMessage(
                                                    "product.title"
                                                )}
                                            </th>
                                            <th
                                                className={
                                                    updateProducts &&
                                                        updateProducts.length
                                                        ? "text-center"
                                                        : ""
                                                }
                                            >
                                                {getFormattedMessage(
                                                    "pos-qty.title"
                                                )}
                                            </th>
                                            <th>
                                                {getFormattedMessage(
                                                    "price.title"
                                                )}
                                            </th>
                                            <th colSpan="2">
                                                {getFormattedMessage(
                                                    "pos.subtotal.small.title"
                                                )}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="border-0">
                                        {updateProducts && updateProducts.length ? (
                                            updateProducts.map(
                                                (updateProduct, index) => {
                                                    return (
                                                        <ProductCartList
                                                            singleProduct={
                                                                updateProduct
                                                            }
                                                            key={index + 1}
                                                            index={index}
                                                            posAllProducts={
                                                                posAllProducts
                                                            }
                                                            onClickUpdateItemInCart={
                                                                onClickUpdateItemInCart
                                                            }
                                                            updatedQty={updatedQty}
                                                            updateCost={updateCost}
                                                            onDeleteCartItem={
                                                                onDeleteCartItem
                                                            }
                                                            quantity={quantity}
                                                            frontSetting={
                                                                frontSetting
                                                            }
                                                            newCost={newCost}
                                                            allConfigData={
                                                                allConfigData
                                                            }
                                                            setUpdateProducts={
                                                                setUpdateProducts
                                                            }
                                                        />
                                                    );
                                                }
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="custom-text-center text-gray-900 fw-bold py-5"
                                                >
                                                    {getFormattedMessage(
                                                        "sale.product.table.no-data.label"
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            <div>
                                <CartItemMainCalculation
                                    totalQty={totalQty}
                                    subTotal={subTotal}
                                    grandTotal={grandTotal}
                                    cartItemValue={cartItemValue}
                                    onChangeCart={onChangeCart}
                                    allConfigData={allConfigData}
                                    frontSetting={frontSetting}
                                    onChangeTaxCart={onChangeTaxCart}
                                />
                                <PaymentButton
                                    updateProducts={updateProducts}
                                    updateCart={addToCarts}
                                    setUpdateProducts={setUpdateProducts}
                                    setCartItemValue={setCartItemValue}
                                    setCashPayment={setCashPayment}
                                    cartItemValue={cartItemValue}
                                    grandTotal={grandTotal}
                                    subTotal={subTotal}
                                    selectedOption={selectedOption}
                                    cashPaymentValue={cashPaymentValue}
                                    holdListId={holdListId}
                                    setHoldListValue={setHoldListValue}
                                    selectedCustomerOption={selectedCustomerOption}
                                    setUpdateHoldList={setUpdateHoldList}
                                />
                            </div>
                        </div>
                    </div>
                </Col>
                <Col lg={7} xxl={8} xs={6} className="ps-lg-0 pos-right-scs px-1 px-sm-3">
                    <div className="right-content mb-3 d-flex flex-column h-100">
                        <div className="d-sm-flex align-items-center flex-xxl-nowrap flex-wrap">
                            <ProductSearchbar
                                customCart={customCart}
                                setUpdateProducts={setUpdateProducts}
                                updateProducts={updateProducts}
                                selectedOption={selectedOption}
                                onSearchProduct={onSearchProduct}
                                settings={settings}
                            />
                            <HeaderAllButton
                                holdListData={holdListData}
                                goToHoldScreen={onClickHoldModel}
                                goToDetailScreen={onClickDetailsModel}
                                onClickFullScreen={onClickFullScreen}
                                opneCalculator={openCalculator}
                                setOpneCalculator={setOpenCalculator}
                                handleClickCloseRegister={
                                    handleClickCloseRegister
                                }
                                goToRecentSales={onClickRecentSalesModal}
                            />
                        </div>
                        <div className="custom-card h-100 mb-3">
                            <div className="p-3">
                                <Category
                                    setCategory={setCategory}
                                    brandId={brandId}
                                    selectedOption={selectedOption}
                                />
                                <Brands
                                    categoryId={categoryId}
                                    setBrand={setBrand}
                                    selectedOption={selectedOption}
                                />
                            </div>
                            <Product
                                cartProducts={updateProducts}
                                updateCart={addToCarts}
                                customCart={customCart}
                                setCartProductIds={setCartProductIds}
                                cartProductIds={cartProductIds}
                                settings={settings}
                                productMsg={productMsg}
                                selectedOption={selectedOption}
                                onScrollCallAPI={onScrollCallAPI}
                                page={page}
                                setPage={setPage}
                            />
                        </div>
                    </div>
                </Col>
            </Row>
            {isOpenCartItemUpdateModel && (
                <ProductDetailsModel
                    openProductDetailModal={openProductDetailModal}
                    productModelId={product.id}
                    onProductUpdateInCart={onProductUpdateInCart}
                    updateCost={updateCost}
                    cartProduct={product}
                    isOpenCartItemUpdateModel={isOpenCartItemUpdateModel}
                    frontSetting={frontSetting}
                />
            )}
            {cashPayment && (
                <CashPaymentModel
                    cashPayment={cashPayment}
                    totalQty={totalQty}
                    cartItemValue={cartItemValue}
                    onChangeInput={onChangeInput}
                    onPaymentStatusChange={onPaymentStatusChange}
                    cashPaymentValue={cashPaymentValue}
                    allConfigData={allConfigData}
                    subTotal={subTotal}
                    onPaymentTypeChange={onPaymentTypeChange}
                    grandTotal={grandTotal}
                    onCashPayment={onCashPayment}
                    taxTotal={taxTotal}
                    handleCashPayment={handleCashPayment}
                    settings={settings}
                    errors={errors}
                    paymentTypeDefaultValue={paymentTypeDefaultValue}
                    paymentTypeFilterOptions={paymentTypeFilterOptions}
                    onChangeReturnChange={onChangeReturnChange}
                    setPaymentValue={setPaymentValue}
                    handlePaymentDetailChange={handlePaymentDetailChange}
                    handleAddPayment={handleAddPayment}
                    handleRemovePayment={handleRemovePayment}
                />
            )}
            {lgShow && (
                <RegisterDetailsModel
                    printRegisterDetails={printRegisterDetails}
                    frontSetting={frontSetting}
                    lgShow={lgShow}
                    setLgShow={setLgShow}
                />
            )}
            {holdShow && (
                <HoldListModal
                    setUpdateHoldList={setUpdateHoldList}
                    setCartItemValue={setCartItemValue}
                    setUpdateProducts={setUpdateProducts}
                    updateProduct={updateProducts}
                    printRegisterDetails={printRegisterDetails}
                    frontSetting={frontSetting}
                    holdListData={holdListData}
                    setHold_ref_no={setHold_ref_no}
                    holdShow={holdShow}
                    setHoldShow={setHoldShow}
                    addCart={addToCarts}
                    updateCart={updateCart}
                    setSelectedCustomerOption={setSelectedCustomerOption}
                    setSelectedOption={setSelectedOption}
                />
            )}
            {recentSaleModal && (
                <RecentSaleModal 
                    recentSaleModal={recentSaleModal}
                    setRecentSaleModal={setRecentSaleModal}
                    sales={sales}
                    handleLoadMore={handleLoadMore}
                    setSalePage={setSalePage}
                />
            )}
            {modalShowCustomer && (
                <CustomerForm
                    show={modalShowCustomer}
                    hide={setModalShowCustomer}
                    setSelectedCustomerOption={setSelectedCustomerOption}
                />
            )}
            <PosCloseRegisterDetailsModel
                showCloseDetailsModal={showCloseDetailsModal}
                handleCloseRegisterDetails={handleCloseRegisterDetails}
                setShowCloseDetailsModal={setShowCloseDetailsModal}
            />
            {allConfigData?.permissions?.length === 1 && <PosRegisterModel showPosRegisterModel={showPosRegisterModel} isCloseButton={false} onClickshowPosRegisterModel={() => setShowPosRegisterModel(false)} />}
        </Container>
    );
};

const mapStateToProps = (state) => {
    const {
        posAllProducts,
        frontSetting,
        settings,
        cashPayment,
        allConfigData,
        posAllTodaySaleOverAllReport,
        holdListData,
        warehouses,
        taxes,
        sales,
        paymentMethods
    } = state;
    return {
        holdListData,
        posAllProducts,
        frontSetting,
        settings,
        paymentDetails: cashPayment,
        customCart: prepareCartArray(posAllProducts),
        allConfigData,
        posAllTodaySaleOverAllReport,
        warehouses,
        taxes,
        sales,
        paymentMethods
    };
};

export default connect(mapStateToProps, {
    fetchSetting,
    posSearchNameProduct,
    posCashPaymentAction,
    posSearchCodeProduct,
    posAllProduct,
    fetchBrandClickable,
    fetchAllWarehouses,
    fetchHoldLists,
    fetchPaymentMethods,
})(PosMainPage);
