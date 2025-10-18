/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
import axios from "axios";
export var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["JsonApi"] = "application/vnd.api+json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType || (ContentType = {}));
export class HttpClient {
    instance;
    securityData = null;
    securityWorker;
    secure;
    format;
    constructor({ securityWorker, secure, format, ...axiosConfig } = {}) {
        this.instance = axios.create({
            ...axiosConfig,
            baseURL: axiosConfig.baseURL || "",
        });
        this.secure = secure;
        this.format = format;
        this.securityWorker = securityWorker;
    }
    setSecurityData = (data) => {
        this.securityData = data;
    };
    mergeRequestParams(params1, params2) {
        const method = params1.method || (params2 && params2.method);
        return {
            ...this.instance.defaults,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...((method &&
                    this.instance.defaults.headers[method.toLowerCase()]) ||
                    {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }
    stringifyFormItem(formItem) {
        if (typeof formItem === "object" && formItem !== null) {
            return JSON.stringify(formItem);
        }
        else {
            return `${formItem}`;
        }
    }
    createFormData(input) {
        if (input instanceof FormData) {
            return input;
        }
        return Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            const propertyContent = property instanceof Array ? property : [property];
            for (const formItem of propertyContent) {
                const isFileType = formItem instanceof Blob || formItem instanceof File;
                formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
            }
            return formData;
        }, new FormData());
    }
    request = async ({ secure, path, type, query, format, body, ...params }) => {
        const secureParams = ((typeof secure === "boolean" ? secure : this.secure) &&
            this.securityWorker &&
            (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const responseFormat = format || this.format || undefined;
        if (type === ContentType.FormData &&
            body &&
            body !== null &&
            typeof body === "object") {
            body = this.createFormData(body);
        }
        if (type === ContentType.Text &&
            body &&
            body !== null &&
            typeof body !== "string") {
            body = JSON.stringify(body);
        }
        return this.instance.request({
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type ? { "Content-Type": type } : {}),
            },
            params: query,
            responseType: responseFormat,
            data: body,
            url: path,
        });
    };
}
/**
 * @title SmartAbp API
 * @version v1
 *
 * SmartAbp 低代码平台 REST API - 后端SSOT架构
 */
export class Api extends HttpClient {
    api = {
        /**
         * No description
         *
         * @tags AbpApiDefinition
         * @name AbpApiDefinitionList
         * @request GET:/api/abp/api-definition
         */
        abpApiDefinitionList: (query, params = {}) => this.request({
            path: `/api/abp/api-definition`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags AbpApplicationConfiguration
         * @name AbpApplicationConfigurationList
         * @request GET:/api/abp/application-configuration
         */
        abpApplicationConfigurationList: (query, params = {}) => this.request({
            path: `/api/abp/application-configuration`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags AbpApplicationLocalization
         * @name AbpApplicationLocalizationList
         * @request GET:/api/abp/application-localization
         */
        abpApplicationLocalizationList: (query, params = {}) => this.request({
            path: `/api/abp/application-localization`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags AbpTenant
         * @name AbpMultiTenancyTenantsByNameDetail
         * @request GET:/api/abp/multi-tenancy/tenants/by-name/{name}
         */
        abpMultiTenancyTenantsByNameDetail: (name, params = {}) => this.request({
            path: `/api/abp/multi-tenancy/tenants/by-name/${name}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags AbpTenant
         * @name AbpMultiTenancyTenantsByIdDetail
         * @request GET:/api/abp/multi-tenancy/tenants/by-id/{id}
         */
        abpMultiTenancyTenantsByIdDetail: (id, params = {}) => this.request({
            path: `/api/abp/multi-tenancy/tenants/by-id/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Account
         * @name AccountRegisterCreate
         * @request POST:/api/account/register
         */
        accountRegisterCreate: (data, params = {}) => this.request({
            path: `/api/account/register`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Account
         * @name AccountSendPasswordResetCodeCreate
         * @request POST:/api/account/send-password-reset-code
         */
        accountSendPasswordResetCodeCreate: (data, params = {}) => this.request({
            path: `/api/account/send-password-reset-code`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Account
         * @name AccountVerifyPasswordResetTokenCreate
         * @request POST:/api/account/verify-password-reset-token
         */
        accountVerifyPasswordResetTokenCreate: (data, params = {}) => this.request({
            path: `/api/account/verify-password-reset-token`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Account
         * @name AccountResetPasswordCreate
         * @request POST:/api/account/reset-password
         */
        accountResetPasswordCreate: (data, params = {}) => this.request({
            path: `/api/account/reset-password`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesList
         * @request GET:/api/business-rules
         */
        businessRulesList: (query, params = {}) => this.request({
            path: `/api/business-rules`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesCreate
         * @request POST:/api/business-rules
         */
        businessRulesCreate: (data, params = {}) => this.request({
            path: `/api/business-rules`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesDetail
         * @request GET:/api/business-rules/{id}
         */
        businessRulesDetail: (id, params = {}) => this.request({
            path: `/api/business-rules/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesUpdate
         * @request PUT:/api/business-rules/{id}
         */
        businessRulesUpdate: (id, data, params = {}) => this.request({
            path: `/api/business-rules/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesDelete
         * @request DELETE:/api/business-rules/{id}
         */
        businessRulesDelete: (id, params = {}) => this.request({
            path: `/api/business-rules/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesExecuteCreate
         * @request POST:/api/business-rules/execute
         */
        businessRulesExecuteCreate: (data, params = {}) => this.request({
            path: `/api/business-rules/execute`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesValidateCreate
         * @request POST:/api/business-rules/{id}/validate
         */
        businessRulesValidateCreate: (id, params = {}) => this.request({
            path: `/api/business-rules/${id}/validate`,
            method: "POST",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesValidateAllCreate
         * @request POST:/api/business-rules/validate-all
         */
        businessRulesValidateAllCreate: (params = {}) => this.request({
            path: `/api/business-rules/validate-all`,
            method: "POST",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesStatsList
         * @request GET:/api/business-rules/stats
         */
        businessRulesStatsList: (params = {}) => this.request({
            path: `/api/business-rules/stats`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesEntitiesList
         * @request GET:/api/business-rules/entities
         */
        businessRulesEntitiesList: (params = {}) => this.request({
            path: `/api/business-rules/entities`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesEntitiesFieldsList
         * @request GET:/api/business-rules/entities/{entityName}/fields
         */
        businessRulesEntitiesFieldsList: (entityName, params = {}) => this.request({
            path: `/api/business-rules/entities/${entityName}/fields`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesBatchStatusUpdate
         * @request PUT:/api/business-rules/batch-status
         */
        businessRulesBatchStatusUpdate: (data, params = {}) => this.request({
            path: `/api/business-rules/batch-status`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesDuplicateCreate
         * @request POST:/api/business-rules/{id}/duplicate
         */
        businessRulesDuplicateCreate: (id, params = {}) => this.request({
            path: `/api/business-rules/${id}/duplicate`,
            method: "POST",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesValidateScriptCreate
         * @request POST:/api/business-rules/validate-script
         */
        businessRulesValidateScriptCreate: (data, params = {}) => this.request({
            path: `/api/business-rules/validate-script`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesScriptTypesList
         * @request GET:/api/business-rules/script-types
         */
        businessRulesScriptTypesList: (params = {}) => this.request({
            path: `/api/business-rules/script-types`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesBatchDelete
         * @request DELETE:/api/business-rules/batch
         */
        businessRulesBatchDelete: (data, params = {}) => this.request({
            path: `/api/business-rules/batch`,
            method: "DELETE",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesExportCreate
         * @request POST:/api/business-rules/export
         */
        businessRulesExportCreate: (data, params = {}) => this.request({
            path: `/api/business-rules/export`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags BusinessRule
         * @name BusinessRulesImportCreate
         * @request POST:/api/business-rules/import
         */
        businessRulesImportCreate: (data, params = {}) => this.request({
            path: `/api/business-rules/import`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorConnectionStringsList
         * @request GET:/api/code-generator/connection-strings
         */
        codeGeneratorConnectionStringsList: (params = {}) => this.request({
            path: `/api/code-generator/connection-strings`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorMenusList
         * @request GET:/api/code-generator/menus
         */
        codeGeneratorMenusList: (params = {}) => this.request({
            path: `/api/code-generator/menus`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorGenerateModuleCreate
         * @request POST:/api/code-generator/generate-module
         */
        codeGeneratorGenerateModuleCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/generate-module`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorUnifiedGenerateModuleCreate
         * @request POST:/api/code-generator/unified/generate-module
         */
        codeGeneratorUnifiedGenerateModuleCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/unified/generate-module`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorValidateCqrsDefinitionCreate
         * @request POST:/api/code-generator/validate-cqrs-definition
         */
        codeGeneratorValidateCqrsDefinitionCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/validate-cqrs-definition`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorValidateCreate
         * @request POST:/api/code-generator/validate
         */
        codeGeneratorValidateCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/validate`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorDryRunCreate
         * @request POST:/api/code-generator/dry-run
         */
        codeGeneratorDryRunCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/dry-run`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorUnifiedValidateCreate
         * @request POST:/api/code-generator/unified/validate
         */
        codeGeneratorUnifiedValidateCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/unified/validate`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorUnifiedDryRunCreate
         * @request POST:/api/code-generator/unified/dry-run
         */
        codeGeneratorUnifiedDryRunCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/unified/dry-run`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorSchemaVersionManifestList
         * @request GET:/api/code-generator/schema-version-manifest
         */
        codeGeneratorSchemaVersionManifestList: (params = {}) => this.request({
            path: `/api/code-generator/schema-version-manifest`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorTestConnectionCreate
         * @request POST:/api/code-generator/test-connection
         */
        codeGeneratorTestConnectionCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/test-connection`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorIntrospectDbCreate
         * @request POST:/api/code-generator/introspect-db
         */
        codeGeneratorIntrospectDbCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/introspect-db`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorUiConfigList
         * @request GET:/api/code-generator/ui-config
         */
        codeGeneratorUiConfigList: (query, params = {}) => this.request({
            path: `/api/code-generator/ui-config`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorUiConfigCreate
         * @request POST:/api/code-generator/ui-config
         */
        codeGeneratorUiConfigCreate: (data, query, params = {}) => this.request({
            path: `/api/code-generator/ui-config`,
            method: "POST",
            query: query,
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorStatusDetail
         * @request GET:/api/code-generator/status/{sessionId}
         */
        codeGeneratorStatusDetail: (sessionId, params = {}) => this.request({
            path: `/api/code-generator/status/${sessionId}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorExportDetail
         * @request GET:/api/code-generator/export/{sessionId}
         */
        codeGeneratorExportDetail: (sessionId, params = {}) => this.request({
            path: `/api/code-generator/export/${sessionId}`,
            method: "GET",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGeneration
         * @name CodeGeneratorGenerateCqrsCreate
         * @request POST:/api/code-generator/generate-cqrs
         */
        codeGeneratorGenerateCqrsCreate: (data, params = {}) => this.request({
            path: `/api/code-generator/generate-cqrs`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags CodeGenStats
         * @name CodeGenStatsMyList
         * @request GET:/api/code-gen/stats/my
         */
        codeGenStatsMyList: (params = {}) => this.request({
            path: `/api/code-gen/stats/my`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags DynamicClaims
         * @name AccountDynamicClaimsRefreshCreate
         * @request POST:/api/account/dynamic-claims/refresh
         */
        accountDynamicClaimsRefreshCreate: (params = {}) => this.request({
            path: `/api/account/dynamic-claims/refresh`,
            method: "POST",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EmailSettings
         * @name SettingManagementEmailingList
         * @request GET:/api/setting-management/emailing
         */
        settingManagementEmailingList: (params = {}) => this.request({
            path: `/api/setting-management/emailing`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EmailSettings
         * @name SettingManagementEmailingCreate
         * @request POST:/api/setting-management/emailing
         */
        settingManagementEmailingCreate: (data, params = {}) => this.request({
            path: `/api/setting-management/emailing`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags EmailSettings
         * @name SettingManagementEmailingSendTestEmailCreate
         * @request POST:/api/setting-management/emailing/send-test-email
         */
        settingManagementEmailingSendTestEmailCreate: (data, params = {}) => this.request({
            path: `/api/setting-management/emailing/send-test-email`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesList
         * @request GET:/api/lowcode/entity-modeling/entities
         */
        lowcodeEntityModelingEntitiesList: (params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesCreate
         * @request POST:/api/lowcode/entity-modeling/entities
         */
        lowcodeEntityModelingEntitiesCreate: (data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesDetail
         * @request GET:/api/lowcode/entity-modeling/entities/{id}
         */
        lowcodeEntityModelingEntitiesDetail: (id, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesUpdate
         * @request PUT:/api/lowcode/entity-modeling/entities/{id}
         */
        lowcodeEntityModelingEntitiesUpdate: (id, data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesDelete
         * @request DELETE:/api/lowcode/entity-modeling/entities/{id}
         */
        lowcodeEntityModelingEntitiesDelete: (id, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingEntitiesByNameDetail
         * @request GET:/api/lowcode/entity-modeling/entities/by-name/{name}
         */
        lowcodeEntityModelingEntitiesByNameDetail: (name, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/entities/by-name/${name}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingFieldsCreate
         * @request POST:/api/lowcode/entity-modeling/fields
         */
        lowcodeEntityModelingFieldsCreate: (data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/fields`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingFieldsUpdate
         * @request PUT:/api/lowcode/entity-modeling/fields/{id}
         */
        lowcodeEntityModelingFieldsUpdate: (id, data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/fields/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingFieldsDelete
         * @request DELETE:/api/lowcode/entity-modeling/fields/{id}
         */
        lowcodeEntityModelingFieldsDelete: (id, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/fields/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingRelationsList
         * @request GET:/api/lowcode/entity-modeling/relations
         */
        lowcodeEntityModelingRelationsList: (params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/relations`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingRelationsCreate
         * @request POST:/api/lowcode/entity-modeling/relations
         */
        lowcodeEntityModelingRelationsCreate: (data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/relations`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingRelationsUpdate
         * @request PUT:/api/lowcode/entity-modeling/relations/{id}
         */
        lowcodeEntityModelingRelationsUpdate: (id, data, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/relations/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingRelationsDelete
         * @request DELETE:/api/lowcode/entity-modeling/relations/{id}
         */
        lowcodeEntityModelingRelationsDelete: (id, params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/relations/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags EntityModeling
         * @name LowcodeEntityModelingValidateSchemaCreate
         * @request POST:/api/lowcode/entity-modeling/validate-schema
         */
        lowcodeEntityModelingValidateSchemaCreate: (params = {}) => this.request({
            path: `/api/lowcode/entity-modeling/validate-schema`,
            method: "POST",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Features
         * @name FeatureManagementFeaturesList
         * @request GET:/api/feature-management/features
         */
        featureManagementFeaturesList: (query, params = {}) => this.request({
            path: `/api/feature-management/features`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Features
         * @name FeatureManagementFeaturesUpdate
         * @request PUT:/api/feature-management/features
         */
        featureManagementFeaturesUpdate: (data, query, params = {}) => this.request({
            path: `/api/feature-management/features`,
            method: "PUT",
            query: query,
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Features
         * @name FeatureManagementFeaturesDelete
         * @request DELETE:/api/feature-management/features
         */
        featureManagementFeaturesDelete: (query, params = {}) => this.request({
            path: `/api/feature-management/features`,
            method: "DELETE",
            query: query,
            ...params,
        }),
        /**
         * No description
         *
         * @tags GenerationHistory
         * @name CodeGenGenerationHistoryRecentList
         * @request GET:/api/code-gen/generation-history/recent
         */
        codeGenGenerationHistoryRecentList: (query, params = {}) => this.request({
            path: `/api/code-gen/generation-history/recent`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags GenerationHistory
         * @name CodeGenGenerationHistoryAllList
         * @request GET:/api/code-gen/generation-history/all
         */
        codeGenGenerationHistoryAllList: (query, params = {}) => this.request({
            path: `/api/code-gen/generation-history/all`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags GenerationHistory
         * @name CodeGenGenerationHistoryCreate
         * @request POST:/api/code-gen/generation-history
         */
        codeGenGenerationHistoryCreate: (data, params = {}) => this.request({
            path: `/api/code-gen/generation-history`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags GenerationHistory
         * @name CodeGenGenerationHistoryDelete
         * @request DELETE:/api/code-gen/generation-history/{id}
         */
        codeGenGenerationHistoryDelete: (id, params = {}) => this.request({
            path: `/api/code-gen/generation-history/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags IndustryTemplate
         * @name LowcodeIndustryTemplatesGenerateCreate
         * @request POST:/api/lowcode/industry-templates/generate
         */
        lowcodeIndustryTemplatesGenerateCreate: (data, params = {}) => this.request({
            path: `/api/lowcode/industry-templates/generate`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Login
         * @name AccountLoginCreate
         * @request POST:/api/account/login
         */
        accountLoginCreate: (data, params = {}) => this.request({
            path: `/api/account/login`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Login
         * @name AccountLogoutList
         * @request GET:/api/account/logout
         */
        accountLogoutList: (params = {}) => this.request({
            path: `/api/account/logout`,
            method: "GET",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Login
         * @name AccountCheckPasswordCreate
         * @request POST:/api/account/check-password
         */
        accountCheckPasswordCreate: (data, params = {}) => this.request({
            path: `/api/account/check-password`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Metadata
         * @name MetadataRegisterModuleCreate
         * @request POST:/api/metadata/register-module
         */
        metadataRegisterModuleCreate: (data, params = {}) => this.request({
            path: `/api/metadata/register-module`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Metadata
         * @name MetadataCreate
         * @request POST:/api/metadata
         */
        metadataCreate: (data, params = {}) => this.request({
            path: `/api/metadata`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Metadata
         * @name MetadataUpdate
         * @request PUT:/api/metadata
         */
        metadataUpdate: (data, params = {}) => this.request({
            path: `/api/metadata`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Metadata
         * @name MetadataDetail
         * @request GET:/api/metadata/{moduleName}
         */
        metadataDetail: (moduleName, params = {}) => this.request({
            path: `/api/metadata/${moduleName}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesList
         * @request GET:/api/lowcode/modules
         */
        lowcodeModulesList: (query, params = {}) => this.request({
            path: `/api/lowcode/modules`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesCreate
         * @request POST:/api/lowcode/modules
         */
        lowcodeModulesCreate: (data, params = {}) => this.request({
            path: `/api/lowcode/modules`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesDetail
         * @request GET:/api/lowcode/modules/{id}
         */
        lowcodeModulesDetail: (id, params = {}) => this.request({
            path: `/api/lowcode/modules/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesUpdate
         * @request PUT:/api/lowcode/modules/{id}
         */
        lowcodeModulesUpdate: (id, data, params = {}) => this.request({
            path: `/api/lowcode/modules/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesDelete
         * @request DELETE:/api/lowcode/modules/{id}
         */
        lowcodeModulesDelete: (id, params = {}) => this.request({
            path: `/api/lowcode/modules/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Module
         * @name LowcodeModulesBySystemNameDetail
         * @request GET:/api/lowcode/modules/by-system-name/{systemName}
         */
        lowcodeModulesBySystemNameDetail: (systemName, params = {}) => this.request({
            path: `/api/lowcode/modules/by-system-name/${systemName}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Permissions
         * @name PermissionManagementPermissionsList
         * @request GET:/api/permission-management/permissions
         */
        permissionManagementPermissionsList: (query, params = {}) => this.request({
            path: `/api/permission-management/permissions`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Permissions
         * @name PermissionManagementPermissionsUpdate
         * @request PUT:/api/permission-management/permissions
         */
        permissionManagementPermissionsUpdate: (data, query, params = {}) => this.request({
            path: `/api/permission-management/permissions`,
            method: "PUT",
            query: query,
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Profile
         * @name AccountMyProfileList
         * @request GET:/api/account/my-profile
         */
        accountMyProfileList: (params = {}) => this.request({
            path: `/api/account/my-profile`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Profile
         * @name AccountMyProfileUpdate
         * @request PUT:/api/account/my-profile
         */
        accountMyProfileUpdate: (data, params = {}) => this.request({
            path: `/api/account/my-profile`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Profile
         * @name AccountMyProfileChangePasswordCreate
         * @request POST:/api/account/my-profile/change-password
         */
        accountMyProfileChangePasswordCreate: (data, params = {}) => this.request({
            path: `/api/account/my-profile/change-password`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesAllList
         * @request GET:/api/identity/roles/all
         */
        identityRolesAllList: (params = {}) => this.request({
            path: `/api/identity/roles/all`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesList
         * @request GET:/api/identity/roles
         */
        identityRolesList: (query, params = {}) => this.request({
            path: `/api/identity/roles`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesCreate
         * @request POST:/api/identity/roles
         */
        identityRolesCreate: (data, params = {}) => this.request({
            path: `/api/identity/roles`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesDetail
         * @request GET:/api/identity/roles/{id}
         */
        identityRolesDetail: (id, params = {}) => this.request({
            path: `/api/identity/roles/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesUpdate
         * @request PUT:/api/identity/roles/{id}
         */
        identityRolesUpdate: (id, data, params = {}) => this.request({
            path: `/api/identity/roles/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Role
         * @name IdentityRolesDelete
         * @request DELETE:/api/identity/roles/{id}
         */
        identityRolesDelete: (id, params = {}) => this.request({
            path: `/api/identity/roles/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsDetail
         * @request GET:/api/multi-tenancy/tenants/{id}
         */
        multiTenancyTenantsDetail: (id, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsUpdate
         * @request PUT:/api/multi-tenancy/tenants/{id}
         */
        multiTenancyTenantsUpdate: (id, data, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsDelete
         * @request DELETE:/api/multi-tenancy/tenants/{id}
         */
        multiTenancyTenantsDelete: (id, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsList
         * @request GET:/api/multi-tenancy/tenants
         */
        multiTenancyTenantsList: (query, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsCreate
         * @request POST:/api/multi-tenancy/tenants
         */
        multiTenancyTenantsCreate: (data, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsDefaultConnectionStringList
         * @request GET:/api/multi-tenancy/tenants/{id}/default-connection-string
         */
        multiTenancyTenantsDefaultConnectionStringList: (id, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsDefaultConnectionStringUpdate
         * @request PUT:/api/multi-tenancy/tenants/{id}/default-connection-string
         */
        multiTenancyTenantsDefaultConnectionStringUpdate: (id, query, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
            method: "PUT",
            query: query,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tenant
         * @name MultiTenancyTenantsDefaultConnectionStringDelete
         * @request DELETE:/api/multi-tenancy/tenants/{id}/default-connection-string
         */
        multiTenancyTenantsDefaultConnectionStringDelete: (id, params = {}) => this.request({
            path: `/api/multi-tenancy/tenants/${id}/default-connection-string`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags TimeZoneSettings
         * @name SettingManagementTimezoneList
         * @request GET:/api/setting-management/timezone
         */
        settingManagementTimezoneList: (params = {}) => this.request({
            path: `/api/setting-management/timezone`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags TimeZoneSettings
         * @name SettingManagementTimezoneCreate
         * @request POST:/api/setting-management/timezone
         */
        settingManagementTimezoneCreate: (query, params = {}) => this.request({
            path: `/api/setting-management/timezone`,
            method: "POST",
            query: query,
            ...params,
        }),
        /**
         * No description
         *
         * @tags TimeZoneSettings
         * @name SettingManagementTimezoneTimezonesList
         * @request GET:/api/setting-management/timezone/timezones
         */
        settingManagementTimezoneTimezonesList: (params = {}) => this.request({
            path: `/api/setting-management/timezone/timezones`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersDetail
         * @request GET:/api/identity/users/{id}
         */
        identityUsersDetail: (id, params = {}) => this.request({
            path: `/api/identity/users/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersUpdate
         * @request PUT:/api/identity/users/{id}
         */
        identityUsersUpdate: (id, data, params = {}) => this.request({
            path: `/api/identity/users/${id}`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersDelete
         * @request DELETE:/api/identity/users/{id}
         */
        identityUsersDelete: (id, params = {}) => this.request({
            path: `/api/identity/users/${id}`,
            method: "DELETE",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersList
         * @request GET:/api/identity/users
         */
        identityUsersList: (query, params = {}) => this.request({
            path: `/api/identity/users`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersCreate
         * @request POST:/api/identity/users
         */
        identityUsersCreate: (data, params = {}) => this.request({
            path: `/api/identity/users`,
            method: "POST",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersRolesList
         * @request GET:/api/identity/users/{id}/roles
         */
        identityUsersRolesList: (id, params = {}) => this.request({
            path: `/api/identity/users/${id}/roles`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersRolesUpdate
         * @request PUT:/api/identity/users/{id}/roles
         */
        identityUsersRolesUpdate: (id, data, params = {}) => this.request({
            path: `/api/identity/users/${id}/roles`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersAssignableRolesList
         * @request GET:/api/identity/users/assignable-roles
         */
        identityUsersAssignableRolesList: (params = {}) => this.request({
            path: `/api/identity/users/assignable-roles`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersByUsernameDetail
         * @request GET:/api/identity/users/by-username/{userName}
         */
        identityUsersByUsernameDetail: (userName, params = {}) => this.request({
            path: `/api/identity/users/by-username/${userName}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags User
         * @name IdentityUsersByEmailDetail
         * @request GET:/api/identity/users/by-email/{email}
         */
        identityUsersByEmailDetail: (email, params = {}) => this.request({
            path: `/api/identity/users/by-email/${email}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserLookup
         * @name IdentityUsersLookupDetail
         * @request GET:/api/identity/users/lookup/{id}
         */
        identityUsersLookupDetail: (id, params = {}) => this.request({
            path: `/api/identity/users/lookup/${id}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserLookup
         * @name IdentityUsersLookupByUsernameDetail
         * @request GET:/api/identity/users/lookup/by-username/{userName}
         */
        identityUsersLookupByUsernameDetail: (userName, params = {}) => this.request({
            path: `/api/identity/users/lookup/by-username/${userName}`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserLookup
         * @name IdentityUsersLookupSearchList
         * @request GET:/api/identity/users/lookup/search
         */
        identityUsersLookupSearchList: (query, params = {}) => this.request({
            path: `/api/identity/users/lookup/search`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserLookup
         * @name IdentityUsersLookupCountList
         * @request GET:/api/identity/users/lookup/count
         */
        identityUsersLookupCountList: (query, params = {}) => this.request({
            path: `/api/identity/users/lookup/count`,
            method: "GET",
            query: query,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserProfile
         * @name CodeGenUserProfileMyList
         * @request GET:/api/code-gen/user-profile/my
         */
        codeGenUserProfileMyList: (params = {}) => this.request({
            path: `/api/code-gen/user-profile/my`,
            method: "GET",
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserProfile
         * @name CodeGenUserProfileMyUpdate
         * @request PUT:/api/code-gen/user-profile/my
         */
        codeGenUserProfileMyUpdate: (data, params = {}) => this.request({
            path: `/api/code-gen/user-profile/my`,
            method: "PUT",
            body: data,
            type: ContentType.Json,
            format: "json",
            ...params,
        }),
        /**
         * No description
         *
         * @tags UserProfile
         * @name CodeGenUserProfileRecommendationList
         * @request GET:/api/code-gen/user-profile/recommendation
         */
        codeGenUserProfileRecommendationList: (params = {}) => this.request({
            path: `/api/code-gen/user-profile/recommendation`,
            method: "GET",
            format: "json",
            ...params,
        }),
    };
}
//# sourceMappingURL=api-client.js.map