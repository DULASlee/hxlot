/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DynamicClaimsService {
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAccountDynamicClaimsRefresh(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/account/dynamic-claims/refresh',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
}
