import { twoFactorAuthActions } from "../../constants";

export default (state = { type: null, message: "", recovery_codes: [], download_url: "" }, action) => {
    switch (action.type) {
        case twoFactorAuthActions.GET_TWO_AUTH_QR:
            return action.payload;
        case twoFactorAuthActions.SET_RECOVERY_CODES:
            return {
                ...state,
                recovery_codes: action.payload.recovery_codes,
                download_url: action.payload.download_url,
            };
        default:
            return state;
    }
};
