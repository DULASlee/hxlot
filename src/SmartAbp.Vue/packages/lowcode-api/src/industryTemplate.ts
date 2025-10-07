import { apiClient } from './apiClient';
import type { IndustryTemplateConfigDto, GenerationResult } from './dtos';

class IndustryTemplateApi {
  async generate(config: IndustryTemplateConfigDto): Promise<GenerationResult> {
    const response = await apiClient.post<GenerationResult>('/api/lowcode/industry-templates/generate', config);
    return response.data;
  }
}

export const industryTemplateApi = new IndustryTemplateApi();
