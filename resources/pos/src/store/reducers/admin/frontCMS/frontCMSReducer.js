import { adminActionType } from "../../../../constants";

export default (state = {}, action) => {
    switch (action.type) {
        case adminActionType.FETCH_HERO_SECTION:
            return action.payload;
        case adminActionType.FETCH_SERVICES_SECTION:
            return action.payload;
        case adminActionType.FETCH_PARTNERS:
            return action.payload;
        case adminActionType.FETCH_FEATURES:
            return action.payload;
        case adminActionType.FETCH_TESTIMONIALS:
            return action.payload;
        case adminActionType.FETCH_WHY_CHOOSE_US:
            return action.payload;
        case adminActionType.FETCH_FAQS:
            return action.payload;
        case adminActionType.FETCH_PAGES:
            return { ...state, pages: action.payload };
        case adminActionType.FETCH_STEPS:
            return action.payload;
        default:
            return state;
    }
};
