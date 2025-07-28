<!-- 用户管理 -->
<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :lg="4" :xs="24" class="mb-[12px]">
        <DeptTree v-model="queryParams.deptId" @node-click="handleQuery" />
      </el-col>

      <!-- 用户列表 -->
      <el-col :lg="20" :xs="24">
        <div class="search-bar">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item label="状态" prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="全部"
                clearable
                class="!w-[100px]"
              >
                <el-option label="正常" value="NORMAL" />
                <el-option label="冻结" value="FROZEN" />
              </el-select>
            </el-form-item>

            <el-form-item label="创建时间">
              <el-date-picker
                v-model="queryParams.createdAt"
                :editable="false"
                class="!w-[240px]"
                type="daterange"
                range-separator="~"
                start-placeholder="开始时间"
                end-placeholder="截止时间"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-card shadow="never">
          <div class="flex-x-between mb-10px">
            <div>
              <el-button
                v-hasPerm="['sys:user:add']"
                type="success"
                icon="plus"
                @click="handleOpenDialog()"
              >
                新增
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                :disabled="selectIds.length === 0"
                @click="handleDelete()"
              >
                删除
              </el-button>
            </div>
          </div>
          <BaseTable
            :table-data="tableData"
            :columns="columns"
            :total="total"
            :query-params="queryParams"
            :loading="loading"
            show-selection
            show-operation
            @selection-change="handleSelectionChange"
            @pagination="handleQuery"
            @page-change="handleQuery"
          >
            <template #gender-column="{ row }">
              <el-tag :type="GENDER_MAP[row.gender].tagType">
                {{ GENDER_MAP[row.gender].label }}
              </el-tag>
            </template>
            <template #status-column="{ row }">
              <el-tag :type="row.status == 'NORMAL' ? 'success' : 'info'">
                {{ row.status == "NORMAL" ? "正常" : "冻结" }}
              </el-tag>
            </template>
            <!-- 操作列插槽 -->
            <template #operation="{ row }">
              <el-button
                v-hasPerm="'sys:user:password:reset'"
                type="warning"
                icon="RefreshLeft"
                size="small"
                link
                @click="hancleResetPassword(row)"
              >
                重置密码
              </el-button>
              <el-button
                v-hasPerm="'sys:user:edit'"
                type="primary"
                icon="edit"
                link
                size="small"
                @click="handleOpenDialog(row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-hasPerm="'sys:user:delete'"
                type="danger"
                icon="delete"
                link
                size="small"
                @click="handleDelete(row.id)"
              >
                删除
              </el-button>
            </template>
          </BaseTable>
        </el-card>
      </el-col>
    </el-row>

    <!-- 用户表单 -->
    <el-drawer
      v-model="dialog.visible"
      :title="dialog.title"
      append-to-body
      @close="handleCloseDialog"
    >
      <el-form ref="userFormRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            :disabled="!!formData.id"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item v-if="!formData.id" label="密码" prop="password">
          <el-input v-model="formData.password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="工号" prop="userNo">
          <el-input v-model="formData.userNo" :disabled="true" />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <!-- <Dict v-model="formData.gender" code="gender" /> -->
          <el-select v-model="formData.gender">
            <el-option
              v-for="option in GENDER_OPTIONS"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="formData.status"
            inline-prompt
            active-text="正常"
            inactive-text="冻结"
            :active-value="USER_STATUS_ENUM.NORMAL"
            :inactive-value="USER_STATUS_ENUM.FROZEN"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="handleCloseDialog">取 消</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import BaseTable from "@/components/BaseTable/index.vue";
import UserAPI, { UserForm, UserPageQuery, UserPageVO } from "@/api/system/user.api";

import DeptAPI from "@/api/system/dept.api";
import RoleAPI from "@/api/system/role.api";

import DeptTree from "./components/DeptTree.vue";
import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { GENDER_OPTIONS, GENDER_MAP, USER_STATUS_OPTIONS } from "@/constants";
import { USER_STATUS_ENUM } from "@/enums/system/user.enum";

defineOptions({
  name: "User",
  inheritAttrs: false,
});
const queryFormRef = ref();
const userFormRef = ref();

const queryParams = reactive<UserPageQuery>({
  page: 1,
  limit: 10,
});

// 表格列配置
const columns = reactive([
  { label: "用户名", prop: "username", minWidth: 100 },
  { label: "昵称", prop: "nickname", minWidth: 150 },
  { label: "工号", prop: "userNo", minWidth: 80 },
  { label: "性别", prop: "gender", minWidth: 80, slot: "gender-column" },
  { label: "部门", prop: "dept", minWidth: 100, formatter: (dept) => dept?.name || "-" },
  { label: "手机号码", prop: "phone", minWidth: 150 },
  { label: "邮箱", prop: "email", minWidth: 150 },
  { label: "状态", prop: "status", minWidth: 80, slot: "status-column" },
]);

