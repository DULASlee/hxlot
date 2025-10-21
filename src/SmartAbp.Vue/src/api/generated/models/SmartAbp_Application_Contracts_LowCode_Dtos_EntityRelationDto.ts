/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_LowCode_Dtos_EntityRelationDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    fromEntity?: string | null;
    toEntity?: string | null;
    type?: 0 | 1 | 2 | 3;
    foreignKey?: string | null;
    navigationProperty?: string | null;
    joinTable?: string | null;
    cascadeDelete?: boolean;
    tenantId?: string | null;
};

