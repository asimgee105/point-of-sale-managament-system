import apiConfig from '../../config/apiConfig';
import {toastType} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from './loadingAction';
import requestParam from '../../shared/requestParam';

export const saleReturnExcelAction = (warehouse, setIsWarehouseValue, filter = {}, isLoading = true) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    await apiConfig.get(`sales-return-report-excel`+requestParam(filter))
        .then((response) => {
            window.open(response.data.data.sale_return_excel_url, '_blank');
            setIsWarehouseValue(false);
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response?.data?.message, type: toastType.ERROR}));
        });
};
