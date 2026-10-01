import apiConfig from "../../config/apiConfig";
import { apiBaseURL, plansActionType, toastType } from "../../constants";
import requestParam from "../../shared/requestParam";
import { setLoading } from "./loadingAction";
import { addToast } from "./toastAction";
import { setTotalRecord } from "./totalRecordAction";

export const fetchPlans =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.PLANS;
            if (
                !_.isEmpty(filter) &&
                (filter.page ||
                    filter.pageSize ||
                    filter.search ||
                    filter.order_By ||
                    filter.created_at)
            ) {
                url += requestParam(filter);
            }
            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: plansActionType.FETCH_PLANS,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const fetchCurrentUserPlan =
    (isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }

            apiConfig
                .get(apiBaseURL.CURRENT_PLAN)
                .then((response) => {
                    dispatch({
                        type: plansActionType.FETCH_USER_CURRENT_PLAN,
                        payload: response.data.data,
                    });
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                })
                .catch((response) => {
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const fetchPaymentMethods = () => async (dispatch) => {
    apiConfig
        .get(apiBaseURL.SUBSCRIPTION_PAYMENT_METHODS)
        .then((response) => {
            dispatch({
                type: plansActionType.FETCH_PAYMENT_METHODS,
                payload: response.data.data,
            });
        })
        .catch((response) => {
            dispatch(
                addToast({
                    text: response?.response?.data?.message,
                    type: toastType.ERROR,
                })
            );
        });
};

export const getUserSubscriptions =
    (filter = {}, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            let url = apiBaseURL.SUBSCRIPTIONS;
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
            apiConfig
                .get(url)
                .then((response) => {
                    dispatch({
                        type: plansActionType.FETCH_USER_SUBSCRIPTIONS,
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
                    if (isLoading) {
                        dispatch(setLoading(false));
                    }
                    dispatch(
                        addToast({
                            text: response?.data?.message,
                            type: toastType.ERROR,
                        })
                    );
                });
        };

export const comparePlans = (planId) => async (dispatch) => {
    dispatch(setLoading(true));
    apiConfig
        .get(`${apiBaseURL.COMPARE}/${planId}`)
        .then((response) => {
            dispatch({
                type: plansActionType.COMPARE_PLANS,
                payload: response.data.data,
            });
            dispatch(setLoading(false));
        })
        .catch((response) => {
            dispatch(setLoading(false));
            dispatch(
                addToast({
                    text: response?.response?.data?.message,
                    type: toastType.ERROR,
                })
            );
        });
};

export const createSubscription = (data, navigate) => async (dispatch) => {
    apiConfig
        .post(apiBaseURL.CREATE_SUBSCRIPTION, data)
        .then((response) => {
            dispatch(
                addToast({
                    text: response?.data?.message,
                })
            );
            navigate("/app/user/dashboard");
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

export const handleStripePayment = (data) => async (dispatch) => {
    apiConfig
        .post(apiBaseURL.STRIPE_PAYMENT, data)
        .then((response) => {
            window.location.href = response.data.data.url;
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

export const handlePaypalPayment = (data) => async (dispatch) => {
    apiConfig
        .post(apiBaseURL.PAYPAL_PAYMENT, data)
        .then((response) => {
            window.location.href = response.data.data.url;
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

export const handleRazorPayPayment = (data, Razorpay) => async (dispatch) => {
    apiConfig
        .post(apiBaseURL.RAZORPAY_PAYMENT, data)
        .then((response) => {
            displayRazorpay(response.data.data, Razorpay, dispatch);
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

async function displayRazorpay(sessionData, Razorpay, dispatch) {
    const { razorpayOrder, amount, name, email, contact, plan_id } =
        sessionData;

    const options = {
        key: process.env.MIX_RAZOR_KEY,
        amount: amount,
        currency: "INR",
        name: name,
        description: `Plan Purchase: ${plan_id}`,
        order_id: razorpayOrder,
        prefill: {
            name: name,
            email: email,
            contact: contact,
        },
        notes: {
            address: "Plan Purchase",
        },
        theme: {
            color: "#3399cc",
        },
        callback_url: "/razorpay/success",

        modal: {
            ondismiss: function () {
                dispatch(
                    addToast({
                        text: "Payment not completed.",
                        type: toastType.ERROR,
                    })
                );
                window.location.href = "/razorpay/failed"
            },
        },
    };

    const paymentObject = new Razorpay(options);
    paymentObject.open();
}

export const handlePayStackPayment = (data) => async (dispatch) => {
    apiConfig
        .post(apiBaseURL.PAYSTACK_PAYMENT, data)
        .then((response) => {
            window.location.href = response.data.data.url;
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