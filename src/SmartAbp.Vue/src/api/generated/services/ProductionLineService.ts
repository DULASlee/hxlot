/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_ProductionLine_CreateProductionLineDto } from '../models/SmartAbp_Application_Contracts_ProductionLine_CreateProductionLineDto';
import type { SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto } from '../models/SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto';
import type { SmartAbp_Application_Contracts_ProductionLine_UpdateProductionLineDto } from '../models/SmartAbp_Application_Contracts_ProductionLine_UpdateProductionLineDto';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProductionLineService {
    /**
     * @throws ApiError
     */
    public static getApiAppProductionLine({
        filter,
        status,
        type,
        isEnabled,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        filter?: string,
        status?: string,
        type?: string,
        isEnabled?: boolean,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/production-line',
            query: {
                'Filter': filter,
                'Status': status,
                'Type': type,
                'IsEnabled': isEnabled,
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
     * @returns SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto OK
     * @throws ApiError
     */
    public static postApiAppProductionLine({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_ProductionLine_CreateProductionLineDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/app/production-line',
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
     * @returns SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto OK
     * @throws ApiError
     */
    public static getApiAppProductionLine1({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/production-line/{id}',
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
     * @returns SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto OK
     * @throws ApiError
     */
    public static putApiAppProductionLine({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: SmartAbp_Application_Contracts_ProductionLine_UpdateProductionLineDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_ProductionLine_ProductionLineDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/app/production-line/{id}',
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
    public static deleteApiAppProductionLine({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/app/production-line/{id}',
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
