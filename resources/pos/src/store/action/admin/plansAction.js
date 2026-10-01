import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../constants";
import requestParam from "../../../shared/requestParam";
import { getFormattedMessage } from "../../../shared/sharedMethod";
import { setLoading } from "../loadingAction";
import { setSavingButton } from "../saveButtonAction";
import { addToast } from "../toastAction";
import {
    addInToTotalRecord,
    removeFromTotalRecord,
    setTotalRecord,
} from "../totalRecordAction";
import { callFetchDataApi } from "../updateBrand";

export const fetchPlans =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = adminApiBaseURL.PLANS;
        if (
            !_.isEmpty(filter) &&
            (filter.page || filter.pageSize || filter.search)
        ) {
            url += requestParam(filter, null, null, null, url);
        }
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_PLANS,
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

export const fetchPlan =
    (id, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .get(`${adminApiBaseURL.PLANS}/${id}`)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_PLAN,
                    payload: response.data.data,
                });
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

export const makeDefaultPlanRequest = (id) => async (dispatch) => {
    await apiConfig
        .get(`${adminApiBaseURL.PLAN_DEFAULT}/${id}`)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
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

export const createPlan = (data, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(adminApiBaseURL.PLANS, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("plan.success.create.message"),
                })
            );
            navigate("/app/admin/plans");
            dispatch(addInToTotalRecord(1));
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const editPlan = (id, data, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .put(`${adminApiBaseURL.PLANS}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("plan.success.edit.message"),
                })
            );
            navigate("/app/admin/plans");
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const deletePlan = (id, setNotDeletedItemModal, setSelectedIds, setClearSelectedRows) => async (dispatch) => {
    await apiConfig
        .delete(adminApiBaseURL.PLANS, { data: id })
        .then((response) => {
            dispatch({
                type: adminActionType.DELETE_PLAN,
                payload: id,
            });
            dispatch(removeFromTotalRecord(1));
            setNotDeletedItemModal(response?.data?.data);
            dispatch(callFetchDataApi(true));
            dispatch(
                addToast({
                    text: getFormattedMessage("plan.success.delete.message"),
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        })
        .finally(() => {
            setClearSelectedRows(true);
            setSelectedIds([]);
        })
};
