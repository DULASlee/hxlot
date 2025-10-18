/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationAuthConfigurationDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationAuthConfigurationDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationFeatureConfigurationDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationFeatureConfigurationDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationGlobalFeatureConfigurationDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationGlobalFeatureConfigurationDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationLocalizationConfigurationDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationLocalizationConfigurationDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationSettingConfigurationDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationSettingConfigurationDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ClockDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ClockDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_CurrentUserDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_CurrentUserDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ObjectExtending_ObjectExtensionsDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ObjectExtending_ObjectExtensionsDto';
import type { Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_TimingDto } from './Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_TimingDto';
import type { Volo_Abp_AspNetCore_Mvc_MultiTenancy_CurrentTenantDto } from './Volo_Abp_AspNetCore_Mvc_MultiTenancy_CurrentTenantDto';
import type { Volo_Abp_AspNetCore_Mvc_MultiTenancy_MultiTenancyInfoDto } from './Volo_Abp_AspNetCore_Mvc_MultiTenancy_MultiTenancyInfoDto';
export type Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationConfigurationDto = {
    localization?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationLocalizationConfigurationDto | null;
    auth?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationAuthConfigurationDto | null;
    setting?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationSettingConfigurationDto | null;
    currentUser?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_CurrentUserDto | null;
    features?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationFeatureConfigurationDto | null;
    globalFeatures?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ApplicationGlobalFeatureConfigurationDto | null;
    multiTenancy?: Volo_Abp_AspNetCore_Mvc_MultiTenancy_MultiTenancyInfoDto | null;
    currentTenant?: Volo_Abp_AspNetCore_Mvc_MultiTenancy_CurrentTenantDto | null;
    timing?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_TimingDto | null;
    clock?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ClockDto | null;
    objectExtensions?: Volo_Abp_AspNetCore_Mvc_ApplicationConfigurations_ObjectExtending_ObjectExtensionsDto | null;
    extraProperties?: Record<string, any> | null;
};

