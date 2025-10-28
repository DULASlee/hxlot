/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_Equipment_CreateEquipmentDto = {
    name: string;
    code: string;
    description?: string | null;
    type: string;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    location: string;
    productionLineId: string;
    maintenanceCycle?: number;
    maintenanceResponsible?: string | null;
    plcAddress?: string | null;
    plcPort?: number | null;
    isEnabled?: boolean;
};

