import { adminActionType } from "../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_INQUIRIES:
            return action.payload;
        default:
            return state;
    }
};