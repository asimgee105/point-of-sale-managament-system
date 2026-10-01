import apiConfig from "../../../config/apiConfig";
import {
    adminActionType,
    adminApiBaseURL
} from "../../../constants";
import requestParam from "../../../shared/requestParam";
import { setLoading } from "../loadingAction";
import { setTotalRecord } from "../totalRecordAction";

export const fetchTransaction =
    (filter = {}, isLoading = true) =>
    async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = adminApiBaseURL.TRANSACTIONS;
        if (
            !_.isEmpty(filter) &&
            (filter.page || filter.pageSize || filter.search)
        ) {
            url += requestParam(filter, null, null, null, url, false);
        }
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: adminActionType.FETCH_TRANSACTION,
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
    };
