/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Dtos_CreateGenerationHistoryDto } from '../models/SmartAbp_CodeGenerator_Dtos_CreateGenerationHistoryDto';
import type { SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto } from '../models/SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class GenerationHistoryService {
    /**
     * @param limit
     * @returns SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto OK
     * @throws ApiError
     */
    public static getApiCodeGenGenerationHistoryRecent(
        limit: number = 5,
    ): CancelablePromise<Array<SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-gen/generation-history/recent',
            query: {
                'limit': limit,
            },
        });
    }
    /**
     * @param skipCount
     * @param maxResultCount
     * @returns SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto OK
     * @throws ApiError
     */
    public static getApiCodeGenGenerationHistoryAll(
        skipCount?: number,
        maxResultCount: number = 20,
    ): CancelablePromise<Array<SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-gen/generation-history/all',
            query: {
                'skipCount': skipCount,
                'maxResultCount': maxResultCount,
            },
        });
    }
    /**
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto OK
     * @throws ApiError
     */
    public static postApiCodeGenGenerationHistory(
        requestBody?: SmartAbp_CodeGenerator_Dtos_CreateGenerationHistoryDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Dtos_GenerationHistoryDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-gen/generation-history',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiCodeGenGenerationHistory(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/code-gen/generation-history/{id}',
            path: {
                'id': id,
            },
        });
    }
}
