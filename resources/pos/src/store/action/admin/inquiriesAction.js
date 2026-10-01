import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../constants";
import requestParam from "../../../shared/requestParam";
import { setLoading } from "../loadingAction";
import { addToast } from "../toastAction";
import { removeFromTotalRecord, setTotalRecord } from "../totalRecordAction";
import { callFetchDataApi } from "../updateBrand";

export const fetchInquries =
    (filter, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = adminApiBaseURL.INQURIES;
        if (
            !_.isEmpty(filter) &&
            (filter.page ||
                filter.pageSize ||
                filter.search ||
                filter.order_By ||
                filter.created_at)
        ) {
            url += requestParam(filter, null, null, null, url);
        }
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_INQUIRIES,
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
                if (isLoading) {
                    dispatch(setLoading(false));
                }
            });
    };

export const deleteInquiry = (id, setNotDeletedItemModal, clearSelectedDeleteItem) => (dispatch) => {
    apiConfig
        .delete(adminApiBaseURL.INQURIES, { data: id })
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(removeFromTotalRecord(1));
            setNotDeletedItemModal(response?.data?.data);
            dispatch(callFetchDataApi(true));
        })
        .catch(({ response }) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
        })
        .finally(() => {
            clearSelectedDeleteItem();
        });
};
