<!-- 字典 -->
<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="字典名称/编码"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="isActive">
          <el-select
            v-model="queryParams.isActive"
            clearable
            placeholder="全部"
            class="!w-[100px]"
            @keyup.enter="handleQuery"
          >
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
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
        <template #status-column="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? "启用" : "禁用" }}
          </el-tag>
        </template>
        <!-- 操作列插槽 -->
        <template #operation="{ row }">
          <el-button type="primary" link size="small" @click.stop="handleOpenDictData(row)">
            <template #icon>
              <Collection />
            </template>
            字典数据
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

    <!--字典弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-card shadow="never">
          <el-form-item label="字典名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入字典名称" />
          </el-form-item>

          <el-form-item label="字典编码" prop="code">
            <el-input v-model="formData.code" placeholder="请输入字典编码" />
          </el-form-item>

          <el-form-item label="状态" prop="isActive">
            <el-radio-group v-model="formData.isActive">
              <el-radio :value="true">启用</el-radio>
              <el-radio :value="false">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注" prop="desc">
            <el-input v-model="formData.desc" type="textarea" placeholder="请输入备注" />
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
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Dict",
  inherititems: false,
});

import DictAPI, { DictPageQuery, DictPageVO, DictForm } from "@/api/system/dict.api";

import router from "@/router";
import { RequestQueryBuilder } from "@nestjsx/crud-request";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<DictPageQuery>({
  page: 1,
  limit: 10,
});

// 表格列配置
const columns = reactive([
  { label: "字典名称", prop: "name", minWidth: 100 },
  { label: "字典编码", prop: "code", minWidth: 100 },
  { label: "描述", prop: "desc", minWidth: 150 },
  { label: "状态", prop: "isActive", minWidth: 100, slot: "is-active-column" },
  { label: "操作", minWidth: 150, slot: "operation", fixed: "right" },
]);

const tableData = ref<DictPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictForm>({});

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    name: [{ required: true, message: "请输入字典名称", trigger: "blur" }],
    code: [{ required: true, message: "请输入字典编码", trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;

  const queryString = RequestQueryBuilder.create({
    fields: ["id", "code", "name", "desc", "isActive", "createdAt"],
    search: {
      $and: [
        {
          $or: [
            { code: { $cont: queryParams.keywords } },
            { name: { $cont: queryParams.keywords } },
          ],
        },
        { isActive: queryParams.isActive },
      ],
    },
    page: queryParams.page,
    limit: queryParams.limit,
    resetCache: true,
  }).query();

  DictAPI.getPageList<DictPageVO>(queryString)
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

// 新增字典
function handleAddClick() {
  dialog.visible = true;
  dialog.title = "新增字典";
}

/**
 * 修改字典
 *
 * @param id 字典ID
 */
function handleEditClick(id: number) {
  dialog.visible = true;
  dialog.title = "修改字典";
  DictAPI.getOne(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交字典表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        DictAPI.updateOne(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictAPI.createOne(formData)
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

// 关闭字典弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
}
/**
 * 删除字典
 *
 * @param id 字典ID
 */
function handleDelete(id?: number) {
  if (!id) {
    ElMessage.warning("请勾选删除项");
    return;
  }
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      DictAPI.deleteOne(id).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 打开字典项
function handleOpenDictData(row: DictPageVO) {
  router.push({
    path: "/system/dict-item",
    query: { dictCode: row.code, title: "【" + row.name + "】字典数据" },
  });
}

onMounted(() => {
  handleQuery();
});
</script>
