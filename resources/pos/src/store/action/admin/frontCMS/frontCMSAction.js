import apiConfig from "../../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL,
    toastType,
} from "../../../../constants";
import requestParam from "../../../../shared/requestParam";
import { setLoading } from "../../loadingAction";
import { addToast } from "../../toastAction";
import { removeFromTotalRecord, setTotalRecord } from "../../totalRecordAction";
import { callFetchDataApi } from "../../updateBrand";

export const fetchFrontCMS =
    (URL, ACTION, filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }

            let url = URL;
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at)
            ) {
                url += requestParam(filter, null, null, null, url, false);
            }

            await apiConfig
                .get(`${url}`)
                .then((response) => {
                    dispatch({
                        type: ACTION,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }

                    {response.data.meta && dispatch(
                        setTotalRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );}
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

export const updateFrontCMS =
    (data, URL, ACTION, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            await apiConfig
                .post(`${URL}`, data)
                .then((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                        })
                    );
                    dispatch(fetchFrontCMS(URL, ACTION));
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

export const updateServicesFrontCMS =
    (data, URL, ACTION, id, handleClose, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            await apiConfig
                .post(`${URL}/${id}`, data)
                .then((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                        })
                    );
                    dispatch(fetchFrontCMS(URL, ACTION));
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

export const addPartner = (data, handleClose, clearData) => (dispatch) => {
    apiConfig
        .post(adminApiBaseURL.PARTNERS, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.PARTNERS,
                    adminActionType.FETCH_PARTNERS
                )
            );
            handleClose();
            clearData();
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

export const editPartner = (data, id, handleClose) => (dispatch) => {
    apiConfig
        .post(`${adminApiBaseURL.PARTNERS}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.PARTNERS,
                    adminActionType.FETCH_PARTNERS
                )
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
        });
};

export const editFeature = (data, id, handleClose) => (dispatch) => {
    apiConfig
        .post(`${adminApiBaseURL.FEATURES}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.FEATURES,
                    adminActionType.FETCH_FEATURES
                )
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
        });
};

export const deletePartner = (id) => (dispatch) => {
    apiConfig
        .delete(`${adminApiBaseURL.PARTNERS}/${id}`)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.PARTNERS,
                    adminActionType.FETCH_PARTNERS
                )
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


export const updateWhyChooseUsForntCMS =
    (data, URL, ACTION, id, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            await apiConfig
                .post(`${URL}/${id}`, data)
                .then((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                        })
                    );
                    dispatch(fetchFrontCMS(URL, ACTION));
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


export const addFAQs = (data, clearData, handleClose) => (dispatch) => {
    apiConfig
        .post(adminApiBaseURL.FRONT_CMS_FAQS, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.FRONT_CMS_FAQS,
                    adminActionType.FETCH_FAQS
                )
            );
            clearData();
            handleClose();
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

export const editFAQs = (data, id, handleClose) => (dispatch) => {
    apiConfig
        .post(`${adminApiBaseURL.FRONT_CMS_FAQS}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.FRONT_CMS_FAQS,
                    adminActionType.FETCH_FAQS
                )
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
        });
};

export const deleteFAQs = (id, setNotDeletedItemModal, clearSelectedDeleteItem) => (dispatch) => {
    apiConfig
        .delete(adminApiBaseURL.FRONT_CMS_FAQS, { data: id })
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

export const addTestimonials = (data, handleClose, clearData) => (dispatch) => {
    apiConfig
        .post(adminApiBaseURL.TESTIMONIALS, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.TESTIMONIALS,
                    adminActionType.FETCH_TESTIMONIALS
                )
            );
            handleClose();
            clearData();
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


export const updateTestimonials = (data, id, handleClose) => (dispatch) => {
    apiConfig
        .post(`${adminApiBaseURL.TESTIMONIALS}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.TESTIMONIALS,
                    adminActionType.FETCH_TESTIMONIALS
                )
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
        });
};

export const deleteTestimonials = (id) => (dispatch) => {
    apiConfig
        .delete(`${adminApiBaseURL.TESTIMONIALS}/${id}`)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.TESTIMONIALS,
                    adminActionType.FETCH_TESTIMONIALS
                )
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

export const fetchPages = () => (dispatch) => {
    apiConfig
        .get(adminApiBaseURL.PAGES)
        .then((response) => {
            dispatch({
                type: adminActionType.FETCH_PAGES,
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

export const updatePages = (data) => (dispatch) => {
    apiConfig
        .post(adminApiBaseURL.PAGES, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(fetchPages());
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

export const editStep = (data, id, handleClose) => (dispatch) => {
    apiConfig
        .post(`${adminApiBaseURL.STEPS}/${id}`, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            dispatch(
                fetchFrontCMS(
                    adminApiBaseURL.STEPS,
                    adminActionType.FETCH_STEPS
                )
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
        });
};