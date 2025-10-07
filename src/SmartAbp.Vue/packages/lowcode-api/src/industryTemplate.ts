import type { GenerationResultDto } from './dtos'
import { http } from './http-client'

/**
 * 行业模板配置DTO
 */
export interface IndustryTemplateConfigDto {
  industry: string
  templateType: string
  projectName: string
  namespace: string
  options?: Record<string, any>
}

/**
 * 行业模板API服务
 */
class IndustryTemplateApi {
  async generate(config: IndustryTemplateConfigDto): Promise<GenerationResultDto> {
    return await http.post<GenerationResultDto>(
      '/api/lowcode/industry-templates/generate',
      config
    )
  }

  async getTemplates(industry?: string): Promise<Array<{
    id: string
    name: string
    description: string
    industry: string
  }>> {
    const params = industry ? { industry } : undefined
    return await http.get<Array<{
      id: string
      name: string
      description: string
      industry: string
    }>>('/api/lowcode/industry-templates', { params })
  }
}

export const industryTemplateApi = new IndustryTemplateApi()

