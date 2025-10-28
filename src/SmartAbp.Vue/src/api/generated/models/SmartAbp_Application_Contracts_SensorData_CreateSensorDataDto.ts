/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_SensorData_CreateSensorDataDto = {
    sensorType: string;
    sensorName: string;
    sensorCode: string;
    value: number;
    unit: string;
    productionLineId: string;
    equipmentId: string;
    minValue?: number | null;
    maxValue?: number | null;
    warningThreshold?: number | null;
    alarmThreshold?: number | null;
    rawData?: string | null;
};

