import { AxiosInstance } from 'axios';

declare global {
    interface Window {
        axios: AxiosInstance;
    }

    /* eslint-disable no-var */
    var route: (name?: string, params?: any, absolute?: boolean, config?: any) => string;
}
