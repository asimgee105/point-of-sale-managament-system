import apiConfig from "../../config/apiConfig";
import { apiBaseURL, toastType, languagesActionType, adminApiBaseURL } from "../../constants";
import { addToast } from "./toastAction";
import requestParam from "../../shared/requestParam";
import { setTotalRecord } from "./totalRecordAction";
import { setLoading } from "./loadingAction";
import { getFormattedMessage } from "../../shared/sharedMethod";
import { fetchSelectedLanguageData } from "./updateLanguageAction";

export const fetchLanguages =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = apiBaseURL.LANGUAGES;
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
        apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: languagesActionType.FETCH_LANGUAGES,
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

export const fetchLanguage = (unitId, singleUnit) => async (dispatch) => {
    apiConfig
        .get(apiBaseURL.LANGUAGES + "/" + unitId, singleUnit)
        .then((response) => {
            dispatch({
                type: languagesActionType.FETCH_LANGUAGE,
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
        });
};

export const addLanguage = (base_units) => async (dispatch) => {
    await apiConfig
        .post(adminApiBaseURL.LANGUAGES, base_units)
        .then((response) => {
            dispatch({
                type: languagesActionType.ADD_LANGUAGE,
                payload: response.data.data,
            });
            dispatch(fetchLanguages({order_By:"created_at", direction: "desc" }));
            dispatch(
                addToast({
                    text: getFormattedMessage("language.save.success.message"),
                })
            );
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const editLanguage =
    (unitId, units, handleClose) => async (dispatch) => {
        apiConfig
            .patch(adminApiBaseURL.LANGUAGES + "/" + unitId, units)
            .then((response) => {
                dispatch({
                    type: languagesActionType.EDIT_LANGUAGE,
                    payload: response.data.data,
                });
                handleClose(false);
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "language.edit.success.message"
                        ),
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

export const deleteLanguage = (languageId) => async (dispatch) => {
    apiConfig
        .delete(adminApiBaseURL.LANGUAGES + "/" + languageId)
        .then((response) => {
            dispatch({
                type: languagesActionType.DELETE_LANGUAGE,
                payload: languageId,
            });
            dispatch(
                addToast({
                    text: getFormattedMessage(
                        "language.deleted.success.message"
                    ),
                })
            );
            dispatch(fetchLanguages({order_By:"created_at", direction: "desc" }));
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

export const fetchLanguageData = (languageId) => async (dispatch) => {
    apiConfig
        .get(adminApiBaseURL.LANGUAGES + "/translation/" + languageId)
        .then((response) => {
            dispatch({
                type: languagesActionType.FETCH_LANGUAGE_DATA,
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
        });
};

export const editLanguageData =
    (languageId, languageData) => async (dispatch) => {
        apiConfig
            .post(
                adminApiBaseURL.LANGUAGES + "/translation/" + languageId + "/update",
                languageData
            )
            .then((response) => {
                const selectedLanguage =
                    localStorage.getItem("updated_language");
                dispatch(
                    addToast({
                        text: getFormattedMessage(
                            "change-language.update.success.message"
                        ),
                    })
                );
                dispatch(fetchLanguageData(languageId));
                if (selectedLanguage === languageData.iso_code) {
                    dispatch(fetchSelectedLanguageData(languageId));
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

export const fetchAllLanguage = () => async (dispatch) => {
    apiConfig
        .get(`languages?page[size]=0`)
        .then((response) => {
            dispatch({
                type: languagesActionType.FETCH_LANGUAGES,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const toggleLanguageStatus = (languageId) => async (dispatch) => {
    try {
        const response = await apiConfig.post(adminApiBaseURL.LANGUAGES + "/" + languageId + "/toggle-status");
        dispatch(fetchLanguages({order_By:"created_at", direction: "desc" }));
        dispatch(
            addToast({
                text: response?.data?.message || getFormattedMessage("language.status.changed.success.message"),
            })
        );
        return { success: true };
    } catch ({ response }) {
        dispatch(
            addToast({
                text: response?.data?.message,
                type: toastType.ERROR,
            })
        );
        return { success: false };
    }
};

export const toggleLanguageDefault = (languageId) => async (dispatch) => {
    try {
        const response = await apiConfig.post(adminApiBaseURL.LANGUAGES + "/" + languageId + "/toggle-default");
        dispatch(fetchLanguages({order_By:"created_at", direction: "desc" }));
        dispatch(
            addToast({
                text: response?.data?.message || getFormattedMessage("language.default.changed.success.message"),
            })
        );
        return { success: true };
    } catch ({ response }) {
        dispatch(
            addToast({
                text: response?.data?.message,
                type: toastType.ERROR,
            })
        );
        return { success: false };
    }
};
