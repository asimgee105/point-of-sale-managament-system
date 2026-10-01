import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../constants";
import requestParam from "../../../shared/requestParam";
import { setLoading } from "../loadingAction";
import { addToast } from "../toastAction";
import { setTotalRecord } from "../totalRecordAction";

export const fetchSubscriptions =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = adminApiBaseURL.SUBSCRIPTIONS;
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
                    type: adminActionType.FETCH_SUBSCRIPTIONS,
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

export const updateSubscription =
    (data, id, handleClose, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = adminApiBaseURL.SUBSCRIPTIONS;
            await apiConfig
                .post(`${url}/${id}/update`, data)
                .then((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                        })
                    );
                    handleClose();
                })
                .catch(({ response }) => {
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                });
        };