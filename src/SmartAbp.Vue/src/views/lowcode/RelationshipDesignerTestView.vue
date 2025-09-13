<template>
  <div class="test-view-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>关系设计器测试 (Relationship Designer Test)</span>
          <el-button @click="resetData" type="primary">重置数据</el-button>
        </div>
      </template>
      <div class="designer-wrapper">
        <RelationshipDesigner
          :model-value="entities"
          @create-relationship="handleCreateRelationship"
          @update-relationship="handleUpdateRelationship"
          @delete-relationship="handleDeleteRelationship"
        />
      </div>
    </el-card>

    <div class="data-inspector">
      <el-tabs type="border-card">
        <el-tab-pane label="实体 (Entities)">
          <pre>{{ JSON.stringify(entities, null, 2) }}</pre>
        </el-tab-pane>
        <el-tab-pane label="关系 (Relationships)">
          <pre>{{ JSON.stringify(relationships, null, 2) }}</pre>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import RelationshipDesigner from '@smartabp/lowcode-designer/components/CodeGenerator/RelationshipDesigner.vue';
import type { EnhancedEntityModel, EntityRelationship } from '@smartabp/lowcode-designer/types'

const getInitialMockData = (): { entities: EnhancedEntityModel[], relationships: EntityRelationship[] } => ({
  entities: [
    { id: 'user', name: 'User', properties: [{id: '1', name: 'Id'}, {id: '2', name: 'Name'}] },
    { id: 'role', name: 'Role', properties: [{id: '3', name: 'Id'}, {id: '4', name: 'DisplayName'}] },
    { id: 'order', name: 'Order', properties: [{id: '5', name: 'Id'}, {id: '6', name: 'Amount'}] },
    { id: 'product', name: 'Product', properties: [{id: '7', name: 'Id'}, {id: '8', name: 'Price'}] },
    { id: 'tag', name: 'Tag', properties: [{id: '9', name: 'Id'}, {id: '10', name: 'Name'}] },
  ] as unknown as EnhancedEntityModel[],
  relationships: [
    {
      id: 'rel1',
      sourceEntityId: 'user',
      targetEntityId: 'order',
      type: 'OneToMany',
    }
  ] as unknown as EntityRelationship[],
});

const entities = ref(getInitialMockData().entities);
const relationships = ref(getInitialMockData().relationships);

const resetData = () => {
  entities.value = getInitialMockData().entities;
  relationships.value = getInitialMockData().relationships;
  ElMessage.success('数据已重置');
};

const handleCreateRelationship = (newRel: Omit<EntityRelationship, 'id'>) => {
  const newId = `rel_${Date.now()}`;
  relationships.value.push({ ...newRel, id: newId });
  ElMessage.success(`创建了新的关系: ${newId}`);
};

const handleUpdateRelationship = (updatedRel: EntityRelationship) => {
  const index = relationships.value.findIndex((r: EntityRelationship) => r.id === updatedRel.id);
  if (index !== -1) {
    relationships.value[index] = updatedRel;
    ElMessage.info(`关系已更新: ${updatedRel.id}`);
  }
};

const handleDeleteRelationship = (relId: string) => {
  relationships.value = relationships.value.filter((r: EntityRelationship) => r.id !== relId);
  ElMessage.warning(`关系已删除: ${relId}`);
};

</script>

<style scoped>
.test-view-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 100px);
}
.designer-wrapper {
  height: 500px;
  border: 1px solid var(--el-border-color);
  position: relative;
}
.data-inspector {
  flex-grow: 1;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
pre {
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
