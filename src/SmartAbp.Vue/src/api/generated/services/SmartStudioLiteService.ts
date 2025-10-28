/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationResultDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationResultDto';
import type { SmartAbp_Application_Contracts_LowCode_ValidationResultDto } from '../models/SmartAbp_Application_Contracts_LowCode_ValidationResultDto';
import type { Volo_Abp_Application_Dtos_ListResultDto_1 } from '../models/Volo_Abp_Application_Dtos_ListResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SmartStudioLiteService {
    /**
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationResultDto OK
     * @throws ApiError
     */
    public static postApiLowcodeSmartStudioLiteCreateModule({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/smart-studio-lite/create-module',
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
     * @throws ApiError
     */
    public static postApiLowcodeSmartStudioLitePreviewFiles({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto,
    }): CancelablePromise<Volo_Abp_Application_Dtos_ListResultDto_1> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/smart-studio-lite/preview-files',
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
     * @returns SmartAbp_Application_Contracts_LowCode_ValidationResultDto OK
     * @throws ApiError
     */
    public static postApiLowcodeSmartStudioLiteValidate({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_SimplifiedModuleCreationDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_LowCode_ValidationResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/smart-studio-lite/validate',
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
