/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_SensorData_UpdateSensorDataDto = {
    sensorType: string;
    sensorName: string;
    sensorCode: string;
    value: number;
    unit: string;
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
    rawData?: string | null;
};

