<!-- 客户 -->
<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="客户名/用户名/手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="客户类型" prop="clientType">
          <Dict v-model="queryParams.clientType" code="CLIENT_TYPE" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-[10px]">
        <el-button type="success" icon="plus" @click="handleAddClick()">新增</el-button>
        <el-button type="danger" :disabled="ids.length === 0" icon="delete" @click="handleDelete()">
          删除
        </el-button>
      </div>

      <BaseTable
        :table-data="tableData"
        :columns="columns"
        :total="total"
        :query-params="queryParams"
        :loading="loading"
        @pagination="handleQuery"
        @page-change="handleQuery"
      >
        <template #client-type-column="{ row }">
          <el-tag :type="clientTypeMap[row.clientType].tagType">
            {{ clientTypeMap[row.clientType].label }}
          </el-tag>
        </template>
        <!-- 操作列插槽 -->
        <template #operation="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            icon="edit"
            @click.stop="handleEditClick(row.id)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            icon="delete"
            @click.stop="handleDelete(row.id)"
          >
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <ClientDialog ref="clientDialogRef" @refresh="handleQuery"></ClientDialog>
  </div>
  s
</template>

<script setup lang="ts">
import BaseTable from "@/components/BaseTable/index.vue";
defineOptions({
  name: "Dict",
  inherititems: false,
});

import ClientAPI, { ClientPageQuery, ClientPageVO } from "@/api/crm/client.api";

import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDictStore } from "@/store/modules/dict.store";
import { mapKeys } from "lodash-es";
import ClientDialog from "@/views/crm/components/client-dialog.vue";

const queryFormRef = ref();
const clientDialogRef = ref();
const clientTypeMap = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<ClientPageQuery>({
  page: 1,
  limit: 10,
});

// 表格列配置
const columns = reactive([
  { label: "客户名", prop: "clientName", minWidth: 100 },
  { label: "用户名", prop: "username", minWidth: 100 },
  { label: "客户类型", prop: "clientType", minWidth: 100, slot: "client-type-column" },
  { label: "手机号", prop: "phone", minWidth: 100 },
  { label: "邮箱", prop: "email", minWidth: 100 },
  { label: "qq", prop: "qq", minWidth: 100 },
  { label: "创建时间", prop: "createdAt", minWidth: 120 },
  { label: "操作", minWidth: 150, slot: "operation", fixed: "right" },
]);

const tableData = ref<ClientPageVO[]>();

// 查询
function handleQuery() {
  loading.value = true;
  const queryString = RequestQueryBuilder.create({
    fields: [
      "id",
      "clientName",
      "username",
      "clientStage",
      "clientType",
      "phone",
      "qq",
      "email",
      "createdAt",
      "salerId",
    ],
    search: {
      $and: [
        {
          $or: [
            { clientName: { $cont: queryParams.keywords } },
            { phone: { $cont: queryParams.keywords } },
            { username: { $cont: queryParams.keywords } },
          ],
        },
        { clientStage: queryParams.clientStage },
      ],
    },
    page: queryParams.page,
    limit: queryParams.limit,
    resetCache: true,
  }).query();

  ClientAPI.getPageList<ClientPageVO>(queryString)
    .then((data) => {
      tableData.value = data.data;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

// 重置查询
function handleResetQuery() {
  queryFormRef.value.resetFields();
  queryParams.page = 1;
  handleQuery();
}

// 新增客户
function handleAddClick() {
  clientDialogRef.value.open();
}

/**
 * 编辑客户
 *
 * @param id 客户ID
 */
function handleEditClick(id: number) {
  ClientAPI.getOne(id).then((data) => {
    clientDialogRef.value.open(data);
  });
}

/**
 * 删除客户
 *
 * @param id 客户ID
 */
function handleDelete(id?: number) {
  if (!id) {
    ElMessage.warning("请勾选删除项");
    return false;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      ClientAPI.deleteOne(id).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

async function loadDictItems() {
  const clientTypeDictItems = await useDictStore().getDictItems("CLIENT_TYPE");
  clientTypeMap.value = mapKeys(clientTypeDictItems, "value");
}

onMounted(async () => {
  await loadDictItems();
  await handleQuery();
});
</script>
