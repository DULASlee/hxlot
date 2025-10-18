/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto = {
    name?: string | null;
    targetEntityName?: string | null;
    targetEntityId?: string | null;
    relationType?: SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto.relationType;
    foreignKeyName?: string | null;
    inversePropertyName?: string | null;
    cascadeDelete?: SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto.cascadeDelete;
    isRequired?: boolean;
    joinTableName?: string | null;
    comment?: string | null;
    order?: number;
};
export namespace SmartAbp_Application_Contracts_LowCode_Dtos_NavigationPropertyDto {
    export enum relationType {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
    }
    export enum cascadeDelete {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
    }
}

