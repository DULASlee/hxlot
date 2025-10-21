/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateModuleDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateModuleDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_ } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ModuleService {
    /**
     * @returns Volo_Abp_Application_Dtos_PagedResultDto_1<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiLowcodeModules({
        filter,
        status,
        isActive,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        filter?: string,
        status?: string,
        isActive?: boolean,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/modules',
            query: {
                'Filter': filter,
                'Status': status,
                'IsActive': isActive,
                'Sorting': sorting,
                'SkipCount': skipCount,
                'MaxResultCount': maxResultCount,
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto OK
     * @throws ApiError
     */
    public static postApiLowcodeModules({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateModuleDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/modules',
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto OK
     * @throws ApiError
     */
    public static getApiLowcodeModules1({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/modules/{id}',
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto OK
     * @throws ApiError
     */
    public static putApiLowcodeModules({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateModuleDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/lowcode/modules/{id}',
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
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiLowcodeModules({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/lowcode/modules/{id}',
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto OK
     * @throws ApiError
     */
    public static getApiLowcodeModulesBySystemName({
        systemName,
    }: {
        systemName: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_ModuleDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/modules/by-system-name/{systemName}',
            path: {
                'systemName': systemName,
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
