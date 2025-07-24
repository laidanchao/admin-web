<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item prop="keywords" label="关键字">
          <el-input
            v-model="queryParams.keywords"
            placeholder="角色名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-10px">
        <el-button type="success" icon="plus" @click="handleOpenDialog()">新增</el-button>
        <el-button
          type="danger"
          :disabled="selectIds.length === 0"
          icon="delete"
          @click="handleDelete()"
        >
          删除
        </el-button>
      </div>

      <BaseTable
        :table-data="roleList"
        :columns="columns"
        :total="total"
        :query-params="queryParams"
        :loading="loading"
        show-selection
        show-index
        show-operation
        @selection-change="handleSelectionChange"
        @pagination="handleQuery"
        @page-change="handleQuery"
      >
        <!-- 操作列插槽 -->
        <template #operation="{ row }">
          <el-button
            type="primary"
            size="small"
            link
            icon="position"
            @click="handleOpenAssignPermDialog(row)"
          >
            分配权限
          </el-button>
          <el-button type="primary" size="small" link icon="edit" @click="handleOpenDialog(row.id)">
            编辑
          </el-button>
          <el-button type="danger" size="small" link icon="delete" @click="handleDelete(row.id)">
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <!-- 角色表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="roleFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="角色编码" prop="code">
          <el-input
            v-model="formData.code"
            :disabled="!!formData.id"
            placeholder="请输入角色编码"
          />
        </el-form-item>

        <el-form-item label="角色描述" prop="description">
          <el-input v-model="formData.description" placeholder="请输入角色描述" />
        </el-form-item>

        <!-- <el-form-item label="数据权限" prop="dataScope">
          <el-select v-model="formData.dataScope">
            <el-option :key="1" label="全部数据" :value="1" />
            <el-option :key="2" label="部门及子部门数据" :value="2" />
            <el-option :key="3" label="本部门数据" :value="3" />
            <el-option :key="4" label="本人数据" :value="4" />
          </el-select>
        </el-form-item> -->
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-drawer
      v-model="assignPermDialogVisible"
      :title="'【' + checkedRole.name + '】权限分配'"
      size="500"
    >
      <div class="flex-x-between">
        <el-input v-model="permKeywords" clearable class="w-[150px]" placeholder="菜单权限名称">
          <template #prefix>
            <Search />
          </template>
        </el-input>

        <div class="flex-center ml-5">
          <el-button type="primary" size="small" plain @click="togglePermTree">
            <template #icon>
              <Switch />
            </template>
            {{ isExpanded ? "收缩" : "展开" }}
          </el-button>
          <el-checkbox
            v-model="parentChildLinked"
            class="ml-5"
            @change="handleparentChildLinkedChange"
          >
            父子联动
          </el-checkbox>

          <el-tooltip placement="bottom">
            <template #content>
              如果只需勾选菜单权限，不需要勾选子菜单或者按钮权限，请关闭父子联动
            </template>
            <el-icon class="ml-1 color-[--el-color-primary] inline-block cursor-pointer">
              <QuestionFilled />
            </el-icon>
          </el-tooltip>
        </div>
      </div>

      <el-tree
        ref="permTreeRef"
        node-key="value"
        show-checkbox
        :data="menuPermOptions"
        :filter-node-method="handlePermFilter"
        :default-expand-all="true"
        :check-strictly="!parentChildLinked"
        class="mt-5"
      >
        <template #default="{ data }">
          {{ data.label }}
        </template>
      </el-tree>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleAssignPermSubmit">确 定</el-button>
          <el-button @click="assignPermDialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import BaseTable from "@/components/BaseTable/index.vue";

defineOptions({
  name: "Role",
  inheritAttrs: false,
});

import RoleAPI, { RolePageVO, RoleForm, RolePageQuery } from "@/api/system/role.api";
import MenuAPI from "@/api/system/menu.api";
import { RequestQueryBuilder } from "@nestjsx/crud-request";

const queryFormRef = ref();
const roleFormRef = ref();
const permTreeRef = ref();

const loading = ref(false);
const selectIds = ref<number[]>([]);
const total = ref(0);

// 表格列配置
const columns = reactive([
  { label: "角色名称", prop: "name", minWidth: 100 },
  { label: "角色编码", prop: "code", minWidth: 150 },
]);

