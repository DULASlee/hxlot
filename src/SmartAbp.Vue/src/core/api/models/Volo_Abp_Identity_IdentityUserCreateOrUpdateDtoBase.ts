/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type Volo_Abp_Identity_IdentityUserCreateOrUpdateDtoBase = {
    readonly extraProperties?: Record<string, any> | null;
    userName: string;
    name?: string | null;
    surname?: string | null;
    email: string;
    phoneNumber?: string | null;
    isActive?: boolean;
    lockoutEnabled?: boolean;
    roleNames?: Array<string> | null;
};

