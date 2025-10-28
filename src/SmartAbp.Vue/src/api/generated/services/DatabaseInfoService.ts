/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto } from '../models/SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DatabaseInfoService {
    /**
     * @returns SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto OK
     * @throws ApiError
     */
    public static getApiDatabaseInfoCurrent(): CancelablePromise<SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/database-info/current',
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
     * @returns SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto OK
     * @throws ApiError
     */
    public static getApiDatabaseInfo({
        databaseType,
    }: {
        databaseType: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/database-info/{databaseType}',
            path: {
                'databaseType': databaseType,
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
     * @returns SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto OK
     * @throws ApiError
     */
    public static postApiDatabaseInfoTestConnection({
        requestBody,
    }: {
        requestBody?: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_DatabaseInfo_DatabaseInfoDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/database-info/test-connection',
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
     * @returns string OK
     * @throws ApiError
     */
    public static getApiDatabaseInfoFieldType({
        csharpType,
        maxLength,
    }: {
        csharpType: string,
        maxLength?: number,
    }): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/database-info/field-type/{csharpType}',
            path: {
                'csharpType': csharpType,
            },
            query: {
                'maxLength': maxLength,
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
