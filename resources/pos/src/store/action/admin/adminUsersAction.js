import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    apiBaseURL,
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

export const fetchAdminUsers =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }

        let url = adminApiBaseURL.ADMIN_USERS;
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
                    type: adminActionType.FETCH_ADMIN_USERS,
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

export const fetchUser =
    (userId, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        apiConfig
            .get(adminApiBaseURL.ADMIN_USERS + "/" + userId)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_USER,
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
            });
    };

export const verifyUserEmail =
    (userId) =>
    async (dispatch) => {
        apiConfig
            .get(adminApiBaseURL.EMAIL_VERIFY + "/" + userId)
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

export const changeUserStatus =
    (userId, isUser = false) =>
    async (dispatch) => {
        apiConfig
            .get(isUser ? apiBaseURL.STATUS + "/" + userId : adminApiBaseURL.STATUS + "/" + userId)
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


export const createUser = (data, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(adminApiBaseURL.ADMIN_USERS, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("user.success.create.message"),
                })
            );
            navigate("/app/admin/users");
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

export const editUser = (id, data, navigate) => async (dispatch) => {
    dispatch(setSavingButton(true));
    await apiConfig
        .post(adminApiBaseURL.ADMIN_USERS + "/" + id, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: getFormattedMessage("user.success.edit.message"),
                })
            );
            navigate("/app/admin/users");
            dispatch(setSavingButton(false));
        })
        .catch(({ response }) => {
            dispatch(setSavingButton(false));
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const deleteUser = (userId, setNotDeletedItemModal, clearSelectedDeleteItem) => async (dispatch) => {
    apiConfig
        .delete(adminApiBaseURL.ADMIN_USERS, { data: userId })
        .then((response) => {
            dispatch(removeFromTotalRecord(1));
            dispatch({ type: adminActionType.DELETE_USER, payload: userId });
            setNotDeletedItemModal(response?.data?.data);
            dispatch(callFetchDataApi(true));
            dispatch(
                addToast({
                    text: getFormattedMessage("user.success.delete.message"),
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
        })
        .finally(() => {
            clearSelectedDeleteItem();
        });
};

export const changeUserPlan = (data, setChangePlan) => async (dispatch) => {
    await apiConfig
        .post(adminApiBaseURL.CHANGE_USER_PLAN, data)
        .then((response) => {
            setChangePlan(response.data.data);
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const changePasswordAdmin = (data, handleClose) => async (dispatch) => {
    await apiConfig
        .post(adminApiBaseURL.CHANGE_USER_PASSWORD, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response.data.message,
                })
            );
            handleClose();
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};