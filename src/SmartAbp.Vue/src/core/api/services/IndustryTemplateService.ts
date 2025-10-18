/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateConfigDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateConfigDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateGenerationResultDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateGenerationResultDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class IndustryTemplateService {
    /**
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateGenerationResultDto OK
     * @throws ApiError
     */
    public static postApiLowcodeIndustryTemplatesGenerate(
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateConfigDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_IndustryTemplateGenerationResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/industry-templates/generate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
