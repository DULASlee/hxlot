/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityDefinitionDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityDefinitionDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityFieldDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityFieldDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityRelationDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityRelationDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto';
import type { SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto } from '../models/SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto';
import type { SmartAbp_Application_Contracts_LowCode_SchemaValidationResult } from '../models/SmartAbp_Application_Contracts_LowCode_SchemaValidationResult';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EntityModelingService {
    /**
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static getApiLowcodeEntityModelingEntities(): CancelablePromise<Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/entity-modeling/entities',
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static postApiLowcodeEntityModelingEntities(
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityDefinitionDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/entity-modeling/entities',
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
     * @param id
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static getApiLowcodeEntityModelingEntities1(
        id: string,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/entity-modeling/entities/{id}',
            path: {
                'id': id,
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
     * @param id
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static putApiLowcodeEntityModelingEntities(
        id: string,
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityDefinitionDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/lowcode/entity-modeling/entities/{id}',
            path: {
                'id': id,
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
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiLowcodeEntityModelingEntities(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/lowcode/entity-modeling/entities/{id}',
            path: {
                'id': id,
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
     * @param name
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto OK
     * @throws ApiError
     */
    public static getApiLowcodeEntityModelingEntitiesByName(
        name: string,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityDefinitionDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/entity-modeling/entities/by-name/{name}',
            path: {
                'name': name,
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto OK
     * @throws ApiError
     */
    public static postApiLowcodeEntityModelingFields(
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityFieldDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/entity-modeling/fields',
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
     * @param id
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto OK
     * @throws ApiError
     */
    public static putApiLowcodeEntityModelingFields(
        id: string,
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityFieldDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityFieldDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/lowcode/entity-modeling/fields/{id}',
            path: {
                'id': id,
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
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiLowcodeEntityModelingFields(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/lowcode/entity-modeling/fields/{id}',
            path: {
                'id': id,
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto OK
     * @throws ApiError
     */
    public static getApiLowcodeEntityModelingRelations(): CancelablePromise<Array<SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/lowcode/entity-modeling/relations',
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
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto OK
     * @throws ApiError
     */
    public static postApiLowcodeEntityModelingRelations(
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityRelationDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/entity-modeling/relations',
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
     * @param id
     * @param requestBody
     * @returns SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto OK
     * @throws ApiError
     */
    public static putApiLowcodeEntityModelingRelations(
        id: string,
        requestBody?: SmartAbp_Application_Contracts_LowCode_Dtos_CreateOrUpdateEntityRelationDto,
    ): CancelablePromise<SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/lowcode/entity-modeling/relations/{id}',
            path: {
                'id': id,
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
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiLowcodeEntityModelingRelations(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/lowcode/entity-modeling/relations/{id}',
            path: {
                'id': id,
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
     * @returns SmartAbp_Application_Contracts_LowCode_SchemaValidationResult OK
     * @throws ApiError
     */
    public static postApiLowcodeEntityModelingValidateSchema(): CancelablePromise<SmartAbp_Application_Contracts_LowCode_SchemaValidationResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/lowcode/entity-modeling/validate-schema',
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
