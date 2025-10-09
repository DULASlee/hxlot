/**
 * WithValidation 高阶组件
 * 为任何组件添加表单验证功能
 */

import { computed, defineComponent, h, ref, watch, type Component } from 'vue';
import type { BaseComponentProps } from './../types';
import {
  isEmail,
  isRequired,
  isUrl,
  pattern
} from './../validators';

/**
 * 本地验证规则接口（与WithValidation组件内部逻辑匹配）
 * Note: 这与 UnifiedValidationRule 不同，是组件内部使用的规则结构
 */
interface ValidationRule {
  type?: string;
  pattern?: string | RegExp;
  validator?: (value: any) => boolean | Promise<boolean>;
  message?: string;
}

/**
 * 获取组件名称的类型安全函数
 */
function getComponentName(component: Component): string {
  if (typeof component === 'object' && component !== null) {
    if ('name' in component && typeof component.name === 'string') {
      return component.name;
    }
    if ('__name' in component && typeof component.__name === 'string') {
      return component.__name;
    }
  }
  return 'Component';
}

/**
 * WithValidation Props扩展
 */
export interface WithValidationProps extends BaseComponentProps {
  /**
   * 字段值
   */
  modelValue?: any;

  /**
   * 验证规则
   */
  rules?: ValidationRule[];

  /**
   * 是否必填
   */
  required?: boolean;

  /**
   * 验证触发时机
   */
  validateOn?: 'blur' | 'change' | 'submit' | 'manual';

  /**
   * 是否显示验证状态
   */
  showValidation?: boolean;

  /**
   * 错误提示信息
   */
  errorMessage?: string;

  /**
   * 验证通过回调
   */
  onValid?: () => void;

  /**
   * 验证失败回调
   */
  onInvalid?: (errors: string[]) => void;
}

/**
 * 组件验证结果
 */
export interface ComponentValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * WithValidation 高阶组件工厂函数
 *
 * @param WrappedComponent 被包装的组件
 * @returns 增强后的组件
 *
 * @example
 * ```typescript
 * import { WithValidation } from '@smartabp/lowcode-shared/components/hocs'
 * import InputComponent from './InputComponent.vue'
 *
 * const ValidatedInput = WithValidation(InputComponent)
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <ValidatedInput
 *     v-model="email"
 *     :rules="emailRules"
 *     validate-on="blur"
 *     :show-validation="true"
 *     @valid="handleValid"
 *     @invalid="handleInvalid"
 *   />
 * </template>
 *
 * <script setup>
 * const emailRules = [
 *   { type: 'required', message: '邮箱为必填项' },
 *   { type: 'email', message: '请输入有效的邮箱地址' }
 * ]
 * </script>
 * ```
 */
export function WithValidation(
  WrappedComponent: Component
) {
  return defineComponent({
    // ✅ 正确：使用类型守卫替代as any
    name: `WithValidation(${getComponentName(WrappedComponent)})`,

    props: {
      modelValue: {
        type: null,
        default: undefined
      },
      rules: {
        type: Array as () => ValidationRule[],
        default: () => []
      },
      required: {
        type: Boolean,
        default: false
      },
      validateOn: {
        type: String as () => 'blur' | 'change' | 'submit' | 'manual',
        default: 'blur'
      },
      showValidation: {
        type: Boolean,
        default: true
      },
      errorMessage: {
        type: String,
        default: ''
      },
      onValid: {
        type: Function as unknown as () => () => void,
        default: undefined
      },
      onInvalid: {
        type: Function as unknown as () => (errors: string[]) => void,
        default: undefined
      }
    },

    emits: ['update:modelValue', 'valid', 'invalid', 'validate'],

    setup(props, { attrs, slots, emit }) {
      const internalValue = ref(props.modelValue);
      const validationErrors = ref<string[]>([]);
      const isTouched = ref(false);
      const isValidating = ref(false);

      // 是否显示错误
      const shouldShowErrors = computed(() => {
        return props.showValidation && isTouched.value && validationErrors.value.length > 0;
      });

      // 是否有效
      const isValid = computed(() => {
        return validationErrors.value.length === 0;
      });

      /**
       * 执行验证
       */
      const validate = async (): Promise<ComponentValidationResult> => {
        isValidating.value = true;
        const errors: string[] = [];

        const value = internalValue.value;

        // 1. 检查必填
        if (props.required) {
          const requiredResult = isRequired(value);
          if (!requiredResult.valid) {
            errors.push(props.errorMessage || '此字段为必填项');
          }
        }

        // 2. 执行所有验证规则
        for (const rule of props.rules) {
          let isRuleValid = true;

          switch (rule.type) {
            case 'required': {
              const result = isRequired(value);
              isRuleValid = result.valid;
              break;
            }
            case 'email': {
              const result = isEmail(value);
              isRuleValid = result.valid;
              break;
            }
            case 'url': {
              const result = isUrl(value);
              isRuleValid = result.valid;
              break;
            }
            case 'pattern':
              if (rule.pattern) {
                const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
                const result = pattern(value, regex);
                isRuleValid = result.valid;
              }
              break;
            case 'custom':
              if (rule.validator) {
                const result = await Promise.resolve(rule.validator(value));
                isRuleValid = typeof result === 'boolean' ? result : (result as any).valid;
              }
              break;
          }

          if (!isRuleValid) {
            errors.push(rule.message || '验证失败');
          }
        }

        validationErrors.value = errors;
        isValidating.value = false;

        const result: ComponentValidationResult = {
          valid: errors.length === 0,
          errors
        };

        // 触发回调
        if (result.valid && props.onValid) {
          props.onValid();
        } else if (!result.valid && props.onInvalid) {
          props.onInvalid(errors);
        }

        // 触发事件
        emit('validate', result);
        if (result.valid) {
          emit('valid');
        } else {
          emit('invalid', errors);
        }

        return result;
      };

      /**
       * 处理值变化
       */
      const handleValueChange = (newValue: any) => {
        internalValue.value = newValue;
        emit('update:modelValue', newValue);

        // 根据触发时机验证
        if (props.validateOn === 'change' || (isTouched.value && props.validateOn === 'blur')) {
          validate();
        }
      };

      /**
       * 处理失焦
       */
      const handleBlur = () => {
        isTouched.value = true;
        if (props.validateOn === 'blur') {
          validate();
        }
      };

      // 监听外部值变化
      watch(() => props.modelValue, (newValue) => {
        if (newValue !== internalValue.value) {
          internalValue.value = newValue;
          if (isTouched.value) {
            validate();
          }
        }
      });

      // 监听规则变化，重新验证
      watch(() => props.rules, () => {
        if (isTouched.value) {
          validate();
        }
      }, { deep: true });

      // 暴露验证方法给父组件
      return () => {
        return h('div', { class: 'with-validation-wrapper' }, [
          h(WrappedComponent, {
            ...attrs,
            modelValue: internalValue.value,
            'onUpdate:modelValue': handleValueChange,
            onBlur: handleBlur,
            error: shouldShowErrors.value ? validationErrors.value[0] : undefined,
            invalid: !isValid.value,
            validating: isValidating.value
          }, slots),

          // 错误提示
          shouldShowErrors.value && h('div', { class: 'validation-errors' },
            validationErrors.value.map(error =>
              h('span', { class: 'validation-error' }, error)
            )
          )
        ]);
      };
    }
  });
}

