import apiConfig from "../../../config/apiConfig";
import { adminActionType, adminApiBaseURL, toastType } from "../../../constants";
import { setLoading } from "../loadingAction";
import { addToast } from "../toastAction";


export const fetchAdminDashboardData =
    (isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        await apiConfig
            .get(`${adminApiBaseURL.DASHBOARD}`)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_ADMIN_DASHBOARD,
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