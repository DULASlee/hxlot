/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
import type { Volo_Abp_Http_Modeling_ApplicationApiDescriptionModel } from '../models/Volo_Abp_Http_Modeling_ApplicationApiDescriptionModel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AbpApiDefinitionService {
    /**
     * @param includeTypes
     * @returns Volo_Abp_Http_Modeling_ApplicationApiDescriptionModel OK
     * @throws ApiError
     */
    public static getApiAbpApiDefinition(
        includeTypes?: boolean,
    ): CancelablePromise<Volo_Abp_Http_Modeling_ApplicationApiDescriptionModel> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/abp/api-definition',
            query: {
                'IncludeTypes': includeTypes,
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
