/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SmartAbp_Application_LowCode_CodeGenerationTaskStatus = {
    taskId?: string | null;
    entityId?: string;
    status?: string | null;
    progress?: number;
    currentStep?: string | null;
    createdAt?: string;
    updatedAt?: string | null;
    completedAt?: string | null;
    result?: Record<string, any> | null;
    errorMessage?: string | null;
    generatedFiles?: Record<string, string> | null;
    errors?: Array<string> | null;
    elapsedMilliseconds?: number;
};

