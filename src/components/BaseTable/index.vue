<template>
  <div class="base-table-container">
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :border="border"
      :highlight-current-row="highlightCurrentRow"
      v-bind="$attrs"
      @selection-change="handleSelectionChange"
    >
      <!-- 选择列 -->
      <el-table-column v-if="showSelection" type="selection" width="55" align="center" />

      <!-- 序号列 -->
      <el-table-column v-if="showIndex" label="序号" type="index" width="80" align="center" />

      <!-- 动态渲染列 -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column v-bind="column" :align="column.align || 'center'">
          <template #default="scope">
            <!-- 1. 优先使用格式化函数 -->
            <template v-if="column.formatter">
              {{ column.formatter(scope.row[column.prop], scope.row) }}
            </template>
            <!-- 2. 其次使用自定义插槽 -->
            <template v-else-if="column.slot">
              <slot :name="column.slot" :row="scope.row" />
            </template>
            <!-- 3. 默认显示 -->
            <template v-else>
              {{ scope.row[column.prop] }}
            </template>
          </template>
        </el-table-column>
      </template>

      <!-- 固定操作列 -->
      <el-table-column
        v-if="showOperation"
        :label="operationColumn.label || '操作'"
        :width="operationColumn.width"
        :min-width="operationColumn.minWidth || '220'"
        :fixed="operationColumn.fixed || 'right'"
        align="center"
      >
        <template #default="scope">
          <slot name="operation" :row="scope.row" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <div v-if="showPagination" class="pagination-wrapper">
      <slot name="pagination" :total="total" :query="queryParams">
        <el-pagination
          v-if="total > 0"
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePagination"
          @current-change="handlePagination"
        />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  columns: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  queryParams: {
    type: Object,
    default: () => ({
      page: 1,
      limit: 10,
    }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  border: {
    type: Boolean,
    default: true,
  },
  highlightCurrentRow: {
    type: Boolean,
    default: false,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  // 是否显示选择列
  showSelection: {
    type: Boolean,
    default: false,
  },
  // 是否显示序号列
  showIndex: {
    type: Boolean,
    default: false,
  },
  showOperation: {
    type: Boolean,
    default: false,
  },
  // 操作列配置
  operationColumn: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:queryParams", "update:total", "selection-change", "page-change"]);

const tableRef = ref(null);

// 处理分页变化
const handlePagination = () => {
  emit("page-change", props.queryParams);
  emit("update:queryParams", props.queryParams);
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  emit("selection-change", selection);
};

// 暴露组件方法
defineExpose({
  getTableRef: () => tableRef.value,
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
});
</script>

<style scoped>
.base-table-container {
  width: 100%;
  margin-top: 16px;
}
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
