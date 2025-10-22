// types/sensor-data.types.ts
/**
 * 传感器数据 类型定义
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体DTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SensorDataDto {
  id: string;
  equipmentId: string;
  sensorType: string;
  temperature: number;
  pressure: number;
  humidity: number;
  vibration: number;
  power: number;
  timestamp: Date;
  isAlarm: boolean;
}

export interface CreateSensorDataDto {
  equipmentId: string;
  sensorType: string;
  temperature: number;
  pressure: number;
  humidity: number;
  vibration: number;
  power: number;
  timestamp: Date;
  isAlarm: boolean;
}

export interface UpdateSensorDataDto {
  equipmentId: string;
  sensorType: string;
  temperature: number;
  pressure: number;
  humidity: number;
  vibration: number;
  power: number;
  timestamp: Date;
  isAlarm: boolean;
}

export interface GetSensorDataListInput {
  filter?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ABP vNext 通用类型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
}

export interface ListResultDto<T> {
  items: T[];
}
