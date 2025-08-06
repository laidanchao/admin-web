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
            v-hasPerm="['crm:client:appoint']"
            :type="row.salerId ? 'primary' : 'warning'"
            link
            size="small"
            icon="edit"
            @click.stop="handleAppointClick(row)"
          >
            {{ row.salerId ? "取消分配" : "分配销售员" }}
          </el-button>
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

    <!--客户信息弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="450px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-card shadow="never">
          <el-form-item label="客户名" prop="clientName">
            <el-input v-model="formData.clientName" placeholder="请输入客户名" />
          </el-form-item>
          <el-form-item label="客户类型" prop="clientType">
            <Dict v-model="formData.clientType" code="CLIENT_TYPE" :clearable="false" />
          </el-form-item>
          <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="formData.password" placeholder="请输入密码" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="formData.email" placeholder="请输入邮箱" />
          </el-form-item>
          <el-form-item label="qq" prop="qq">
            <el-input v-model="formData.qq" placeholder="请输入qq" />
          </el-form-item>
          <el-form-item label="地址" prop="address">
            <el-input
              v-model="formData.address"
              :rows="2"
              type="textarea"
              placeholder="请输入地址"
            />
          </el-form-item>
        </el-card>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 客户分配弹窗 -->
    <el-dialog
      v-model="appiontDialog.visible"
      title="分配客户"
      width="450px"
      @close="handleCloseAppiontDialog"
    >
      <el-form ref="dataAppiontFormRef" :model="formAppiontData" label-width="100px">
        <el-card shadow="never">
          <el-form-item label="销售员" prop="user">
            <el-select v-model="formAppiontData.salerId">
              <el-option
                v-for="(saler, index) in salerList"
                :key="index"
                :label="saler.username"
                :value="saler.id"
              />
            </el-select>
          </el-form-item>
        </el-card>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmitAppiontClick">确 定</el-button>
          <el-button @click="handleCloseAppiontDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import BaseTable from "@/components/BaseTable/index.vue";
defineOptions({
  name: "Dict",
  inherititems: false,
});

import ClientAPI, { ClientPageQuery, ClientPageVO, ClientForm } from "@/api/crm/client.api";

import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { useDictStore } from "@/store/modules/dict.store";
import { mapKeys } from "lodash-es";
import UserApi from "@/api/system/user.api";

const queryFormRef = ref();
const dataFormRef = ref();
const dataAppiontFormRef = ref();
const clientTypeMap = ref();
const salerList = ref();

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
  {
    label: "归属销售员",
    prop: "saler",
    minWidth: 100,
    formatter: (saler) => saler?.username || "-",
  },
  { label: "操作", minWidth: 150, slot: "operation", fixed: "right" },
]);

const tableData = ref<ClientPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});
const appiontDialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<ClientForm>({});
const formAppiontData = reactive<ClientForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    clientName: [{ required: true, message: "请输入客户名", trigger: "blur" }],
    clientType: [{ required: true, message: "请选择客户类型", trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;
  const queryString = RequestQueryBuilder.create({
    fields: [
      "id",
      "clientName",
      "username",
      "clientType",
      "phone",
      "qq",
      "email",
      "createdAt",
      "salerId",
      "saler",
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
        { clientType: queryParams.clientType },
      ],
    },
    join: [{ field: "saler" }],
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
  dialog.visible = true;
  dialog.title = "新增客户";
}

/**
 * 客户分配/取消分配给销售员
 *
 * @param row
 */
function handleAppointClick(row) {
  // 取消分配销售员
  if (row.salerId) {
    ElMessageBox.confirm(`确认取消分配给${row.saler.username}?`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(
      () => {
        loading.value = true;
        ClientAPI.updateOne(row.id, { saler: null })
          .then(() => {
            ElMessage.success("取消成功");
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      },
      () => {
        ElMessage.info("未取消分配");
      }
    );
  } else {
    // 分配销售员
    appiontDialog.visible = true;
    formAppiontData.id = row.id;
  }
}

/**
 * 编辑客户
 *
 * @param id 客户ID
 */
function handleEditClick(id: number) {
  dialog.visible = true;
  dialog.title = "修改客户";
  ClientAPI.getOne(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交分配
function handleSubmitAppiontClick() {
  loading.value = true;
  ClientAPI.updateOne(formAppiontData.id, formAppiontData)
    .then(() => {
      ElMessage.success("分配成功");
      handleCloseAppiontDialog();
      handleQuery();
    })
    .finally(() => (loading.value = false));
}

// 提交表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        ClientAPI.updateOne(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        ClientAPI.createOne(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 关闭客户分配弹窗
function handleCloseAppiontDialog() {
  appiontDialog.visible = false;

  dataAppiontFormRef.value.resetFields();
  dataAppiontFormRef.value.clearValidate();

  formAppiontData.id = undefined;
}

// 关闭客户弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
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

  salerList.value = await UserApi.getSalers();
}

onMounted(async () => {
  await loadDictItems();
  await handleQuery();
});
</script>
