import apiConfig from '../../config/apiConfig';
import requestParam from '../../shared/requestParam';
import {setLoading} from './loadingAction';

export const totalPurchaseReportExcel = (dates, filter = {}, isLoading = true, setIsWarehouseValue) => async (dispatch) => {
    if (isLoading) {
        dispatch(setLoading(true))
    }
    await apiConfig.get(`total-purchase-report-excel`+requestParam(filter))
        .then((response) => {
            window.open(response.data.data.total_purchase_excel_url, '_blank');
            setIsWarehouseValue(false);
            if (isLoading) {
                dispatch(setLoading(false))
            }
        })
        .catch(() => {
        });
};
