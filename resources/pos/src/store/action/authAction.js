import apiConfig from "../../config/apiConfig";
import { authActionType, Tokens, toastType, apiBaseURL, ROLES, configActionType } from "../../constants";
import { fetchPermissions } from "./permissionAction";
import { addToast } from "./toastAction";
import { fetchFrontSetting } from "./frontSettingAction";
import { setLanguage } from "./changeLanguageAction";
import { getFormattedMessage, mapPermissionToRoute } from "../../shared/sharedMethod";
import { fetchLanguageData, updateLanguage } from '../../store/action/updateLanguageAction';
import { fetchConfig } from "./configAction";
import Cookies from 'js-cookie';

export const loginAction = (user, navigate, setLoading) => async (dispatch) => {
    try {
        const response = await apiConfig.post("login", user);
        const data = response?.data?.data;

        if (!data) {
            throw new Error("Invalid API response");
        }

        if (data?.two_factor) {
            navigate("/app/verify-otp", {
                state: { email: data?.user_email, challengeToken: data?.challenge_token },
            });
            return;
        }

        const userData = data?.user || {};
        const permissions = Array.isArray(data?.permissions) ? data.permissions : [];

        const expiresAt = Number(data?.expires_at) > 0 ? Number(data.expires_at) : 5000;
        const expiryTime = Date.now() + expiresAt * 60 * 1000;

        localStorage.setItem(Tokens.ADMIN, data?.token || "");
        localStorage.setItem(Tokens.GET_PERMISSIONS, JSON.stringify(permissions));
        localStorage.setItem(Tokens.USER, userData?.email || "");
        localStorage.setItem(Tokens.IMAGE, userData?.image_url || "");
        localStorage.setItem(Tokens.FIRST_NAME, userData?.first_name || "");
        localStorage.setItem(Tokens.LANGUAGE, userData?.language || "");
        localStorage.setItem(Tokens.LAST_NAME, userData?.last_name || "");
        localStorage.setItem("loginUserArray", JSON.stringify(userData));
        localStorage.setItem("user_time", expiryTime.toString());

        Cookies.set("authToken", data?.token || "", {
            expires: new Date(expiryTime),
            secure: window.location.protocol === "https:",
            sameSite: "Lax",
        });

        dispatch({
            type: authActionType.LOGIN_USER,
            payload: data,
        });

        dispatch(setLanguage(userData?.language || ""));
        localStorage.setItem(Tokens.UPDATED_LANGUAGE, userData?.language || "");

        const mappedRoutes = permissions
            .map((perm) => {
                try {
                    return mapPermissionToRoute(perm);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        if (data?.roles === ROLES.SUPER_ADMIN) {
            window.location.href = "/app/admin/dashboard";
        } else {
            if (permissions.includes("manage_dashboard")) {
                window.location.href = "/app/user/dashboard";
            } else if (
                mappedRoutes.length === 1 &&
                permissions.includes("manage_pos_screen")
            ) {
                window.location.href = "/app/user/pos";
            } else if (mappedRoutes.length > 0) {
                window.location.href = mappedRoutes[0];
            } else {
                window.location.href = "/app/user/dashboard";
            }

            try {
                dispatch(fetchPermissions());
                dispatch(fetchConfig());
            } catch {}
        }

        dispatch(fetchFrontSetting());

        dispatch(
            addToast({
                text: getFormattedMessage("login.success.message"),
            })
        );

        if (userData?.language_id) {
            try {
                await dispatch(fetchLanguageData(userData.language_id));
            } catch {}
        }
    } catch (error) {
        dispatch(
            addToast({
                text:
                    error?.response?.data?.message ||
                    error?.message ||
                    "Login failed",
                type: toastType.ERROR,
            })
        );

    } finally {
        setLoading(false);
    }
};

export const logoutAction = (token, navigate) => async (dispatch) => {
    await apiConfig
        .post("logout", token)
        .then(() => {
            localStorage.removeItem(Tokens.ADMIN);
            localStorage.removeItem(Tokens.USER);
            localStorage.removeItem(Tokens.IMAGE);
            localStorage.removeItem(Tokens.FIRST_NAME);
            localStorage.removeItem(Tokens.LAST_NAME);
            localStorage.removeItem("loginUserArray");
            localStorage.removeItem(Tokens.UPDATED_EMAIL);
            localStorage.removeItem(Tokens.UPDATED_FIRST_NAME);
            localStorage.removeItem(Tokens.UPDATED_LAST_NAME);
            localStorage.removeItem(Tokens.USER_IMAGE_URL);
            Cookies.remove('authToken');
            window.location.href = "/app/login"
            dispatch(
                addToast({
                    text: getFormattedMessage("logout.success.message"),
                })
            );
            dispatch({
                type: configActionType.FETCH_ALL_CONFIG,
                payload: '',
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const forgotPassword = (user) => async (dispatch) => {
    await apiConfig
        .post(apiBaseURL.ADMIN_FORGOT_PASSWORD, user)
        .then((response) => {
            dispatch({
                type: authActionType.ADMIN_FORGOT_PASSWORD,
                payload: response?.data?.message,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "forgot-password-form.success.reset-link.label"
                    ),
                })
            );
        })
        .catch(({ response }) => {
            dispatch({ type: toastType.ERROR, payload: response?.data?.message });
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const resetPassword = (user, navigate) => async (dispatch) => {
    await apiConfig
        .post(apiBaseURL.ADMIN_RESET_PASSWORD, user)
        .then((response) => {
            dispatch({
                type: authActionType.ADMIN_RESET_PASSWORD,
                payload: user,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "reset-password.success.update.message"
                    ),
                })
            );
            navigate("/app/login");
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};


export const register = (data, navigate, setDisable) => async (dispatch) => {
    await apiConfig
        .post("register", data)
        .then(() => {
            navigate("/app/login");
            dispatch(
                addToast({
                    text: getFormattedMessage("register.success.message"),
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        })
        .finally(() => {
            setDisable(false);
        });
};