import {holdListActionType} from '../../../constants';

export default (state = {}, action) => {
    switch (action.type) {
        case holdListActionType.FETCH_HOLD:
            return action.payload;

        default:
            return state;
    }
};
