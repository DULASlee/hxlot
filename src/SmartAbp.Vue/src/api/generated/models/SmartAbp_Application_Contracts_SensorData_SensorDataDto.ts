/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_SensorData_SensorDataDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    sensorType?: string | null;
    sensorName?: string | null;
    sensorCode?: string | null;
    value?: number;
    unit?: string | null;
    timestamp?: string;
    productionLineId?: string;
    equipmentId?: string;
    minValue?: number | null;
    maxValue?: number | null;
    warningThreshold?: number | null;
    alarmThreshold?: number | null;
    isAlarm?: boolean;
    alarmLevel?: string | null;
    alarmMessage?: string | null;
    status?: string | null;
    accuracy?: number | null;
    rawData?: string | null;
    tenantId?: string | null;
};

