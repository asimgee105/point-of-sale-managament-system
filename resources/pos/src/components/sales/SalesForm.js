import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, InputGroup } from 'react-bootstrap-v5';
import moment from 'moment';
import { connect, useDispatch } from 'react-redux';
import { fetchProductsByWarehouse } from '../../store/action/productAction';
import { editSale } from '../../store/action/salesAction';
import ProductSearch from '../../shared/components/product-cart/search/ProductSearch';
import ProductRowTable from '../../shared/components/sales/ProductRowTable';
import { placeholderText, getFormattedMessage, decimalValidate, onFocusInput, getFormattedOptions, calculateMainAmounts, getDecimalPlaces } from '../../shared/sharedMethod';
import ReactDatePicker from '../../shared/datepicker/ReactDatePicker';
import ProductMainCalculation from './ProductMainCalculation';
import { calculateCartTotalAmount, calculateCartTotalTaxAmount } from '../../shared/calculation/calculation';
import { prepareSaleProductArray } from '../../shared/prepareArray/prepareSaleArray';
import ModelFooter from '../../shared/components/modelFooter';
import { addToast } from '../../store/action/toastAction';
import { discountType, paymentMethodOptions, salePaymentStatusOptions, saleStatusOptions, toastType } from '../../constants';
import ReactSelect from '../../shared/select/reactSelect';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TabTitle from '../../shared/tab-title/TabTitle';

