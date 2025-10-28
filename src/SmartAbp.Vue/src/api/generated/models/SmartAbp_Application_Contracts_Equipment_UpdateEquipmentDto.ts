/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_Equipment_UpdateEquipmentDto = {
    name: string;
    code: string;
    description?: string | null;
    type: string;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    location: string;
    status?: string | null;
    healthStatus?: string | null;
    productionLineId?: string;
    maintenanceCycle?: number;
    maintenanceResponsible?: string | null;
    plcAddress?: string | null;
    plcPort?: number | null;
    isEnabled?: boolean;
    isOnline?: boolean;
};