const queryParams = reactive<RolePageQuery>({
  page: 1,
  limit: 3,
});

// 角色表格数据
const roleList = ref<RolePageVO[]>();
// 菜单权限下拉
const menuPermOptions = ref<OptionType[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});
// 角色表单
const formData = reactive<RoleForm>({ description: "" });

const rules = reactive({
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  dataScope: [{ required: true, message: "请选择数据权限", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "blur" }],
});

// 选中的角色
interface CheckedRole {
  id?: number;
  name?: string;
}
const checkedRole = ref<CheckedRole>({});
const assignPermDialogVisible = ref(false);

const permKeywords = ref("");
const isExpanded = ref(true);

const parentChildLinked = ref(true);

// 查询
function handleQuery() {
  loading.value = true;

  const queryString = RequestQueryBuilder.create({
    fields: ["id", "code", "name", "description", "createdAt"],
    search: {
      $and: [
        {
          $or: [
            { code: { $cont: queryParams.keywords } },
            { name: { $cont: queryParams.keywords } },
            { description: { $cont: queryParams.keywords } },
          ],
        },
      ],
    },
    sort: [{ field: "id", order: "DESC" }],
    page: queryParams.page,
    limit: queryParams.limit,
    resetCache: true,
  }).query();

  RoleAPI.getPageList<RolePageVO>(queryString)
    .then((data) => {
      roleList.value = data.data;
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

// 行复选框选中
function handleSelectionChange(selection: any) {
  selectIds.value = selection.map((item: any) => item.id);
}

// 打开角色弹窗
function handleOpenDialog(roleId?: number) {
  dialog.visible = true;
  if (roleId) {
    dialog.title = "修改角色";
    RoleAPI.getOne(roleId).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增角色";
  }
}

// 提交角色表单
function handleSubmit() {
  roleFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const roleId = formData.id;
      if (roleId) {
        RoleAPI.updateOne(roleId, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        RoleAPI.createOne(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;

  roleFormRef.value.resetFields();
  roleFormRef.value.clearValidate();

  formData.id = undefined;
}

// 删除角色
function handleDelete(id?: number) {
  const roleIds = id ? [id] : selectIds.value;
  if (!roleIds) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      RoleAPI.deleteByIds(roleIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

// 打开分配菜单权限弹窗
async function handleOpenAssignPermDialog(row: RolePageVO) {
  const roleId = row.id;
  if (roleId) {
    assignPermDialogVisible.value = true;
    loading.value = true;

    checkedRole.value.id = roleId;
    checkedRole.value.name = row.name;

    // 获取所有的菜单
    menuPermOptions.value = await MenuAPI.getFullTree();

    // 回显角色已拥有的菜单
    RoleAPI.getMenuIds(roleId)
      .then((data) => {
        const checkedMenuIds = data;
        checkedMenuIds.forEach((menuId) => permTreeRef.value!.setChecked(menuId, true, false));
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 分配菜单权限提交
function handleAssignPermSubmit() {
  const roleId = checkedRole.value.id;
  console.log(roleId, "roleId");
  if (roleId) {
    const checkedMenuIds: number[] = permTreeRef
      .value!.getCheckedNodes(false, true)
      .map((node: any) => node.value);

    loading.value = true;
    RoleAPI.updateRoleMenus(roleId, checkedMenuIds)
      .then(() => {
        ElMessage.success("分配权限成功");
        assignPermDialogVisible.value = false;
        handleResetQuery();
      })
      .finally(() => {
        loading.value = false;
      });
  }
}

// 展开/收缩 菜单权限树
function togglePermTree() {
  isExpanded.value = !isExpanded.value;
  if (permTreeRef.value) {
    Object.values(permTreeRef.value.store.nodesMap).forEach((node: any) => {
      if (isExpanded.value) {
        node.expand();
      } else {
        node.collapse();
      }
    });
  }
}

// 权限筛选
watch(permKeywords, (val) => {
  permTreeRef.value!.filter(val);
});

function handlePermFilter(
  value: string,
  data: {
    [key: string]: any;
  }
) {
  if (!value) return true;
  return data.label.includes(value);
}

// 父子菜单节点是否联动
function handleparentChildLinkedChange(val: any) {
  parentChildLinked.value = val;
}

onMounted(() => {
  handleQuery();
});
</script>
