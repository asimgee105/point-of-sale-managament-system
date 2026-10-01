import { adminActionType } from "../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_ADMIN_USERS:
            return action.payload;
        case adminActionType.FETCH_USER:
            return [action.payload];
        case adminActionType.DELETE_USER:
            return state.filter((item) => item.id !== action.payload);
        default:
            return state;
    }
};
