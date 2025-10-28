/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_Equipment_CreateEquipmentDto } from '../models/SmartAbp_Application_Contracts_Equipment_CreateEquipmentDto';
import type { SmartAbp_Application_Contracts_Equipment_EquipmentDto } from '../models/SmartAbp_Application_Contracts_Equipment_EquipmentDto';
import type { SmartAbp_Application_Contracts_Equipment_UpdateEquipmentDto } from '../models/SmartAbp_Application_Contracts_Equipment_UpdateEquipmentDto';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EquipmentService {
    /**
     * @throws ApiError
     */
    public static getApiAppEquipment({
        filter,
        status,
        type,
        productionLineId,
        isEnabled,
        isOnline,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        filter?: string,
        status?: string,
        type?: string,
        productionLineId?: string,
        isEnabled?: boolean,
        isOnline?: boolean,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/equipment',
            query: {
                'Filter': filter,
                'Status': status,
                'Type': type,
                'ProductionLineId': productionLineId,
                'IsEnabled': isEnabled,
                'IsOnline': isOnline,
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
     * @returns SmartAbp_Application_Contracts_Equipment_EquipmentDto OK
     * @throws ApiError
     */
    public static postApiAppEquipment({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_Equipment_CreateEquipmentDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_Equipment_EquipmentDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/app/equipment',
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
     * @returns SmartAbp_Application_Contracts_Equipment_EquipmentDto OK
     * @throws ApiError
     */
    public static getApiAppEquipment1({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_Equipment_EquipmentDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/equipment/{id}',
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
     * @returns SmartAbp_Application_Contracts_Equipment_EquipmentDto OK
     * @throws ApiError
     */
    public static putApiAppEquipment({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: SmartAbp_Application_Contracts_Equipment_UpdateEquipmentDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_Equipment_EquipmentDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/app/equipment/{id}',
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
    public static deleteApiAppEquipment({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/app/equipment/{id}',
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
}
