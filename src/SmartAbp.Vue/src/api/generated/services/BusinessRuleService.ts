/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_BusinessRules_Services_ScriptValidationResult } from '../models/SmartAbp_Application_BusinessRules_Services_ScriptValidationResult';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleStatsDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleStatsDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_CreateBusinessRuleDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_CreateBusinessRuleDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_ExecuteBusinessRuleDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_ExecuteBusinessRuleDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_UpdateBusinessRuleDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_UpdateBusinessRuleDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_ValidateScriptInput } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_ValidateScriptInput';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto';
import type { SmartAbp_HttpApi_Controllers_BatchDeleteInput } from '../models/SmartAbp_HttpApi_Controllers_BatchDeleteInput';
import type { SmartAbp_HttpApi_Controllers_BatchUpdateStatusInput } from '../models/SmartAbp_HttpApi_Controllers_BatchUpdateStatusInput';
import type { SmartAbp_HttpApi_Controllers_ImportRulesInput } from '../models/SmartAbp_HttpApi_Controllers_ImportRulesInput';
import type { SmartAbp_HttpApi_Controllers_ImportRulesResultDto } from '../models/SmartAbp_HttpApi_Controllers_ImportRulesResultDto';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BusinessRuleService {
    /**
     * @throws ApiError
     */
    public static getApiBusinessRules({
        searchKeyword,
        entityName,
        type,
        isActive,
        hasError,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        searchKeyword?: string,
        entityName?: string,
        type?: string,
        isActive?: boolean,
        hasError?: boolean,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules',
            query: {
                'SearchKeyword': searchKeyword,
                'EntityName': entityName,
                'Type': type,
                'IsActive': isActive,
                'HasError': hasError,
                'Sorting': sorting,
                'SkipCount': skipCount,
                'MaxResultCount': maxResultCount,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static postApiBusinessRules({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_CreateBusinessRuleDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static getApiBusinessRules1({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static putApiBusinessRules({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_UpdateBusinessRuleDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business-rules/{id}',
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
    public static deleteApiBusinessRules({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business-rules/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesExecute({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_ExecuteBusinessRuleDto,
    }): CancelablePromise<Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/execute',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesValidate({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/{id}/validate',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesValidateAll(): CancelablePromise<Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/validate-all',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleStatsDto OK
     * @throws ApiError
     */
    public static getApiBusinessRulesStats(): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleStatsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/stats',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static getApiBusinessRulesEntities(): CancelablePromise<Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/entities',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto OK
     * @throws ApiError
     */
    public static getApiBusinessRulesEntitiesFields({
        entityName,
    }: {
        entityName: string,
    }): CancelablePromise<Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/entities/{entityName}/fields',
            path: {
                'entityName': entityName,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static putApiBusinessRulesBatchStatus({
        requestBody,
    }: {
        requestBody?: SmartAbp_HttpApi_Controllers_BatchUpdateStatusInput,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business-rules/batch-status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesDuplicate({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/{id}/duplicate',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_BusinessRules_Services_ScriptValidationResult OK
     * @throws ApiError
     */
    public static postApiBusinessRulesValidateScript({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_ValidateScriptInput,
    }): CancelablePromise<SmartAbp_Application_BusinessRules_Services_ScriptValidationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/validate-script',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns string OK
     * @throws ApiError
     */
    public static getApiBusinessRulesScriptTypes(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/script-types',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiBusinessRulesBatch({
        requestBody,
    }: {
        requestBody?: SmartAbp_HttpApi_Controllers_BatchDeleteInput,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business-rules/batch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static postApiBusinessRulesExport({
        requestBody,
    }: {
        requestBody?: Array<string>,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/export',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SmartAbp_HttpApi_Controllers_ImportRulesResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesImport({
        requestBody,
    }: {
        requestBody?: SmartAbp_HttpApi_Controllers_ImportRulesInput,
    }): CancelablePromise<SmartAbp_HttpApi_Controllers_ImportRulesResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
