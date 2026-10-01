import apiConfig from '../../config/apiConfig';
import {
    adminApiBaseURL,
    settingActionType,
    toastType,
} from '../../constants';
import {addToast} from './toastAction';
import {setLoading} from "./loadingAction";
import {setSavingButton} from "./saveButtonAction";
import {getFormattedMessage} from "../../shared/sharedMethod";

export const fetchMailSettings = () => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig.get(adminApiBaseURL.MAIL_SETTINGS)
        .then((response) => {
            dispatch({type: settingActionType.FETCH_MAIL_SETTINGS, payload: response.data.data})
            dispatch(setLoading(false));
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response?.data?.message, type: toastType.ERROR}));
            dispatch(setLoading(false));
        });
};

export const editMailSettings = (mailSettings) => async (dispatch) => {
    dispatch(setSavingButton(true))
    apiConfig.post(`${adminApiBaseURL.MAIL_SETTINGS}/update`, mailSettings)
        .then((response) => {
            dispatch(addToast({text: getFormattedMessage('mail-settings.success.edit.message')}));
            dispatch(setSavingButton(false))
        })
        .catch(({response}) => {
            dispatch(setSavingButton(false))
            dispatch(addToast(
                {text: response?.data?.message, type: toastType.ERROR}));
        });
};

export const sendTestEmail = () => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig.post(adminApiBaseURL.SEND_TEST_EMAIL)
        .then((response) => {
            dispatch(addToast({text: response.data.message}));
            dispatch(setLoading(false));
        })
        .catch(({response}) => {
            dispatch(addToast(
                {text: response.data.message, type: toastType.ERROR}));
            dispatch(setLoading(false));
        });
};
