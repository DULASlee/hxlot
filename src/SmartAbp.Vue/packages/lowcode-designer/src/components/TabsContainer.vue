<template>
    <div class="tabs-container">
        <!-- 🔥 临时占位组件：标签页容器 -->
        <el-tabs v-model="activeTabId" type="card" closable @tab-click="handleTabClick" @tab-remove="handleTabRemove"
            @tab-change="handleTabChange">
            <el-tab-pane v-for="tab in tabs" :key="tab.id" :label="tab.title" :name="tab.id"
                :closable="tab.closable !== false">
                <template #label>
                    <span class="tab-label">
                        <i v-if="tab.icon" :class="tab.icon" />
                        {{ tab.title }}
                        <el-tag v-if="tab.pinned" size="small" type="warning" style="margin-left: 8px;">
                            已固定
                        </el-tag>
                    </span>
                </template>

                <!-- 标签页内容 -->
                <div class="tab-content">
                    <el-result icon="info" title="标签页模式" sub-title="此功能将在Phase 2实现">
                        <template #extra>
                            <div class="tab-info">
                                <p><strong>组件</strong>: {{ tab.component }}</p>
                                <p v-if="tab.permissions && tab.permissions.length > 0">
                                    <strong>权限</strong>: {{ tab.permissions.join(', ') }}
                                </p>
                            </div>
                        </template>
                    </el-result>
                </div>
            </el-tab-pane>

            <!-- 添加标签页按钮 -->
            <template #add-icon>
                <el-button size="small" icon="el-icon-plus" circle @click="handleAddTab" />
            </template>
        </el-tabs>

        <!-- 空状态提示 -->
        <div v-if="tabs.length === 0" class="tabs-empty">
            <el-empty description="暂无标签页，点击'添加标签页'创建" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
    tabs: any[]
    activeTabId: string
}

const props = withDefaults(defineProps<Props>(), {
    tabs: () => [],
    activeTabId: ''
})

const emit = defineEmits<{
    'tab-activated': [tabId: string]
    'tab-closed': [tabId: string]
    'tab-moved': [fromIndex: number, toIndex: number]
    'add-tab': []
}>()

const activeTabId = ref(props.activeTabId)

watch(() => props.activeTabId, (newVal) => {
    activeTabId.value = newVal
})

watch(activeTabId, (newVal) => {
    if (newVal) {
        emit('tab-activated', newVal)
    }
})

const handleTabClick = (tab: any) => {
    emit('tab-activated', tab.props.name)
}

const handleTabRemove = (tabId: string) => {
    emit('tab-closed', tabId)
}

const handleTabChange = (tabId: any) => {
    emit('tab-activated', String(tabId))
}

const handleAddTab = () => {
    emit('add-tab')
}
</script>

<style scoped>
.tabs-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: white;
}

.el-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
}

:deep(.el-tabs__content) {
    flex: 1;
    overflow: auto;
}

:deep(.el-tabs__header) {
    margin: 0;
    border-bottom: 1px solid var(--el-border-color);
}

.tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
}

.tab-content {
    padding: 24px;
}

.tab-info {
    text-align: left;
    display: inline-block;
}

.tab-info p {
    margin: 8px 0;
    color: var(--el-text-color-regular);
}

.tabs-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
