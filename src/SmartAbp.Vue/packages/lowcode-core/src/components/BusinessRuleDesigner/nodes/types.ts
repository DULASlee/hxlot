// 类型定义仅供本目录节点组件使用，遵循包内自给自足，不跨层依赖

export type ActionType = 'SetFieldValue' | 'ShowMessage' | 'CallAPI' | 'ValidateField'

export interface SetFieldValueParams {
    actionType: 'SetFieldValue'
    field: string
    value: unknown
}

export interface ShowMessageParams {
    actionType: 'ShowMessage'
    message: string
    type?: 'success' | 'warning' | 'info' | 'error'
}

export interface CallAPIParams {
    actionType: 'CallAPI'
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
}

export interface ValidateFieldParams {
    actionType: 'ValidateField'
    field: string
    rules?: string[]
}

export interface RuleNodeData {
    id?: string
    label?: string
    description?: string
    selected?: boolean
    actionType?: ActionType
    actionParams?: SetFieldValueParams | ShowMessageParams | CallAPIParams | ValidateFieldParams
    expression?: string
}


