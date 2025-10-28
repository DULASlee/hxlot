/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_Equipment_EquipmentDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    name?: string | null;
    code?: string | null;
    description?: string | null;
    type?: string | null;
    manufacturer?: string | null;
    model?: string | null;
    serialNumber?: string | null;
    location?: string | null;
    status?: string | null;
    healthStatus?: string | null;
    temperature?: number;
    pressure?: number;
    vibration?: number;
    speed?: number;
    power?: number;
    current?: number;
    voltage?: number;
    lastUpdateTime?: string;
    totalRunningHours?: number;
    dailyRunningHours?: number;
    totalProduction?: number;
    dailyProduction?: number;
    faultCount?: number;
    utilizationRate?: number;
    oee?: number;
    lastMaintenanceDate?: string | null;
    nextMaintenanceDate?: string | null;
    maintenanceCycle?: number;
    maintenanceResponsible?: string | null;
    productionLineId?: string;
    tenantId?: string | null;
    isEnabled?: boolean;
    isOnline?: boolean;
    plcAddress?: string | null;
    plcPort?: number | null;
};

