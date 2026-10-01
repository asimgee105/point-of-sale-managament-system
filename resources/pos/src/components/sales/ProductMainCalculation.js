import React from "react";
import {
    calculateCartTotalAmount,
} from "../../shared/calculation/calculation";
import {
    calculateMainAmounts,
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";

const ProductMainCalculation = (props) => {
    const { inputValues, updateProducts, frontSetting, allConfigData, decimalPlaces = 2 } = props;

    const {
        discountAmount,
        taxCal,
    } = calculateMainAmounts(updateProducts, inputValues);

    return (
        <div className="col-xxl-5 col-lg-6 col-md-6 col-12 float-end">
            <div className="card">
                <div className="card-body pt-7 pb-2">
                    <div className="table-responsive">
                        <table className="table border">
                            <tbody>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "globally.detail.order.tax"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            taxCal
                                        )}{" "}
                                        (
                                        {parseFloat(
                                            inputValues.tax_rate
                                                ? inputValues.tax_rate
                                                : 0
                                        ).toFixed(decimalPlaces)}
                                        ) %
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "globally.detail.discount"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            parseFloat(discountAmount).toFixed(decimalPlaces)
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage(
                                            "globally.detail.shipping"
                                        )}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            inputValues.shipping
                                                ? inputValues.shipping
                                                : 0
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-primary">
                                        {getFormattedMessage(
                                            "globally.detail.grand.total"
                                        )}
                                    </td>
                                    <td className="py-3 text-primary">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting.value &&
                                                frontSetting.value
                                                    .currency_symbol,
                                            calculateCartTotalAmount(
                                                updateProducts,
                                                inputValues
                                            )
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductMainCalculation;
