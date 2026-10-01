import { adminActionType } from "../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_SUBSCRIPTIONS:
            return action.payload;
        default:
            return state;
    }
};
