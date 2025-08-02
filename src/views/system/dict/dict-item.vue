<!-- 字典项 -->
<template>
  <div class="app-container">
    <div class="search-bar mt-5">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="字典标签/字典值"
            clearable
            @keyup.enter="handleQuery"
          />
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
        <template #is-active-column="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">
            {{ row.isActive ? "启用" : "禁用" }}
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

    <!--字典项弹窗-->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="100px">
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="formData.dictCode" placeholder="请输入字典编码" disabled />
        </el-form-item>
        <el-form-item label="字典项名称" prop="itemName">
          <el-input v-model="formData.itemName" placeholder="请输入字典项名称" />
        </el-form-item>
        <el-form-item label="字典项编码" prop="itemCode">
          <el-input v-model="formData.itemCode" placeholder="请输入字典项编码" />
        </el-form-item>
        <el-form-item label="字典项描述" prop="itemDesc">
          <el-input v-model="formData.itemDesc" placeholder="请输入字典项描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.isActive">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <template #label>
            <div class="flex-y-center">
              标签类型
              <el-tooltip>
                <template #content>回显样式，为空时则显示 '文本'</template>
                <el-icon class="ml-1 cursor-pointer">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="formData.tagType"
            placeholder="请选择标签类型"
            clearable
            @clear="formData.tagType = ''"
          >
            <template #label="{ value }">
              <el-tag v-if="value" :type="value">
                {{ formData.itemName ? formData.itemName : "字典项名称" }}
              </el-tag>
            </template>
            <!-- <el-option label="默认文本" value="" /> -->
            <el-option v-for="type in TAG_TYPE_ENUM" :key="type" :label="type" :value="type">
              <div flex-y-center gap-10px>
                <el-tag :type="type">{{ formData.itemName ?? "字典项名称" }}</el-tag>
                <span>{{ type }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
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
  name: "DictItem",
  inherititems: false,
});

import DictItemAPI, {
  DictItemPageQuery,
  DictItemPageVO,
  DictItemForm,
} from "@/api/system/dict-item.api";
import { TAG_TYPE_ENUM } from "@/enums";
import { RequestQueryBuilder } from "@nestjsx/crud-request";

const route = useRoute();

const dictCode = ref(route.query.dictCode as string);

const queryFormRef = ref();

const dataFormRef = ref();

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<DictItemPageQuery>({
  dictCode: dictCode.value,
  page: 1,
  limit: 10,
});

const columns = reactive([
  { label: "字典项名称", prop: "itemName", minWidth: 100 },
  { label: "字典项编码", prop: "itemCode", minWidth: 100 },
  { label: "描述", prop: "itemDesc", minWidth: 150 },
  { label: "状态", prop: "isActive", minWidth: 100, slot: "is-active-column" },
  { label: "操作", minWidth: 150, slot: "operation", fixed: "right" },
]);

const tableData = ref<DictItemPageVO[]>();

const dialog = reactive({
  title: "",
  visible: false,
});

const formData = reactive<DictItemForm>({ dictCode: dictCode.value, isActive: true });

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    itemName: [{ required: true, message: "请输入字典项名称", trigger: "blur" }],
    itemCode: [{ required: true, message: "请输入字典项编码", trigger: "blur" }],
  };
  return rules;
});

// 查询
function handleQuery() {
  loading.value = true;

  const queryString = RequestQueryBuilder.create({
    fields: ["id", "itemCode", "itemName", "itemDesc", "isActive", "createdAt"],
    search: {
      $and: [
        {
          $or: [
            { itemCode: { $cont: queryParams.keywords } },
            { itemName: { $cont: queryParams.keywords } },
          ],
        },
        { isActive: queryParams.isActive },
        { dictCode: queryParams.dictCode },
      ],
    },
    page: queryParams.page,
    limit: queryParams.limit,
    resetCache: true,
  }).query();

  DictItemAPI.getPageList<DictItemPageVO>(queryString)
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
  dialog.title = "新增字典项";
}

// 打开弹窗
function handleEditClick(id: number) {
  dialog.visible = true;
  dialog.title = "修改字典项";
  DictItemAPI.getOne(id).then((data) => {
    Object.assign(formData, data);
  });
}

// 提交表单
function handleSubmitClick() {
  dataFormRef.value.validate((isValid: boolean) => {
    if (isValid) {
      loading.value = true;
      const id = formData.id;
      formData.dictCode = dictCode.value;
      if (id) {
        DictItemAPI.updateOne(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        DictItemAPI.createOne(formData)
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

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;

  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();

  formData.id = undefined;
  formData.isActive = true;
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
      DictItemAPI.deleteOne(id).then(() => {
        ElMessage.success("删除成功");
        handleResetQuery();
      });
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});

// // 同一路由参数变化时更新数据
// onBeforeRouteUpdate((to) => {
//   console.log("to", to.query.code);
//   queryParams.dictCode = to.query.code as string;
//   formData.dictCode = to.query.code as string;
//   handleQuery();
// });
</script>
