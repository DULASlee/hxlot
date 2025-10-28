/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_Contracts_CodeGeneration_Dtos_CodeGenerationTaskDto = {
    id?: string;
    creationTime?: string;
    creatorId?: string | null;
    lastModificationTime?: string | null;
    lastModifierId?: string | null;
    isDeleted?: boolean;
    deleterId?: string | null;
    deletionTime?: string | null;
    taskName?: string | null;
    /**
     * 代码生成器类型
     */
    generatorType?: 1 | 2 | 3 | 4;
    configurationJson?: string | null;
    /**
     * 任务状态
     */
    status?: 0 | 1 | 2 | 3 | 4;
    resultJson?: string | null;
    errorMessage?: string | null;
    startTime?: string | null;
    completedTime?: string | null;
    outputDirectory?: string | null;
};