const SalesForm = ( props ) => {
    const {
        addSaleData,
        editSale,
        id,
        customers,
        warehouses,
        singleSale,
        customProducts,
        products,
        fetchProductsByWarehouse,
        frontSetting,
        isQuotation,
        allConfigData,
        paymentMethods,
        settings
    } = props;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [ updateProducts, setUpdateProducts ] = useState( [] );
    const [ quantity, setQuantity ] = useState( 0 );
    const [ newCost, setNewCost ] = useState( '' );
    const [ newDiscount, setNewDiscount ] = useState( '' );
    const [ newTax, setNewTax ] = useState( '' );
    const [ subTotal, setSubTotal ] = useState( '' );
    const [ newSaleUnit, setNewSaleUnit ] = useState( '' );
    // const [ isPaymentType, setIsPaymentType ] = useState( false )
    const [hasInitialized, setHasInitialized] = useState(false);
    const decimalPlaces = getDecimalPlaces(settings);

    const [ saleValue, setSaleValue ] = useState( {
        date: new Date(),
        customer_id: '',
        warehouse_id: '',
        tax_rate: parseFloat(0).toFixed(decimalPlaces),
        tax_amount: parseFloat(0).toFixed(decimalPlaces),
        discount: parseFloat(0).toFixed(decimalPlaces),
        shipping: parseFloat(0).toFixed(decimalPlaces),
        grand_total: parseFloat(0).toFixed(decimalPlaces),
        notes: singleSale ? singleSale.notes : '',
        received_amount: 0,
        paid_amount: 0,
        status_id: { label: getFormattedMessage( "status.filter.complated.label" ), value: 1 },
        payment_status: { label: getFormattedMessage( "payment-status.filter.unpaid.label" ), value: 2 },
        payment_type: '',
        payment_details: [],
        discount_type: 2,
        discount_value: parseFloat(0).toFixed(decimalPlaces)
    } );
    const [ errors, setErrors ] = useState( {
        date: '',
        customer_id: '',
        warehouse_id: '',
        status_id: '',
        payment_status: '',
        payment_type: '',
        payment_details: []
    } );

    useEffect( () => {
        setUpdateProducts( updateProducts )
    }, [ updateProducts, quantity, newCost, newDiscount, newTax, subTotal, newSaleUnit ] )

    useEffect( () => {
        updateProducts.length >= 1 ? dispatch( { type: 'DISABLE_OPTION', payload: true } ) : dispatch( { type: 'DISABLE_OPTION', payload: false } )
    }, [ updateProducts ] )

    useEffect(() => {
        if (singleSale && !hasInitialized) {
            if (!isQuotation) {
                setSaleValue({
                    date: moment(singleSale.date).toDate(),
                    customer_id: singleSale.customer_id,
                    quotation_id: singleSale.quotation_id,
                    warehouse_id: singleSale.warehouse_id,
                    tax_rate: parseFloat(singleSale?.tax_rate)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    tax_amount: parseFloat(singleSale?.tax_amount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    discount: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    shipping: parseFloat(singleSale?.shipping)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    grand_total: singleSale.grand_total,
                    status_id: singleSale.status_id,
                    payment_status: singleSale.is_Partial == 3
                        ? { label: getFormattedMessage('payment-status.filter.partial.label'), value: 3 }
                        : singleSale.payment_status,
                    payment_type: singleSale?.payment_type?.label ? singleSale?.payment_type : '',
                    payment_details: singleSale?.payment_details?.map(item => ({
                        id: item.id,
                        date: moment(item.payment_date).toDate(),
                        reference: item.reference,
                        amount: item.amount,
                        payment_type: {label:item?.payment_method?.name, value:item?.payment_method?.id}
                    })) || [],
                    discount_type: singleSale.discount_type,
                    discount_value: singleSale.discount_type == discountType.FIXED ? parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces) : parseFloat(singleSale?.discount_value)?.toFixed(decimalPlaces) ||parseFloat(0).toFixed(decimalPlaces),
                });
            } else {
                setSaleValue({
                    date: moment(singleSale.date).toDate(),
                    quotation_id: singleSale.quotation_id,
                    customer_id: singleSale.customer_id,
                    warehouse_id: singleSale.warehouse_id,
                    tax_rate: parseFloat(singleSale?.tax_rate)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    tax_amount: parseFloat(singleSale?.tax_amount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    discount: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    shipping: parseFloat(singleSale?.shipping)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                    grand_total: singleSale.grand_total,
                    status_id: singleSale.status_id,
                    payment_status: saleValue.payment_status || '',
                    payment_type: '',
                    discount_type: singleSale.discount_type,
                    discount_value: parseFloat(singleSale?.discount)?.toFixed(decimalPlaces) || parseFloat(0).toFixed(decimalPlaces),
                });
            }
            setUpdateProducts( singleSale.sale_items )
            setHasInitialized(true);
        }
    }, [singleSale, isQuotation,  hasInitialized]);

    useEffect( () => {
        saleValue.warehouse_id.value && fetchProductsByWarehouse( saleValue?.warehouse_id?.value )
    }, [ saleValue.warehouse_id.value ] )

    const validatePaymentDetails = () => {
        const paymentErrors = [];
        let totalAmount = 0;

        saleValue.payment_details.forEach((item, index) => {
            const entryError = {};

            if (!item.amount || isNaN(item.amount) || parseFloat(item.amount) <= 0) {
                entryError.amount = getFormattedMessage('expense.input.amount.validate.label');
            } else if (!item.payment_type || !item.payment_type.value) {
                entryError.payment_type = getFormattedMessage('globally.payment.type.validate.label');
            } else {
                totalAmount += parseFloat(item.amount);
            }

            paymentErrors.push(entryError);
        });

        return { paymentErrors, totalAmount };
    };

    const handleValidation = () => {
        let error = {};
        let isValid = false;
        const qtyCart = updateProducts.filter( ( a ) => a.quantity === 0 );
        if ( !saleValue.date ) {
            error[ 'date' ] = getFormattedMessage( 'globally.date.validate.label' );
        } else if ( !saleValue.warehouse_id ) {
            error[ 'warehouse_id' ] = getFormattedMessage( 'product.input.warehouse.validate.label' );
        } else if ( !saleValue.customer_id ) {
            error[ 'customer_id' ] = getFormattedMessage( 'sale.select.customer.validate.label' );
        } else if ( qtyCart.length > 0 ) {
            dispatch( addToast( { text: getFormattedMessage( 'globally.product-quantity.validate.message' ), type: toastType.ERROR } ) )
        } else if ( updateProducts.length < 1 ) {
            dispatch( addToast( { text: getFormattedMessage( 'purchase.product-list.validate.message' ), type: toastType.ERROR } ) )
        } else if ( !saleValue.status_id ) {
            error[ 'status_id' ] = getFormattedMessage( "globally.status.validate.label" )
        } else if ( !saleValue.payment_status ) {
            error[ 'payment_status' ] = getFormattedMessage( "globally.payment.status.validate.label" )
        } else if (saleValue.payment_status.value !== 2) {
            const {paymentErrors, totalAmount} = validatePaymentDetails();
            const hasErrors = paymentErrors.some((entry) => Object.keys(entry).length > 0);

            if (hasErrors) {
                error['payment_details'] = paymentErrors;
            } else if (totalAmount > parseFloat(calculateCartTotalAmount(updateProducts, saleValue))) {
                dispatch(
                    addToast({
                        text: getFormattedMessage("sale.payment.total-exceed.validate.message"),
                        type: toastType.ERROR
                    })
                );
            } else {
                isValid = true;
            }
        } else {
            isValid = true;
        }
        setErrors( error );
        return isValid;
    };

    const onWarehouseChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, warehouse_id: obj } ) );
        setErrors( '' );
    };

    const onCustomerChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, customer_id: obj } ) );
        setErrors( '' );
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;

        // Allow clearing input
        if (value === '') {
            setSaleValue(inputs => ({ ...inputs, [name]: value }));
            return;
        }

        // Allow only digits with ONE decimal
        if (!/^\d*\.?\d*$/.test(value)) return;

        // Enforce decimal places
        const parts = value.split('.');
        if (parts[1]?.length > 3) return;

        // Order tax must not exceed 100
        if (name === 'tax_rate' && parseFloat(value) > 100) return;

        // Discount % must not exceed 100
        if (
            name === 'discount_value' &&
            saleValue.discount_type == 1 &&
            parseFloat(value) > 100
        ) {
            return;
        }

        setSaleValue(inputs => ({
            ...inputs,
            [name]: value,
        }));
    };

    useEffect(() => {
        const { discountAmount } = calculateMainAmounts(updateProducts, saleValue);
        setSaleValue({ ...saleValue, discount: discountAmount });
    }, [saleValue.discount_type, saleValue.discount_value])

    const handleDiscountTypeChange = (event) => {
        setSaleValue({ ...saleValue, discount_type: parseInt(event.target.value) });
    };

    const onNotesChangeInput = ( e ) => {
        e.preventDefault();
        setSaleValue( inputs => ( { ...inputs, notes: e.target.value } ) );
    };

    const onStatusChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, status_id: obj } ) );
    };

    const onPaymentStatusChange = ( obj ) => {
        setSaleValue(inputs => ({
            ...inputs,
            payment_status: obj,
            payment_details: (obj.value === 1 || obj.value === 3) ? [getEmptyPaymentDetail()] : []
        }));
        // obj.value !== 2 ? setIsPaymentType( true ) : setIsPaymentType( false )
        // setSaleValue( input => ( { ...input, payment_type: { label: getFormattedMessage( "cash.label" ), value: 1 } } ) )
    };

    const getEmptyPaymentDetail = () => ({
        date: new Date(),
        reference: '',
        amount: '',
        payment_type: ''
    });

    const handlePaymentDetailChange = (index, name, value) => {
        const updatedDetails = [...saleValue.payment_details];
        updatedDetails[index][name] = value;
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
        setErrors('');
    };

    const handlePaymentDateChange = (index, date) => {
        const updatedDetails = [...saleValue.payment_details];
        updatedDetails[index].date = date;
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
    }

    const handleAddPayment = () => {
        setSaleValue(prev => ({
            ...prev,
            payment_details: [...prev.payment_details, getEmptyPaymentDetail()]
        }));
    };

    const handleRemovePayment = (index) => {
        const updatedDetails = saleValue.payment_details.filter((_, i) => i !== index);
        setSaleValue(prev => ({
            ...prev,
            payment_details: updatedDetails
        }));
    };

    const onPaymentTypeChange = ( obj ) => {
        setSaleValue( inputs => ( { ...inputs, payment_type: obj } ) );
        setErrors( '' );
    };

    const updatedQty = ( qty ) => {
        setQuantity( qty );
    };

    const updateCost = ( cost ) => {
        setNewCost( cost );
    };

    const updateDiscount = ( discount ) => {
        setNewDiscount( discount );
    };

    const updateTax = ( tax ) => {
        setNewTax( tax );
    };

    const updateSubTotal = ( subTotal ) => {
        setSubTotal( subTotal );
    };

    const updateSaleUnit = ( saleUnit ) => {
        setNewSaleUnit( saleUnit );
    };

    const handleCallback = ( date ) => {
        setSaleValue( previousState => {
            return { ...previousState, date: date }
        } );
        setErrors( '' );
    };

    const statusFilterOptions = getFormattedOptions( saleStatusOptions )
    const statusDefaultValue = statusFilterOptions.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    const paymentStatusFilterOptions = getFormattedOptions( salePaymentStatusOptions )
    const paymentStatusDefaultValue = paymentStatusFilterOptions.map( ( option ) => {
        return {
            value: option.id,
            label: option.name
        }
    } )

    // const paymentMethodOption = getFormattedOptions( paymentMethodOptions )
    // const paymentTypeDefaultValue = paymentMethodOption.map( ( option ) => {
    //     return {
    //         value: option.id,
    //         label: option.name
    //     }
    // } )

    const prepareFormData = ( prepareData ) => {
        const formValue = {
            date: moment( prepareData.date ).locale('en').toDate(),
            is_sale_created: "true",
            quotation_id: prepareData ? prepareData.quotation_id : '',
            customer_id: prepareData.customer_id.value ? prepareData.customer_id.value : prepareData.customer_id,
            warehouse_id: prepareData.warehouse_id.value ? prepareData.warehouse_id.value : prepareData.warehouse_id,
            discount: prepareData.discount,
            tax_rate: prepareData.tax_rate,
            tax_amount: calculateCartTotalTaxAmount( updateProducts, saleValue ),
            sale_items: updateProducts,
            shipping: prepareData.shipping,
            grand_total: calculateCartTotalAmount( updateProducts, saleValue ),
            received_amount: 0,
            paid_amount: prepareData.payment_status.value == 1 ? calculateCartTotalAmount( updateProducts, saleValue ) : 0,
            note: prepareData.notes,
            status: prepareData.status_id.value ? prepareData.status_id.value : prepareData.status_id,
            payment_status: prepareData.payment_status.value ? prepareData.payment_status.value : prepareData.payment_status,
            payment_type: prepareData.payment_status.value === 2 ? null : prepareData.payment_type.value ? prepareData.payment_type.value : prepareData.payment_type,
            payment_details: prepareData.payment_details,
            discount_type: prepareData.discount_type,
            discount_value: prepareData.discount_value
        }
        return formValue
    };

    const onSubmit = ( event ) => {
        event.preventDefault();
        const valid = handleValidation();
        if ( valid ) {
            if ( singleSale && !isQuotation ) {
                editSale( id, prepareFormData( saleValue ), navigate );
            } else {
                addSaleData( prepareFormData( saleValue ) );
                setSaleValue( saleValue );
            }
        }
    };

    const onBlurInput = ( el ) => {
        if ( el.target.value === '' ) {
            if ( el.target.name === "shipping" ) {
                setSaleValue( { ...saleValue, shipping: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "discount" ) {
                setSaleValue( { ...saleValue, discount: parseFloat(0).toFixed(decimalPlaces) } );
            }
            if ( el.target.name === "tax_rate" ) {
                setSaleValue( { ...saleValue, tax_rate: parseFloat(0).toFixed(decimalPlaces) } );
            }
        }
    }

    return (
        <div className='card'>
            <TabTitle title={placeholderText(id && !isQuotation ? "sale.edit.title" : "sale.create.title")} />
            <div className='card-body'>
                <div className='row'>
                    <div className='col-md-4'>
                        <label className='form-label'>
                            {getFormattedMessage( 'react-data-table.date.column.label' )}:
                        </label>
                        <span className='required' />
                        <div className='position-relative'>
                            <ReactDatePicker onChangeDate={handleCallback} newStartDate={saleValue.date} />
                        </div>
                        <span className='text-danger d-block fw-400 fs-small mt-2'>{errors[ 'date' ] ? errors[ 'date' ] : null}</span>
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='warehouse_id' data={warehouses} onChange={onWarehouseChange}
                            title={getFormattedMessage( 'warehouse.title' )} errors={errors[ 'warehouse_id' ]}
                            defaultValue={saleValue.warehouse_id} value={saleValue.warehouse_id} addSearchItems={singleSale}
                            isWarehouseDisable={true}
                            placeholder={placeholderText( 'product.input.warehouse.placeholder.label' )} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect name='customer_id' data={customers} onChange={onCustomerChange}
                            title={getFormattedMessage( 'customer.title' )} errors={errors[ 'customer_id' ]}
                            defaultValue={saleValue.customer_id} value={saleValue.customer_id}
                            placeholder={placeholderText( 'sale.select.customer.placeholder.label' )} />
                    </div>
                    <div className='mb-5'>
                        <label className='form-label'>
                            {getFormattedMessage( 'product.title' )}:
                        </label>
                        <ProductSearch values={saleValue} products={products} handleValidation={handleValidation}
                            updateProducts={updateProducts}
                            setUpdateProducts={setUpdateProducts} customProducts={customProducts} />
                    </div>
                    <div>
                        <label className='form-label'>
                            {getFormattedMessage( 'purchase.order-item.table.label' )}:
                        </label>
                        <span className='required' />
                        <ProductRowTable updateProducts={updateProducts} setUpdateProducts={setUpdateProducts}
                            updatedQty={updatedQty} frontSetting={frontSetting}
                            updateCost={updateCost} updateDiscount={updateDiscount}
                            updateTax={updateTax} updateSubTotal={updateSubTotal}
                            updateSaleUnit={updateSaleUnit}
                        />
                    </div>
                    <div className='col-12'>
                        <ProductMainCalculation inputValues={saleValue} decimalPlaces={decimalPlaces} allConfigData={allConfigData} updateProducts={updateProducts} frontSetting={frontSetting} />
                    </div>
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'globally.detail.order.tax' )}: </label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                className='form-control'
                                type='text' name='tax_rate' value={saleValue.tax_rate}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => {
                                    onChangeInput( e )
                                }} />
                            <InputGroup.Text>%</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <Form.Label
                            className='form-label'>{getFormattedMessage( 'globally.detail.discount' )}: </Form.Label>
                        <InputGroup>
                            <input aria-label='Dollar amount'
                                className='form-control'
                                type='text' name='discount_value' value={saleValue.discount_value}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>
                                <select
                                    className='border-0 bg-transparent'
                                    value={saleValue.discount_type}
                                    onChange={handleDiscountTypeChange}
                                >
                                    <option value={1}>%</option>
                                    <option value={2}>{frontSetting.value && frontSetting.value.currency_symbol}</option>
                                </select>
                            </InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <label
                            className='form-label'>{getFormattedMessage( 'globally.detail.shipping' )}: </label>
                        <InputGroup>
                            <input aria-label='Dollar amount' type='text'
                                className='form-control'
                                name='shipping' value={saleValue.shipping}
                                onBlur={( event ) => onBlurInput( event )} onFocus={( event ) => onFocusInput( event, decimalPlaces )}
                                onKeyPress={( event ) => decimalValidate( event )}
                                onChange={( e ) => onChangeInput( e )}
                            />
                            <InputGroup.Text>{frontSetting.value && frontSetting.value.currency_symbol}</InputGroup.Text>
                        </InputGroup>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <ReactSelect multiLanguageOption={statusFilterOptions} onChange={onStatusChange} name='status_id'
                            title={getFormattedMessage( 'globally.detail.status' )}
                            value={saleValue.status_id} errors={errors[ 'status_id' ]}
                            defaultValue={statusDefaultValue[ 0 ]}
                            placeholder={getFormattedMessage( 'globally.detail.status' )} />
                    </div>
                    <div className='col-md-4'>
                        <ReactSelect multiLanguageOption={paymentStatusFilterOptions} onChange={onPaymentStatusChange} name='payment_status'
                            title={getFormattedMessage( 'globally.detail.payment.status' )}
                            value={saleValue.payment_status} errors={errors[ 'payment_status' ]}
                            defaultValue={paymentStatusDefaultValue[ 0 ]}
                            placeholder={placeholderText( 'sale.select.payment-status.placeholder' )} />
                    </div>
                    {/* {saleValue.payment_status.value !== 2 && <div className='col-md-4'>
                        <ReactSelect title={getFormattedMessage( 'select.payment-type.label' )}
                            name='payment_type'
                            value={saleValue.payment_type} 
                            errors={errors[ 'payment_type' ]}
                            placeholder={placeholderText( 'sale.select.payment-type.placeholder' )}
                            defaultValue={saleValue.payment_type}
                            onChange={onPaymentTypeChange}
                        />
                    </div>} */}
                    {(saleValue?.payment_status?.value == 1 || saleValue?.payment_status?.value == 3) && (
                        <div className='col-md-12'>
                            <div className='row'>
                                <label className='form-label'>{getFormattedMessage('select.payment-type.label')}:</label>
                            </div>
                            {saleValue?.payment_details?.map((item, index) => (
                                <div key={index} className='row'>
                                    <div className='row col-md-11'>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('react-data-table.date.column.label')}:</label>
                                            <div className='position-relative'>
                                                <ReactDatePicker
                                                    onChangeDate={(date) => handlePaymentDateChange(index, date)}
                                                    newStartDate={item.date}
                                                    disableFuture={false}
                                                />
                                            </div>
                                        </div>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('globally.detail.reference')}:</label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='reference'
                                                value={item.reference}
                                                placeholder={placeholderText('reference-placeholder-label')}
                                                onChange={(e) => handlePaymentDetailChange(index, 'reference', e.target.value)}
                                            />
                                        </div>
                                        <div className='col-md-3 mb-3'>
                                            <label className='form-label'>{getFormattedMessage('amount.title')}:</label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                name='amount'
                                                value={item.amount}
                                                placeholder={placeholderText('expense.input.amount.placeholder.label')}
                                                onChange={(e) => handlePaymentDetailChange(index, 'amount', e.target.value)}
                                            />
                                            {errors.payment_details?.[index]?.amount && (
                                                <span className='text-danger'>{errors.payment_details[index].amount}</span>
                                            )}
                                        </div>
                                        <div className='col-md-3'>
                                            <ReactSelect
                                                data={paymentMethods.length > 0 && paymentMethods.filter(p => p.attributes.status == 1)}
                                                onChange={(value) => handlePaymentDetailChange(index, 'payment_type', value)}
                                                defaultValue={item.payment_type}
                                                value={item.payment_type}
                                                title={getFormattedMessage('select.payment-type.label')}
                                                errors={errors['payment_type']}
                                                placeholder={placeholderText('sale.select.payment-type.placeholder')}
                                            />
                                            {errors.payment_details?.[index]?.payment_type && (
                                                <span className='text-danger'>{errors.payment_details[index].payment_type}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='col-md-1 d-flex align-items-center justify-content-center gap-2 pt-2'>
                                        {saleValue.payment_details.length > 1 && (
                                            <span
                                                className='btn btn-outline-danger rounded-2 py-2 px-3 m-0'
                                                onClick={() => handleRemovePayment(index)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </span>
                                        )}
                                        {index === saleValue.payment_details.length - 1 && (
                                            <span
                                                className='btn btn-outline-secondary text-dark rounded-2 py-2 px-3 m-0'
                                                onClick={handleAddPayment}
                                            >
                                                <FontAwesomeIcon icon={faPlus} />
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {/* {isQuotation && <div className='col-md-4'>
                        <ReactSelect multiLanguageOption={paymentStatusFilterOptions} onChange={onPaymentStatusChange} name='payment_status'
                            title={getFormattedMessage( 'globally.detail.payment.status' )}
                            value={saleValue.payment_status} errors={errors[ 'payment_status' ]}
                            defaultValue={paymentStatusDefaultValue[ 0 ]}
                            placeholder={placeholderText( 'sale.select.payment-status.placeholder' )} />
                    </div>}
                    {isQuotation && isPaymentType && <div className='col-md-4'>
                        <ReactSelect title={getFormattedMessage( 'select.payment-type.label' )}
                            name='payment_type'
                            value={saleValue.payment_type} errors={errors[ 'payment_type' ]}
                            placeholder={placeholderText( 'sale.select.payment-type.placeholder' )}
                            defaultValue={paymentTypeDefaultValue[ 0 ]}
                            multiLanguageOption={paymentMethodOption}
                            onChange={onPaymentTypeChange}
                        />
                    </div>} */}
                    <div className='mb-3'>
                        <label className='form-label'>
                            {getFormattedMessage( 'globally.input.note.label' )}: </label>
                        <textarea name='notes' className='form-control' value={saleValue.notes}
                            placeholder={placeholderText( 'globally.input.note.placeholder.label' )}
                            onChange={( e ) => onNotesChangeInput( e )}
                        />
                    </div>
                    <ModelFooter onEditRecord={singleSale} onSubmit={onSubmit} link='/app/user/sales' />
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = ( state ) => {
    const { purchaseProducts, products, frontSetting, allConfigData, settings } = state;
    return { customProducts: prepareSaleProductArray( products ), purchaseProducts, products, frontSetting, allConfigData, settings }
}

export default connect( mapStateToProps, { editSale, fetchProductsByWarehouse } )( SalesForm )

