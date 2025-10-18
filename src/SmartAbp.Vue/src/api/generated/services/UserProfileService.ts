/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_CodeGenerator_Dtos_IndustryRecommendationDto } from '../models/SmartAbp_CodeGenerator_Dtos_IndustryRecommendationDto';
import type { SmartAbp_CodeGenerator_Dtos_UpdateUserProfileDto } from '../models/SmartAbp_CodeGenerator_Dtos_UpdateUserProfileDto';
import type { SmartAbp_CodeGenerator_Dtos_UserProfileDto } from '../models/SmartAbp_CodeGenerator_Dtos_UserProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserProfileService {
    /**
     * @returns SmartAbp_CodeGenerator_Dtos_UserProfileDto OK
     * @throws ApiError
     */
    public static getApiCodeGenUserProfileMy(): CancelablePromise<SmartAbp_CodeGenerator_Dtos_UserProfileDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-gen/user-profile/my',
        });
    }
    /**
     * @param requestBody
     * @returns SmartAbp_CodeGenerator_Dtos_UserProfileDto OK
     * @throws ApiError
     */
    public static putApiCodeGenUserProfileMy(
        requestBody?: SmartAbp_CodeGenerator_Dtos_UpdateUserProfileDto,
    ): CancelablePromise<SmartAbp_CodeGenerator_Dtos_UserProfileDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/code-gen/user-profile/my',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns SmartAbp_CodeGenerator_Dtos_IndustryRecommendationDto OK
     * @throws ApiError
     */
    public static getApiCodeGenUserProfileRecommendation(): CancelablePromise<SmartAbp_CodeGenerator_Dtos_IndustryRecommendationDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/code-gen/user-profile/recommendation',
        });
    }
}