const tableData = ref<UserPageVO[]>();
const total = ref(0);
const loading = ref(false);

const dialog = reactive({
  visible: false,
  title: "新增用户",
});

const formData = reactive<UserForm>({
  status: USER_STATUS_ENUM.NORMAL,
});

const rules = reactive({
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  nickname: [{ required: true, message: "用户昵称不能为空", trigger: "blur" }],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
  deptId: [{ required: true, message: "所属部门不能为空", trigger: "blur" }],
  roleIds: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
  email: [
    {
      pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
      message: "请输入正确的邮箱地址",
      trigger: "blur",
    },
  ],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: "请输入正确的手机号码",
      trigger: "blur",
    },
  ],
});

// 选中的用户ID
const selectIds = ref<number[]>([]);
// 部门下拉数据源
const deptOptions = ref<OptionType[]>();
// 角色下拉数据源
const roleOptions = ref<OptionType[]>();

// 查询
async function handleQuery() {
  loading.value = true;

  const depts = await DeptAPI.getChildren(queryParams.deptId || 1);
  const deptIds = depts.map((m) => Number(m.id));

  const queryString = RequestQueryBuilder.create({
    fields: [
      "id",
      "username",
      "nickname",
      "userNo",
      "gender",
      "phone",
      "email",
      "status",
      "createdAt",
    ],
    search: {
      $and: [
        {
          $and: [
            { status: queryParams.status },
            {
              createdAt: {
                $between: queryParams.createdAt
                  ? queryParams.createdAt
                  : ["2025-01-01", "2099-01-01"],
              },
            },
          ],
        },
        {
          $or: [
            { username: { $cont: queryParams.keywords } },
            { nickname: { $cont: queryParams.keywords } },
            { userNo: { $cont: queryParams.keywords } },
            { phone: { $cont: queryParams.keywords } },
          ],
        },
        {
          $and: [{ "dept.id": { $in: deptIds } }],
        },
      ],
    },
    join: [{ field: "dept" }],
    sort: [{ field: "id", order: "DESC" }],
    page: 1,
    limit: 10,
    resetCache: true,
  }).query();

  UserAPI.getPageList<UserPageVO>(queryString)
    .then((response) => {
      console.log(response);
      tableData.value = response.data;
      total.value = response.total;
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

// 选中项发生变化
function handleSelectionChange(selection: any[]) {
  selectIds.value = selection.map((item) => item.id);
}

// 重置密码
function hancleResetPassword(row: UserPageVO) {
  ElMessageBox.prompt("请输入用户【" + row.username + "】的新密码", "重置密码", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
  }).then(
    ({ value }) => {
      if (!value || value.length < 6) {
        ElMessage.warning("密码至少需要6位字符，请重新输入");
        return false;
      }
      UserAPI.resetPassword(row.id, value).then(() => {
        ElMessage.success("密码重置成功，新密码是：" + value);
      });
    },
    () => {
      ElMessage.info("已取消重置密码");
    }
  );
}

/**
 * 打开弹窗
 *
 * @param id 用户ID
 */
async function handleOpenDialog(id?: number) {
  // 加载角色下拉数据源
  roleOptions.value = await RoleAPI.getOptions();
  // 加载部门下拉数据源
  deptOptions.value = await DeptAPI.getFullTree();

  if (id) {
    dialog.title = "修改用户";
    UserAPI.getInfo(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  } else {
    formData.userNo = await UserAPI.getUserNo();
    dialog.title = "新增用户";
  }

  dialog.visible = true;
}

// 关闭弹窗
function handleCloseDialog() {
  dialog.visible = false;
  userFormRef.value.resetFields();
  userFormRef.value.clearValidate();

  formData.id = undefined;
  formData.status = USER_STATUS_ENUM.NORMAL;
}

// 提交用户表单（防抖）
const handleSubmit = useDebounceFn(() => {
  userFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const userId = formData.id;
      loading.value = true;
      if (userId) {
        UserAPI.update(userId, formData)
          .then(() => {
            ElMessage.success("修改用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        UserAPI.create(formData)
          .then(() => {
            ElMessage.success("新增用户成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}, 1000);

/**
 * 删除用户
 *
 * @param id  用户ID
 */
function handleDelete(id?: number) {
  const userIds = id ? [id] : selectIds.value;
  if (!userIds.length) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除用户?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    function () {
      loading.value = true;
      UserAPI.deleteByIds(userIds)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    function () {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
