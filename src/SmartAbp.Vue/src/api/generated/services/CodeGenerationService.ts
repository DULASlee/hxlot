/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_CodeGenerator_CqrsValidationResultDto } from '../models/SmartAbp_Application_Contracts_CodeGenerator_CqrsValidationResultDto';
import type { SmartAbp_CodeGenerator_Services_CqrsDefinitionDto } from '../models/SmartAbp_CodeGenerator_Services_CqrsDefinitionDto';
import type { SmartAbp_CodeGenerator_Services_GeneratedCqrsSolutionDto } from '../models/SmartAbp_CodeGenerator_Services_GeneratedCqrsSolutionDto';
import type { SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionRequestDto } from '../models/SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionRequestDto';
import type { SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionTestResultDto } from '../models/SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionTestResultDto';
import type { SmartAbp_CodeGenerator_Services_V9_DatabaseIntrospectionRequestDto } from '../models/SmartAbp_CodeGenerator_Services_V9_DatabaseIntrospectionRequestDto';
import type { SmartAbp_CodeGenerator_Services_V9_DatabaseSchemaDto } from '../models/SmartAbp_CodeGenerator_Services_V9_DatabaseSchemaDto';
import type { SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto } from '../models/SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto';
import type { SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto } from '../models/SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto';
import type { SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto } from '../models/SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto';
import type { SmartAbp_CodeGenerator_Services_V9_GenerationStatusDto } from '../models/SmartAbp_CodeGenerator_Services_V9_GenerationStatusDto';
import type { SmartAbp_CodeGenerator_Services_V9_MenuItemDto } from '../models/SmartAbp_CodeGenerator_Services_V9_MenuItemDto';
import type { SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto } from '../models/SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto';
import type { SmartAbp_CodeGenerator_Services_V9_SchemaVersionManifestDto } from '../models/SmartAbp_CodeGenerator_Services_V9_SchemaVersionManifestDto';
import type { SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto } from '../models/SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto';
import type { SmartAbp_CodeGenerator_Services_V9_ValidationReportDto } from '../models/SmartAbp_CodeGenerator_Services_V9_ValidationReportDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CodeGenerationService {
    /**
     * @returns string OK
     * @throws ApiError
     */
    public static getApiCodeGeneratorConnectionStrings(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/connection-strings',
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
     * @returns SmartAbp_CodeGenerator_Services_V9_MenuItemDto OK
     * @throws ApiError
     */
    public static getApiCodeGeneratorMenus(): CancelablePromise<Array<SmartAbp_CodeGenerator_Services_V9_MenuItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/menus',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorGenerateModule(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/generate-module',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorUnifiedGenerateModule(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_GeneratedModuleDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/unified/generate-module',
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
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_CodeGenerator_CqrsValidationResultDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorValidateCqrsDefinition(
        requestBody?: SmartAbp_CodeGenerator_Services_CqrsDefinitionDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_CodeGenerator_CqrsValidationResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/validate-cqrs-definition',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_ValidationReportDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorValidate(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ValidationReportDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/validate',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorDryRun(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_ModuleMetadataDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/dry-run',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_ValidationReportDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorUnifiedValidate(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_ValidationReportDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/unified/validate',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorUnifiedDryRun(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_UnifiedModuleSchemaDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_GenerationDryRunResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/unified/dry-run',
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
     * @returns SmartAbp_CodeGenerator_Services_V9_SchemaVersionManifestDto OK
     * @throws ApiError
     */
    public static getApiCodeGeneratorSchemaVersionManifest(): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_SchemaVersionManifestDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/schema-version-manifest',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionTestResultDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorTestConnection(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionRequestDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_DatabaseConnectionTestResultDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/test-connection',
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_V9_DatabaseSchemaDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorIntrospectDb(
        requestBody?: SmartAbp_CodeGenerator_Services_V9_DatabaseIntrospectionRequestDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_DatabaseSchemaDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/introspect-db',
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
     * @param module
     * @param entity
     * @returns SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto OK
     * @throws ApiError
     */
    public static getApiCodeGeneratorUiConfig(
        module?: string,
        entity?: string,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/ui-config',
            query: {
                'module': module,
                'entity': entity,
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
     * @param module
     * @param entity
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorUiConfig(
        module?: string,
        entity?: string,
        requestBody?: SmartAbp_CodeGenerator_Services_V9_EntityUIConfigDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/ui-config',
            query: {
                'module': module,
                'entity': entity,
            },
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
     * @param sessionId
     * @returns SmartAbp_CodeGenerator_Services_V9_GenerationStatusDto OK
     * @throws ApiError
     */
    public static getApiCodeGeneratorStatus(
        sessionId: string,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_V9_GenerationStatusDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/status/{sessionId}',
            path: {
                'sessionId': sessionId,
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
     * @param sessionId
     * @returns void
     * @throws ApiError
     */
    public static getApiCodeGeneratorExport(
        sessionId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-generator/export/{sessionId}',
            path: {
                'sessionId': sessionId,
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
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Services_GeneratedCqrsSolutionDto OK
     * @throws ApiError
     */
    public static postApiCodeGeneratorGenerateCqrs(
        requestBody?: SmartAbp_CodeGenerator_Services_CqrsDefinitionDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Services_GeneratedCqrsSolutionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/code-generator/generate-cqrs',
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
