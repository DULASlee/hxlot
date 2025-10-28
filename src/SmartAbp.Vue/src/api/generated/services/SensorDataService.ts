/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SmartAbp_Application_Contracts_SensorData_CreateSensorDataDto } from '../models/SmartAbp_Application_Contracts_SensorData_CreateSensorDataDto';
import type { SmartAbp_Application_Contracts_SensorData_SensorDataDto } from '../models/SmartAbp_Application_Contracts_SensorData_SensorDataDto';
import type { SmartAbp_Application_Contracts_SensorData_UpdateSensorDataDto } from '../models/SmartAbp_Application_Contracts_SensorData_UpdateSensorDataDto';
import type { Volo_Abp_Application_Dtos_PagedResultDto_1 } from '../models/Volo_Abp_Application_Dtos_PagedResultDto_1';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SensorDataService {
    /**
     * @throws ApiError
     */
    public static getApiAppSensorData({
        filter,
        sensorType,
        productionLineId,
        equipmentId,
        isAlarm,
        startTime,
        endTime,
        sorting,
        skipCount,
        maxResultCount,
    }: {
        filter?: string,
        sensorType?: string,
        productionLineId?: string,
        equipmentId?: string,
        isAlarm?: boolean,
        startTime?: string,
        endTime?: string,
        sorting?: string,
        skipCount?: number,
        maxResultCount?: number,
    }): CancelablePromise<Volo_Abp_Application_Dtos_PagedResultDto_1> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/sensor-data',
            query: {
                'Filter': filter,
                'SensorType': sensorType,
                'ProductionLineId': productionLineId,
                'EquipmentId': equipmentId,
                'IsAlarm': isAlarm,
                'StartTime': startTime,
                'EndTime': endTime,
                'Sorting': sorting,
                'SkipCount': skipCount,
                'MaxResultCount': maxResultCount,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_SensorData_SensorDataDto OK
     * @throws ApiError
     */
    public static postApiAppSensorData({
        requestBody,
    }: {
        requestBody?: SmartAbp_Application_Contracts_SensorData_CreateSensorDataDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_SensorData_SensorDataDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/app/sensor-data',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_SensorData_SensorDataDto OK
     * @throws ApiError
     */
    public static getApiAppSensorData1({
        id,
    }: {
        id: string,
    }): CancelablePromise<SmartAbp_Application_Contracts_SensorData_SensorDataDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/app/sensor-data/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
    /**
     * @returns SmartAbp_Application_Contracts_SensorData_SensorDataDto OK
     * @throws ApiError
     */
    public static putApiAppSensorData({
        id,
        requestBody,
    }: {
        id: string,
        requestBody?: SmartAbp_Application_Contracts_SensorData_UpdateSensorDataDto,
    }): CancelablePromise<SmartAbp_Application_Contracts_SensorData_SensorDataDto> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/app/sensor-data/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
    /**
     * @returns any OK
     * @throws ApiError
     */
    public static deleteApiAppSensorData({
        id,
    }: {
        id: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/app/sensor-data/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                500: `Internal Server Error`,
                501: `Not Implemented`,
            },
        });
    }
}
