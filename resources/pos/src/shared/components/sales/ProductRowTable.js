import React, {useEffect} from 'react';
import {Table} from 'react-bootstrap-v5';
import ProductTableBody from './ProductTableBody';
import {getFormattedMessage} from '../../sharedMethod';

const ProductRowTable = (props) => {
    const {
        updateProducts, setUpdateProducts, updatedQty, updateCost, updateDiscount, updateTax,
        frontSetting, updateSubTotal, updateSaleUnit, isSaleReturn
    } = props;

    useEffect(() => {
        setUpdateProducts(updateProducts);
    }, [updateProducts]);

    return (
        <Table responsive>
            <thead>
            <tr>
                <th>{getFormattedMessage('product.title')}</th>
                <th>{getFormattedMessage('globally.detail.net-unit-price')}</th>
                <th>{getFormattedMessage('purchase.order-item.table.stock.column.label')}</th>
                <th className='text-lg-start text-center'>{getFormattedMessage('pos-qty.title')}</th>
                <th>{getFormattedMessage('globally.detail.discount')}</th>
                <th>{getFormattedMessage('globally.detail.tax')}</th>
                <th>{getFormattedMessage('globally.detail.subtotal')}</th>
                {isSaleReturn ? null : < th > {getFormattedMessage('react-data-table.action.column.label')}</th>}
            </tr>
            </thead>
            <tbody>
            {updateProducts && updateProducts.map((singleProduct, index) => {
                return <ProductTableBody singleProduct={singleProduct} key={index} index={index} updateProducts={updateProducts}
                                         setUpdateProducts={setUpdateProducts} frontSetting={frontSetting}
                                         updateQty={updatedQty} updateCost={updateCost}
                                         updateDiscount={updateDiscount} updateTax={updateTax}
                                         updateSubTotal={updateSubTotal} updateSaleUnit={updateSaleUnit}/>
                })}
            {!updateProducts.length &&
                <tr>
                    <td colSpan={8} className='fs-5 px-3 py-6 custom-text-center'>
                        {getFormattedMessage('sale.product.table.no-data.label')}
                    </td>
                </tr>
            }
            </tbody>
        </Table>
    )
};

export default ProductRowTable;
