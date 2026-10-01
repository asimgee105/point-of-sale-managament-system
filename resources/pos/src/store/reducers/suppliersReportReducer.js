import {supplierActionType} from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case supplierActionType.FETCH_SUPPLIERS_REPORT:
            return action.payload;
        default:
            return state;
    }
};
