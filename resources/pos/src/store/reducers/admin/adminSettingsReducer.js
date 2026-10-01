import { adminActionType } from "../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_PAYMENT_SETTINGS:
            return action.payload;
        case adminActionType.SETTINGS:
            return action.payload;
        default:
            return state;
    }
};
