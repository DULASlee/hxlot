/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TenantManagement_SmartTenant_Dtos_CreateSmartTenantDto } from '../models/TenantManagement_SmartTenant_Dtos_CreateSmartTenantDto';
import type { TenantManagement_SmartTenant_Dtos_SmartTenantDto } from '../models/TenantManagement_SmartTenant_Dtos_SmartTenantDto';
import type { TenantManagement_SmartTenant_Dtos_UpdateSmartTenantDto } from '../models/TenantManagement_SmartTenant_Dtos_UpdateSmartTenantDto';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SmartTenantService {
    /**
     * @throws ApiError
     */
    public static getApiSmartTenant({
        keyword,
        code,
        isActive,
        startTimeStart,
        startTimeEnd,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        keyword?: string,
        code?: string,
        isActive?: boolean,
        startTimeStart?: string,
        startTimeEnd?: string,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/SmartTenant',
            query: {
                'Keyword': keyword,
                'Code': code,
                'IsActive': isActive,
                'StartTimeStart': startTimeStart,
                'StartTimeEnd': startTimeEnd,
                'Sorting': sorting,
                'SkipCount': skipCount,
                'MaxResultCount': maxResultCount,
            },
        });
    }
    /**
     * @returns TenantManagement_SmartTenant_Dtos_SmartTenantDto OK
     * @throws ApiError
     */
    public static postApiSmartTenant({
        requestBody,
    }: {
        requestBody?: TenantManagement_SmartTenant_Dtos_CreateSmartTenantDto,
    }): CancelablePromise<TenantManagement_SmartTenant_Dtos_SmartTenantDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/SmartTenant',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns TenantManagement_SmartTenant_Dtos_SmartTenantDto OK
     * @throws ApiError
     */
    public static getApiSmartTenant1({
        id,
    }: {
        id: string,
    }): CancelablePromise<TenantManagement_SmartTenant_Dtos_SmartTenantDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/SmartTenant/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns TenantManagement_SmartTenant_Dtos_SmartTenantDto OK
     * @throws ApiError
     */
    public static putApiSmartTenant({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: TenantManagement_SmartTenant_Dtos_UpdateSmartTenantDto,
    }): CancelablePromise<TenantManagement_SmartTenant_Dtos_SmartTenantDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/SmartTenant/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiSmartTenant({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/SmartTenant/{id}',
            path: {
                'id': id,
            },
        });
    }
}
