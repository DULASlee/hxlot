// types/production-line.types.ts
/**
 * 生产线 类型定义
 * @author SmartAbp DevKit Low-Code Engine
 * @since 2025-10-22
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 实体DTO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProductionLineDto {
  id: string;
  name: string;
  code: string;
  status: string;
  location: string;
  capacity: number;
  currentOutput: number;
}

export interface CreateProductionLineDto {
  name: string;
  code: string;
  status: string;
  location: string;
  capacity: number;
  currentOutput: number;
}

export interface UpdateProductionLineDto {
  name: string;
  code: string;
  status: string;
  location: string;
  capacity: number;
  currentOutput: number;
}

export interface GetProductionLineListInput {
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
