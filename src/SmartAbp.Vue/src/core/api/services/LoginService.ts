/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult } from '../models/Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult';
import type { Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo } from '../models/Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LoginService {
    /**
     * @param requestBody
     * @returns Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult OK
     * @throws ApiError
     */
    public static postApiAccountLogin(
        requestBody?: Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo,
    ): CancelablePromise<Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/account/login',
            body: requestBody,
            mediaType: 'application/json',
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
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static getApiAccountLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/account/logout',
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
    /**
     * @param requestBody
     * @returns Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult OK
     * @throws ApiError
     */
    public static postApiAccountCheckPassword(
        requestBody?: Volo_Abp_Account_Web_Areas_Account_Controllers_Models_UserLoginInfo,
    ): CancelablePromise<Volo_Abp_Account_Web_Areas_Account_Controllers_Models_AbpLoginResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/account/check-password',
            body: requestBody,
            mediaType: 'application/json',
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
