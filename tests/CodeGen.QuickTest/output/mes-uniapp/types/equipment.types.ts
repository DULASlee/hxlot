// types/equipment.types.ts
/**
 * 设备 类型定义
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体DTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EquipmentDto {
  id: string;
  name: string;
  code: string;
  type: string;
  productionLineId: string;
  isOnline: boolean;
  operatingHours: number;
  lastMaintenanceDate: Date;
}

export interface CreateEquipmentDto {
  name: string;
  code: string;
  type: string;
  productionLineId: string;
  isOnline: boolean;
  operatingHours: number;
  lastMaintenanceDate: Date;
}

export interface UpdateEquipmentDto {
  name: string;
  code: string;
  type: string;
  productionLineId: string;
  isOnline: boolean;
  operatingHours: number;
  lastMaintenanceDate: Date;
}

export interface GetEquipmentListInput {
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
