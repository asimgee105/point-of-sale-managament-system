import { adminActionType } from "../../../constants";


export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_ADMIN_DASHBOARD:
            return action.payload;
        default:
            return state;
    }
};