/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_LowCode_PermissionSystemGenerationResult } from '../models/SmartAbp_Application_LowCode_PermissionSystemGenerationResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PermissionSystemGeneratorService {
    /**
     * @returns SmartAbp_Application_LowCode_PermissionSystemGenerationResult OK
     * @throws ApiError
     */
    public static postApiPermissionSystemGeneratorGenerate(): CancelablePromise<SmartAbp_Application_LowCode_PermissionSystemGenerationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/permission-system-generator/generate',
        });
    }
    /**
     * @returns SmartAbp_Application_LowCode_PermissionSystemGenerationResult OK
     * @throws ApiError
     */
    public static postApiPermissionSystemGeneratorGenerateFromFile({
        configPath,
    }: {
        configPath?: string,
    }): CancelablePromise<SmartAbp_Application_LowCode_PermissionSystemGenerationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/permission-system-generator/generate-from-file',
            query: {
                'configPath': configPath,
            },
        });
    }
}
