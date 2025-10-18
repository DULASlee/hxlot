/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Volo_Abp_Account_ChangePasswordInput } from '../models/Volo_Abp_Account_ChangePasswordInput';
import type { Volo_Abp_Account_ProfileDto } from '../models/Volo_Abp_Account_ProfileDto';
import type { Volo_Abp_Account_UpdateProfileDto } from '../models/Volo_Abp_Account_UpdateProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProfileService {
    /**
     * @returns Volo_Abp_Account_ProfileDto OK
     * @throws ApiError
     */
    public static getApiAccountMyProfile(): CancelablePromise<Volo_Abp_Account_ProfileDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/account/my-profile',
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
     * @returns Volo_Abp_Account_ProfileDto OK
     * @throws ApiError
     */
    public static putApiAccountMyProfile(
        requestBody?: Volo_Abp_Account_UpdateProfileDto,
    ): CancelablePromise<Volo_Abp_Account_ProfileDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/account/my-profile',
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
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiAccountMyProfileChangePassword(
        requestBody?: Volo_Abp_Account_ChangePasswordInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/account/my-profile/change-password',
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
