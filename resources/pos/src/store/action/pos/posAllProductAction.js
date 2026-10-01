import {
    posProductActionType,
    productActionType,
    toastType,
} from "../../../constants";
import apiConfig from "../../../config/apiConfig";
import { addToast } from "../toastAction";
import { setLoading } from "../loadingAction";
import { setTotalProductRecord, setTotalRecord } from "../totalRecordAction";

export const posAllProductAction = () => async (dispatch) => {
    apiConfig
        .get(`products?page[size]=0`)
        .then((response) => {
            dispatch({
                type: posProductActionType.POS_ALL_PRODUCT,
                payload: response.data.data,
            });
        })
        .catch(({ response }) => {
            dispatch(
                addToast({ text: response?.data?.message, type: toastType.ERROR })
            );
        });
};

export const posAllProduct =
    (warehouse, isLoading = true) =>
        async (dispatch) => {
            if (isLoading) {
                dispatch(setLoading(true));
            }
            apiConfig
                .get(`products?page[size]=0&warehouse_id=${warehouse}`)
                .then((response) => {
                    dispatch({
                        type: posProductActionType.POS_ALL_PRODUCTS,
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

export const fetchBrandClickable =
    (brandId, categoryId, warehouse, pageNumber = 1, search = "", isProductSearch = false, isLoading = true) => async (dispatch) => {
        if (isLoading) {
            dispatch(setLoading(true));
        }
        let url = `products?filter[brand_id]=${brandId ? brandId : ""
            }&filter[product_category_id]=${categoryId ? categoryId : ""
            }&warehouse_id=${warehouse ? warehouse : ""}&filter[search]=${search}`;
        if (!isProductSearch && !brandId && !categoryId) {
            url += `&page[size]=30&page[number]=${pageNumber}`;
        }else{
            url += `&page[size]=0`;
        }
        if(!warehouse) return;
        await apiConfig
            .get(url)
            .then((response) => {
                dispatch({
                    type: productActionType.FETCH_BRAND_CLICKABLE,
                    payload: response.data.data,
                });
                if(!isProductSearch){
                    dispatch(
                        setTotalRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );
                    dispatch(
                        setTotalProductRecord(
                            response.data.meta.total !== undefined &&
                                response.data.meta.total >= 0
                                ? response.data.meta.total
                                : response.data.data.total
                        )
                    );
                }
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
