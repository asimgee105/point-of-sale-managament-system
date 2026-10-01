import {Tokens, errorMessage} from '../constants';
import {environment} from './environment'
import Cookies from 'js-cookie';

export default {
    setupInterceptors: (axios, isToken = false, isFormData = false) => {
        axios.interceptors.request.use((config) => {
                const isPublicEndpoint = ['login', 'register', 'languages', 'front-cms', 'forgot-password', 'reset-password', 'two-factor-auth/verify'].includes((config.url || '').replace(/^\//, ''));
                const isToken = isPublicEndpoint ? null : Cookies.get('authToken');
                if (isToken) {
                    config.headers['Authorization'] = `Bearer ${isToken}`;
                }
                if (!isToken && !isPublicEndpoint) {
                    if (!window.location.href.includes('login') && !window.location.href.includes('reset-password') && !window.location.href.includes('verify-otp') && !window.location.href.includes('forgot-password') && !window.location.href.includes('register')) {
                        window.location.href = environment.URL + '/app/login';
                    }
                }
                if (isFormData) {
                    config.headers['Content-Type'] = 'multipart/form-data';
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        axios.interceptors.response.use(
            response => successHandler(response),
            error => errorHandler(error)
        );
        const errorHandler = (error) => {
            const status = error?.response?.status;
            const message = error?.response?.data?.message;
            if (status === 401 || [errorMessage.TOKEN_NOT_PROVIDED,
                errorMessage.TOKEN_INVALID, errorMessage.TOKEN_INVALID_SIGNATURE,
                errorMessage.TOKEN_EXPIRED].filter(Boolean).includes(message)) {
                Cookies.remove('authToken');
                [Tokens.ADMIN, Tokens.USER, Tokens.GET_PERMISSIONS, 'loginUserArray',
                    'user_time', 'persist:root'].forEach(key => localStorage.removeItem(key));
                if (!window.location.pathname.startsWith('/app/login')) {
                    window.location.assign(environment.URL + '/app/login');
                }
            }
            // Keep validation, permission and network errors available to the caller.
            return Promise.reject(error);
        };
        const successHandler = (response) => {
            return response;
        };
    }
};
