import { plansActionType } from "../../constants";

const initialState = {
    plans: [],
    currentPlan: null,
    paymentMethods: [],
    subscriptions: [],
    comparePlans: [],
};

export default (state = initialState, action) => {
    switch (action.type) {
        case plansActionType.FETCH_PLANS:
            return { ...state, plans: action.payload };
        case plansActionType.FETCH_USER_CURRENT_PLAN:
            return { ...state, currentPlan: action.payload };
        case plansActionType.FETCH_PAYMENT_METHODS:
            return { ...state, paymentMethods: action.payload };
        case plansActionType.FETCH_USER_SUBSCRIPTIONS:
            return { ...state, subscriptions: action.payload };
        case plansActionType.COMPARE_PLANS:
            return { ...state, comparePlans: action.payload };
        default:
            return state;
    }
};
