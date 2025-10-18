/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_CodeGenerator_Dtos_CodeGenStatsDto } from '../models/SmartAbp_CodeGenerator_Dtos_CodeGenStatsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CodeGenStatsService {
    /**
     * @returns SmartAbp_CodeGenerator_Dtos_CodeGenStatsDto OK
     * @throws ApiError
     */
    public static getApiCodeGenStatsMy(): CancelablePromise<SmartAbp_CodeGenerator_Dtos_CodeGenStatsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-gen/stats/my',
        });
    }
}
