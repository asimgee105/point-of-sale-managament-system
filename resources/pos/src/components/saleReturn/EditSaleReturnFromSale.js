import React, {useEffect} from 'react';
import SaleReturnForm from './SaleReturnForm';
import MasterLayout from '../MasterLayout';
import HeaderTitle from '../header/HeaderTitle';
import {connect} from 'react-redux';
import {fetchAllWarehouses} from '../../store/action/warehouseAction';
import {fetchAllCustomer} from '../../store/action/customerAction';
import {useParams} from 'react-router-dom';
import {fetchSaleReturn} from '../../store/action/salesReturnAction';
import {getFormattedMessage} from '../../shared/sharedMethod';
import Spinner from "../../shared/components/loaders/Spinner";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";

const EditSaleReturn = (props) => {
    const {fetchSaleReturn, salesReturn, customers, fetchAllCustomer, warehouses, fetchAllWarehouses, isLoading} = props;
    const {id} = useParams();
    const isSaleReturnFromSale = true

    useEffect(() => {
        fetchAllCustomer();
        fetchAllWarehouses();
        fetchSaleReturn(id, isSaleReturnFromSale);
    }, [])

    const itemsValue = salesReturn && salesReturn.attributes && {
        date: salesReturn.attributes.date,
        warehouse_id: {
            value:  salesReturn.attributes.warehouse_id,
            label: salesReturn.attributes.warehouse_name,
        },
        customer_id: {
            value:  salesReturn.attributes.customer_id,
            label: salesReturn.attributes.customer_name,
        },
        tax_rate: salesReturn.attributes.tax_rate,
        tax_amount: salesReturn.attributes.tax_amount,
        discount: salesReturn.attributes.discount,
        shipping: salesReturn.attributes.shipping,
        grand_total : salesReturn.attributes.grand_total,
        amount: salesReturn.attributes.amount,
        sale_items: salesReturn.attributes.sale_return_items.map((item) => ({
            code: item.product && item.product.code,
            name: item.product && item.product.name,
            product_unit: item.product.product_unit,
            product_id: item.product_id,
            short_name: item.sale_unit && item.sale_unit.short_name,
            stock_alert:  item.product && item.product.stock_alert,
            product_price: item.product_price,
            fix_net_unit: item.product_price,
            net_unit_price: item.product_price,
            tax_type: item.tax_type,
            tax_value: item.tax_value,
            tax_amount: item.tax_amount,
            discount_type: item.discount_type,
            discount_value: item.discount_value,
            discount_amount: item.discount_amount,
            isEdit: true,
            stock: "",
            sold_quantity: item.sold_quantity,
            sub_total: item.sub_total,
            sale_unit: item.sale_unit && item.sale_unit.id && item.sale_unit.id,
            quantity:  item.quantity,
            id: item.id,
            sale_return_item_id: item.id,
            newItem: '',
            isSaleReturnEdit: true,
        })),
        id: salesReturn.id,
        status_id: salesReturn.attributes.status,
        note:salesReturn.attributes.note,
        isSaleReturnEdit: true,
        sale_return_id: salesReturn.id,
        sale_id: id,
        sale_reference: salesReturn.attributes.reference_code,
    };

    return (
        <MasterLayout>
            <TopProgressBar/>
            <HeaderTitle title={getFormattedMessage('sale-return.edit.title')} to='/app/user/sales'/>
            {isLoading ? <Spinner /> :
                salesReturn && <SaleReturnForm singleSale={itemsValue} isEdit={true} id={itemsValue?.sale_return_id} customers={customers} warehouses={warehouses}/>}
        </MasterLayout>
    )
}

const mapStateToProps = (state) => {
    const {salesReturn, customers, warehouses, isLoading} = state;
    return {salesReturn, customers, warehouses, isLoading}
};

export default connect(mapStateToProps, {fetchSaleReturn, fetchAllCustomer, fetchAllWarehouses})(EditSaleReturn);
