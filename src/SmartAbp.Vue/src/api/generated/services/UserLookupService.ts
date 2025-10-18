/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Volo_Abp_Application_Dtos_ListResultDto_1 } from '../models/Volo_Abp_Application_Dtos_ListResultDto_1';
import type { Volo_Abp_Users_UserData } from '../models/Volo_Abp_Users_UserData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserLookupService {
    /**
     * @param id
     * @returns Volo_Abp_Users_UserData OK
     * @throws ApiError
     */
    public static getApiIdentityUsersLookup(
        id: string,
    ): CancelablePromise<Volo_Abp_Users_UserData> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/lookup/{id}',
            path: {
                'id': id,
            },
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
     * @param userName
     * @returns Volo_Abp_Users_UserData OK
     * @throws ApiError
     */
    public static getApiIdentityUsersLookupByUsername(
        userName: string,
    ): CancelablePromise<Volo_Abp_Users_UserData> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/lookup/by-username/{userName}',
            path: {
                'userName': userName,
            },
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
     * @param filter
     * @param sorting
     * @param skipCount
     * @param maxResultCount
     * @param extraProperties
     * @returns Volo_Abp_Application_Dtos_ListResultDto_1<Volo_Abp_Users_UserData_Volo_Abp_Users_Abstractions_Version_9_1_1_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiIdentityUsersLookupSearch(
        filter?: string,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
        extraProperties?: Record<string, any>,
    ): CancelablePromise<Volo_Abp_Application_Dtos_ListResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/lookup/search',
            query: {
                'Filter': filter,
                'Sorting': sorting,
                'SkipCount': skipCount,
                'MaxResultCount': maxResultCount,
                'ExtraProperties': extraProperties,
            },
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
     * @param filter
     * @returns number OK
     * @throws ApiError
     */
    public static getApiIdentityUsersLookupCount(
        filter?: string,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/lookup/count',
            query: {
                'Filter': filter,
            },
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
