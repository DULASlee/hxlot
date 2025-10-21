/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto } from '../models/SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MetadataService {
    /**
     * @returns SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto OK
     * @throws ApiError
     */
    public static postApiMetadataRegisterModule({
        requestBody,
    }: {
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    }): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/metadata/register-module',
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
     * @returns SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto OK
     * @throws ApiError
     */
    public static postApiMetadata({
        requestBody,
    }: {
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    }): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/metadata',
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
     * @returns SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto OK
     * @throws ApiError
     */
    public static putApiMetadata({
        requestBody,
    }: {
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    }): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/metadata',
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
     * @returns SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto OK
     * @throws ApiError
     */
    public static getApiMetadata({
        moduleName,
    }: {
        moduleName: string,
    }): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/metadata/{moduleName}',
            path: {
                'moduleName': moduleName,
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