/**
 * 表单验证组合式函数
 *
 * @example
 * ```typescript
 * import { useValidation } from '@smartabp/lowcode-shared/components/hocs'
 *
 * const {
 *   errors,
 *   isValid,
 *   validate,
 *   validateField,
 *   clearErrors
 * } = useValidation()
 *
 * // 验证单个字段
 * const result = await validateField('email', emailValue, emailRules)
 *
 * // 验证整个表单
 * const formValid = await validate(formData, formRules)
 * ```
 */
export function useValidation() {
  const errors = ref<Record<string, string[]>>({});
  const touchedFields = ref<Set<string>>(new Set());

  const isValid = computed(() => {
    return Object.values(errors.value).every(fieldErrors => fieldErrors.length === 0);
  });

  const hasErrors = (field?: string) => {
    if (field) {
      return (errors.value[field]?.length ?? 0) > 0;
    }
    return !isValid.value;
  };

  const getErrors = (field?: string): string[] => {
    if (field) {
      return errors.value[field] || [];
    }
    return Object.values(errors.value).flat();
  };

  /**
   * 验证单个字段
   */
  const validateField = async (
    field: string,
    value: any,
    rules: ValidationRule[]
  ): Promise<ComponentValidationResult> => {
    const fieldErrors: string[] = [];

    for (const rule of rules) {
      let isRuleValid = true;

      switch (rule.type) {
        case 'required': {
          const result = isRequired(value);
          isRuleValid = result.valid;
          break;
        }
        case 'email': {
          const result = isEmail(value);
          isRuleValid = result.valid;
          break;
        }
        case 'url': {
          const result = isUrl(value);
          isRuleValid = result.valid;
          break;
        }
        case 'pattern':
          if (rule.pattern) {
            const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
            const result = pattern(value, regex);
            isRuleValid = result.valid;
          }
          break;
        case 'custom':
          if (rule.validator) {
            const result = await Promise.resolve(rule.validator(value));
            isRuleValid = typeof result === 'boolean' ? result : (result as any).valid;
          }
          break;
      }

      if (!isRuleValid) {
        fieldErrors.push(rule.message || '验证失败');
      }
    }

    errors.value[field] = fieldErrors;
    touchedFields.value.add(field);

    return {
      valid: fieldErrors.length === 0,
      errors: fieldErrors
    };
  };

  /**
   * 验证整个表单
   */
  const validate = async (
    formData: Record<string, any>,
    formRules: Record<string, ValidationRule[]>
  ): Promise<boolean> => {
    const validationPromises = Object.entries(formRules).map(([field, rules]) =>
      validateField(field, formData[field], rules)
    );

    const results = await Promise.all(validationPromises);
    return results.every(result => result.valid);
  };

  /**
   * 清除错误
   */
  const clearErrors = (field?: string) => {
    if (field) {
      delete errors.value[field];
      touchedFields.value.delete(field);
    } else {
      errors.value = {};
      touchedFields.value.clear();
    }
  };

  /**
   * 标记字段为已触摸
   */
  const touchField = (field: string) => {
    touchedFields.value.add(field);
  };

  /**
   * 重置验证状态
   */
  const reset = () => {
    errors.value = {};
    touchedFields.value.clear();
  };

  return {
    errors,
    isValid,
    hasErrors,
    getErrors,
    validateField,
    validate,
    clearErrors,
    touchField,
    reset
  };
}
