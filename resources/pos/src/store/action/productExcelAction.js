import {setLoading} from './loadingAction';
import apiConfig from '../../config/apiConfig';
import {toastType} from '../../constants';
import {addToast} from './toastAction';
import requestParam from '../../shared/requestParam';

export const productExcelAction = (setIsWarehouseValue, isLoading = true, id, filter={}) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    await apiConfig.get(`products-export-excel` + `${id ? "?id=" + id : ""}`+requestParam(filter))
        .then((response) => {
            window.open(response.data.data.product_excel_url, '_blank');
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
