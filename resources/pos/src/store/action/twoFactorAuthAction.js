import {
    authActionType,
    commonApiBaseURL,
    ROLES,
    toastType,
    Tokens,
    twoFactorAuthActions,
} from "../../constants";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";
import apiConfig from "../../config/apiConfig";
import { fetchConfig } from "./configAction";
import { setLanguage } from "./changeLanguageAction";
import { getFormattedMessage, mapPermissionToRoute } from "../../shared/sharedMethod";
import { fetchPermissions } from "./permissionAction";
import { fetchFrontSetting } from "./frontSettingAction";
import { fetchLanguageData } from "./updateLanguageAction";
import Cookies from 'js-cookie';

export const getTwoAuthFactorQrCode = () => async (dispatch) => {
    dispatch(setLoading(true));
    await apiConfig
        .get(commonApiBaseURL.TWO_FECTOR_AUTH_QR)
        .then((response) => {
            dispatch({
                type: twoFactorAuthActions.GET_TWO_AUTH_QR,
                payload: response.data?.data,
            });
            dispatch(setLoading(false));
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

export const validateTwoFactorCode =
    (data, setIsSubmitting, closeModal, isFromPage = false) =>
    async (dispatch) => {
        dispatch(setLoading(true));

        try {
            const response = await apiConfig.post(
                commonApiBaseURL.VERIFY_TWO_FACTOR_AUTH,
                data
            );

            if (closeModal) {
                closeModal();
            }

            if (isFromPage) {
                const { token, permissions, user, expires_at, roles } =
                    response.data.data;
                const expiryMinutes = Number(expires_at) > 0 ? Number(expires_at) : 5000;

                localStorage.setItem(Tokens.ADMIN, token);
                localStorage.setItem(Tokens.GET_PERMISSIONS, JSON.stringify(permissions));
                localStorage.setItem(Tokens.USER, user.email);
                localStorage.setItem(Tokens.IMAGE, user.image_url);
                localStorage.setItem(Tokens.FIRST_NAME, user.first_name);
                localStorage.setItem(Tokens.LANGUAGE, user.language);
                localStorage.setItem(Tokens.LAST_NAME, user.last_name);
                localStorage.setItem("loginUserArray", JSON.stringify(user));
                localStorage.setItem(
                    "user_time",
                    Date.now() + expiryMinutes * 60 * 1000
                );

                Cookies.set("authToken", token, {
                    expires: new Date(
                        new Date().getTime() + expiryMinutes * 60 * 1000
                    ),
                });

                dispatch({
                    type: authActionType.LOGIN_USER,
                    payload: response.data.data,
                });

                dispatch(setLanguage(user.language));
                localStorage.setItem(Tokens.UPDATED_LANGUAGE, user.language);

                const mappedRoutes = permissions.map(mapPermissionToRoute);

                if (roles === ROLES.SUPER_ADMIN) {
                    window.location.href = "/app/admin/dashboard";
                } else {
                    if (mappedRoutes?.length) {
                        if (permissions.includes("manage_dashboard")) {
                            window.location.href = "/app/user/dashboard";
                        } else if (
                            mappedRoutes.length === 1 &&
                            permissions.includes("manage_pos_screen")
                        ) {
                            window.location.href = "/app/user/pos";
                        } else {
                            window.location.href = mappedRoutes[0];
                        }
                    } else {
                        window.location.href = "/app/user/dashboard";
                    }

                    dispatch(fetchPermissions());
                    dispatch(fetchConfig());
                }

                dispatch(fetchFrontSetting());
                dispatch(
                    addToast({
                        text: getFormattedMessage("login.success.message"),
                    })
                );

                if (user.language) {
                    try {
                        await dispatch(fetchLanguageData(user.language_id));
                    } catch (err) {
                        console.error("Error fetching language data:", err);
                    }
                }
            }
        }
         catch ({ response }) {
            dispatch(
                addToast({
                    text: response?.data?.message,
                    type: toastType.ERROR,
                })
            );
            setLoading(false);
        } finally {
            dispatch(setLoading(false));
            if(setIsSubmitting){
                setIsSubmitting(false);
            }
        }
    };

export const enableDisableTwoFactorAuth =
    (data, setIsSubmitting, closeModal) => async (dispatch) => {
        dispatch(setLoading(true));
        await apiConfig
            .post(commonApiBaseURL.ENABLE_DISABLE_TWO_FACTOR_AUTH, data)
            .then((response) => {
                dispatch(addToast({ text: response.data.message }));
                dispatch(setLoading(false));
                dispatch(fetchConfig());
                if (response.data.data?.recovery_codes) {
                    dispatch({
                        type: twoFactorAuthActions.SET_RECOVERY_CODES,
                        payload: {
                            recovery_codes: response.data.data.recovery_codes,
                            download_url: response.data.data.download_url
                        }
                    });
                } else {
                    closeModal();
                }
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
                dispatch(setLoading(false));
                setIsSubmitting(false);
            });
    };
