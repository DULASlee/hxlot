/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Volo_Abp_Application_Dtos_ListResultDto_1 } from '../models/Volo_Abp_Application_Dtos_ListResultDto_1';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { Volo_Abp_Identity_IdentityRoleDto } from '../models/Volo_Abp_Identity_IdentityRoleDto';
import type { Volo_Abp_Identity_IdentityUserCreateDto } from '../models/Volo_Abp_Identity_IdentityUserCreateDto';
import type { Volo_Abp_Identity_IdentityUserDto } from '../models/Volo_Abp_Identity_IdentityUserDto';
import type { Volo_Abp_Identity_IdentityUserUpdateDto } from '../models/Volo_Abp_Identity_IdentityUserUpdateDto';
import type { Volo_Abp_Identity_IdentityUserUpdateRolesDto } from '../models/Volo_Abp_Identity_IdentityUserUpdateRolesDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * @param id
     * @returns Volo_Abp_Identity_IdentityUserDto OK
     * @throws ApiError
     */
    public static getApiIdentityUsers(
        id: string,
    ): CancelablePromise<Volo_Abp_Identity_IdentityUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/{id}',
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
     * @param id
     * @param requestBody
     * @returns Volo_Abp_Identity_IdentityUserDto OK
     * @throws ApiError
     */
    public static putApiIdentityUsers(
        id: string,
        requestBody?: Volo_Abp_Identity_IdentityUserUpdateDto,
    ): CancelablePromise<Volo_Abp_Identity_IdentityUserDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/identity/users/{id}',
            path: {
                'id': id,
            },
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
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiIdentityUsers(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/identity/users/{id}',
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
     * @param filter
     * @param sorting
     * @param skipCount
     * @param maxResultCount
     * @param extraProperties
     * @returns Volo_Abp_Application_Dtos_PagedResultDto_1<Volo_Abp_Identity_IdentityUserDto_Volo_Abp_Identity_Application_Contracts_Version_9_1_1_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiIdentityUsers1(
        filter?: string,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
        extraProperties?: Record<string, any>,
    ): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users',
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
     * @param requestBody
     * @returns Volo_Abp_Identity_IdentityUserDto OK
     * @throws ApiError
     */
    public static postApiIdentityUsers(
        requestBody?: Volo_Abp_Identity_IdentityUserCreateDto,
    ): CancelablePromise<Volo_Abp_Identity_IdentityUserDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/identity/users',
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
     * @param id
     * @returns Volo_Abp_Application_Dtos_ListResultDto_1<Volo_Abp_Identity_IdentityRoleDto_Volo_Abp_Identity_Application_Contracts_Version_9_1_1_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiIdentityUsersRoles(
        id: string,
    ): CancelablePromise<Volo_Abp_Application_Dtos_ListResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/{id}/roles',
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
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiIdentityUsersRoles(
        id: string,
        requestBody?: Volo_Abp_Identity_IdentityUserUpdateRolesDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/identity/users/{id}/roles',
            path: {
                'id': id,
            },
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
     * @returns Volo_Abp_Application_Dtos_ListResultDto_1<Volo_Abp_Identity_IdentityRoleDto_Volo_Abp_Identity_Application_Contracts_Version_9_1_1_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiIdentityUsersAssignableRoles(): CancelablePromise<Volo_Abp_Application_Dtos_ListResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/assignable-roles',
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
     * @returns Volo_Abp_Identity_IdentityUserDto OK
     * @throws ApiError
     */
    public static getApiIdentityUsersByUsername(
        userName: string,
    ): CancelablePromise<Volo_Abp_Identity_IdentityUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/by-username/{userName}',
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
     * @param email
     * @returns Volo_Abp_Identity_IdentityUserDto OK
     * @throws ApiError
     */
    public static getApiIdentityUsersByEmail(
        email: string,
    ): CancelablePromise<Volo_Abp_Identity_IdentityUserDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/identity/users/by-email/{email}',
            path: {
                'email': email,
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
