import { adminActionType } from "../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_PLANS:
            return action.payload;
        case adminActionType.FETCH_PLAN:
            return [action.payload];
        case adminActionType.DELETE_PLAN:
            return state.filter((item) => item.id !== action.payload);
        default:
            return state;
    }
};
