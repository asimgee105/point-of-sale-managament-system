import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../constants";
import requestParam from "../../../shared/requestParam";
import { setLoading } from "../loadingAction";
import { setSavingButton } from "../saveButtonAction";
import { addToast } from "../toastAction";
import { setTotalRecord } from "../totalRecordAction";

export const fetchCashPayments =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = adminApiBaseURL.CASH_PAYMENTS;
        if (
            !_.isEmpty(filter) &&
            (filter.page || filter.pageSize || filter.search)
        ) {
            url += requestParam(filter, null, null, null, url, false);
        }
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_CASH_PAYMENTS,
                    payload: response.data.data,
                });
                dispatch(
                    setTotalRecord(
                        response.data.meta.total !== undefined &&
                            response.data.meta.total >= 0
                            ? response.data.meta.total
                            : response.data.data.total
                    )
                );
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            })
            .catch(({ response }) => {
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
            });
    };

export const changeCashPaymentStatus =
    (id, data, filter) => async (dispatch) => {
        dispatch(setSavingButton(true));
        await apiConfig
            .post(`${adminApiBaseURL.SUBSCRIPTIONS}/${id}/status`, data)
            .then((response) => {
                dispatch(fetchCashPayments(filter));
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.SUCCESS,
                    })
                );
                dispatch(setSavingButton(false));
            })
            .catch(({ response }) => {
                dispatch(
                    addToast({
                        text: response?.data?.message,
                        type: toastType.ERROR,
                    })
                );
                dispatch(setSavingButton(false));
            });
    };
