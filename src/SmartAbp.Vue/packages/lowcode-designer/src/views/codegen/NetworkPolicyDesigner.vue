<template>
  <div class="network-policy-designer">
    <el-alert
      title="网络策略设计器"
      type="info"
      description="配置Kubernetes NetworkPolicy的Ingress和Egress规则"
      :closable="false"
      show-icon
      class="mb-4"
    />

    <el-form
      :model="localPolicy"
      label-width="120px"
    >
      <el-form-item label="策略类型">
        <el-radio-group v-model="localPolicy.policyType">
          <el-radio label="Allow">
            允许
          </el-radio>
          <el-radio label="Deny">
            拒绝
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Pod选择器">
        <el-switch v-model="localPolicy.enablePodSelector" />
        <span class="form-tip">启用后可以指定应用此策略的Pod</span>
      </el-form-item>

      <el-divider>Ingress规则</el-divider>

      <el-button
        :icon="Plus"
        size="small"
        class="mb-2"
        @click="addIngressRule"
      >
        添加Ingress规则
      </el-button>

      <el-card
        v-for="(rule, index) in localPolicy.ingressRules"
        :key="`ingress-${index}`"
        class="rule-card mb-2"
      >
        <template #header>
          <div class="card-header">
            <span>Ingress规则 {{ index + 1 }}</span>
            <el-button
              :icon="Delete"
              text
              @click="removeIngressRule(index)"
            />
          </div>
        </template>

        <el-form-item label="规则名称">
          <el-input
            v-model="rule.name"
            placeholder="例如: allow-http"
          />
        </el-form-item>

        <el-form-item label="端口">
          <el-select
            v-model="rule.ports"
            multiple
            filterable
            allow-create
            placeholder="输入端口号"
          >
            <el-option
              v-for="port in rule.ports"
              :key="port"
              :label="port"
              :value="port"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="协议">
          <el-select v-model="rule.protocol">
            <el-option
              label="TCP"
              value="TCP"
            />
            <el-option
              label="UDP"
              value="UDP"
            />
            <el-option
              label="SCTP"
              value="SCTP"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="来源CIDR">
          <el-select
            v-model="rule.fromCIDR"
            multiple
            filterable
            allow-create
            placeholder="例如: 10.0.0.0/16"
          >
            <el-option
              v-for="cidr in rule.fromCIDR"
              :key="cidr"
              :label="cidr"
              :value="cidr"
            />
          </el-select>
        </el-form-item>
      </el-card>

      <el-divider>Egress规则</el-divider>

      <el-button
        :icon="Plus"
        size="small"
        class="mb-2"
        @click="addEgressRule"
      >
        添加Egress规则
      </el-button>

      <el-card
        v-for="(rule, index) in localPolicy.egressRules"
        :key="`egress-${index}`"
        class="rule-card mb-2"
      >
        <template #header>
          <div class="card-header">
            <span>Egress规则 {{ index + 1 }}</span>
            <el-button
              :icon="Delete"
              text
              @click="removeEgressRule(index)"
            />
          </div>
        </template>

        <el-form-item label="规则名称">
          <el-input
            v-model="rule.name"
            placeholder="例如: allow-dns"
          />
        </el-form-item>

        <el-form-item label="端口">
          <el-select
            v-model="rule.ports"
            multiple
            filterable
            allow-create
            placeholder="输入端口号"
          >
            <el-option
              v-for="port in rule.ports"
              :key="port"
              :label="port"
              :value="port"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="协议">
          <el-select v-model="rule.protocol">
            <el-option
              label="TCP"
              value="TCP"
            />
            <el-option
              label="UDP"
              value="UDP"
            />
            <el-option
              label="SCTP"
              value="SCTP"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="目标CIDR">
          <el-select
            v-model="rule.toCIDR"
            multiple
            filterable
            allow-create
            placeholder="例如: 0.0.0.0/0"
          >
            <el-option
              v-for="cidr in rule.toCIDR"
              :key="cidr"
              :label="cidr"
              :value="cidr"
            />
          </el-select>
        </el-form-item>
      </el-card>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { NetworkPolicy, NetworkRule } from '@smartabp/lowcode-api'

interface Props {
  modelValue: NetworkPolicy
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: NetworkPolicy]
}>()

const localPolicy = ref<NetworkPolicy>(props.modelValue)

watch(
  localPolicy,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const addIngressRule = () => {
  localPolicy.value.ingressRules.push({
    name: '',
    ports: [],
    protocol: 'TCP',
    fromCIDR: [],
    toCIDR: [],
    fromPodSelector: {},
    toPodSelector: {}
  })
}

const removeIngressRule = (index: number) => {
  localPolicy.value.ingressRules.splice(index, 1)
}

const addEgressRule = () => {
  localPolicy.value.egressRules.push({
    name: '',
    ports: [],
    protocol: 'TCP',
    fromCIDR: [],
    toCIDR: [],
    fromPodSelector: {},
    toPodSelector: {}
  })
}

const removeEgressRule = (index: number) => {
  localPolicy.value.egressRules.splice(index, 1)
}
</script>

<script lang="ts">
import { ref } from 'vue'
</script>

<style scoped lang="scss">
.network-policy-designer {
  padding: 20px;
}

.mb-2 {
  margin-bottom: 8px;
}

.mb-4 {
  margin-bottom: 16px;
}

.rule-card {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

