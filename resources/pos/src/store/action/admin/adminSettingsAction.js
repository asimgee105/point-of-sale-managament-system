import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../constants";
import { fetchConfig } from "../configAction";
import { fetchFrontSetting } from "../frontSettingAction";
import { setLoading } from "../loadingAction";
import { addToast } from "../toastAction";

export const fetchPaymentSettings =
    (isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .get(`${adminApiBaseURL.PAYMENT_SETTINGS}`)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_PAYMENT_SETTINGS,
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

export const updatePaymentSettings =
    (data, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .post(`${adminApiBaseURL.PAYMENT_SETTINGS}`, data)
            .then((response) => {
                if (isLoading) {
                    dispatch(setLoading(false));
                }
                dispatch(
                    addToast({
                        text: response?.data?.message,
                    })
                );
                dispatch(fetchPaymentSettings());
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

export const fetchAdminSettings =
    (isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .get(`${adminApiBaseURL.SETTINGS}`)
            .then((response) => {
                if (isLoading) {
                    dispatch(setLoading(false));
                }
                dispatch({
                    type: adminActionType.SETTINGS,
                    payload: response.data.data,
                });
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

export const updateAdminSettings =
    (data, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .post(`${adminApiBaseURL.SETTINGS}`, data)
            .then((response) => {
                if (isLoading) {
                    dispatch(setLoading(false));
                }
                dispatch(
                    addToast({
                        text: response?.data?.message,
                    })
                );
                dispatch(fetchAdminSettings());
                dispatch(fetchFrontSetting());
                dispatch(fetchConfig());
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

export const backupDatabase = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await apiConfig.post(`${adminApiBaseURL.BACKUP_DATABASE}`, {}, {
            responseType: 'blob'
        });
        
        dispatch(setLoading(false));
        
        // Create a blob URL for the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.sql`);
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        dispatch(
            addToast({
                text: 'Database backup successfully',
            })
        );
    } catch (error) {
        dispatch(setLoading(false));
        dispatch(
            addToast({
                text: error.response?.data?.message || 'Database backup failed',
                type: toastType.ERROR,
            })
        );
    }
};