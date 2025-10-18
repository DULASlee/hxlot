/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { SmartAbp_Application_BusinessRules_Services_ScriptValidationResult } from '../models/SmartAbp_Application_BusinessRules_Services_ScriptValidationResult';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto';
import type { SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_ } from '../models/SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_';
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
     * @param searchKeyword
     * @param entityName
     * @param type
     * @param isActive
     * @param hasError
     * @param sorting
     * @param skipCount
     * @param maxResultCount
     * @returns Volo_Abp_Application_Dtos_PagedResultDto_1<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto_SmartAbp_Application_Contracts_Version_1_0_0_0_Culture_neutral_PublicKeyToken_null_> OK
     * @throws ApiError
     */
    public static getApiBusinessRules(
        searchKeyword?: string,
        entityName?: string,
        type?: string,
        isActive?: boolean,
        hasError?: boolean,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    ): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
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
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static postApiBusinessRules(
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_CreateBusinessRuleDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static getApiBusinessRules1(
        id: string,
    ): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static putApiBusinessRules(
        id: string,
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_UpdateBusinessRuleDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
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
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiBusinessRules(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business-rules/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesExecute(
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_ExecuteBusinessRuleDto,
    ): CancelablePromise<Array<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleExecutionResultDto>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/execute',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesValidate(
        id: string,
    ): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleValidationResultDto> {
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
     * @param entityName
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto OK
     * @throws ApiError
     */
    public static getApiBusinessRulesEntitiesFields(
        entityName: string,
    ): CancelablePromise<Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business-rules/entities/{entityName}/fields',
            path: {
                'entityName': entityName,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putApiBusinessRulesBatchStatus(
        requestBody?: SmartAbp_HttpApi_Controllers_BatchUpdateStatusInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business-rules/batch-status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesDuplicate(
        id: string,
    ): CancelablePromise<SmartAbp_Application_Contracts_BusinessRules_Dtos_BusinessRuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/{id}/duplicate',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns SmartAbp_Application_BusinessRules_Services_ScriptValidationResult OK
     * @throws ApiError
     */
    public static postApiBusinessRulesValidateScript(
        requestBody?: SmartAbp_Application_Contracts_BusinessRules_Dtos_ValidateScriptInput,
    ): CancelablePromise<SmartAbp_Application_BusinessRules_Services_ScriptValidationResult> {
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
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiBusinessRulesBatch(
        requestBody?: SmartAbp_HttpApi_Controllers_BatchDeleteInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business-rules/batch',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiBusinessRulesExport(
        requestBody?: Array<string>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/export',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns SmartAbp_HttpApi_Controllers_ImportRulesResultDto OK
     * @throws ApiError
     */
    public static postApiBusinessRulesImport(
        requestBody?: SmartAbp_HttpApi_Controllers_ImportRulesInput,
    ): CancelablePromise<SmartAbp_HttpApi_Controllers_ImportRulesResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business-rules/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
