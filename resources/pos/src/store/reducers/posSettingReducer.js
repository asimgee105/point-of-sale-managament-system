import { posSettingActionType } from "../../constants";

export default (state = [], action) => {
    switch (action.type) {
        case posSettingActionType.FETCH_POS_SETTING:
            return action.payload;
        default:
            return state;
    }
};