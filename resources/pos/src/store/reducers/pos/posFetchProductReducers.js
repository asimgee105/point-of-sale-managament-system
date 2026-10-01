import {posProductActionType} from '../../../constants'

export default (state = [], action) => {
    switch (action.type) {
        case posProductActionType.FETCH_PRODUCT:
            return [...state, action.payload];
        default:
            return state;
    }
};
