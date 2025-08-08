<template>
  <!--客户信息弹窗-->
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="500px"
    :close-on-click-modal="false"
    @close="handleCloseDialog"
  >
    <el-form ref="formRef" :model="formData" :rules="computedRules" label-width="100px">
      <el-card shadow="never">
        <el-form-item label="客户名" prop="clientName">
          <el-input v-model="formData.clientName" placeholder="请输入客户名" />
        </el-form-item>
        <el-form-item label="客户类型" prop="clientType">
          <Dict
            v-model="formData.clientType"
            code="CLIENT_TYPE"
            :clearable="false"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="客户分级" prop="clientStage">
          <Dict
            v-model="formData.clientStage"
            code="CLIENT_STAGE"
            :clearable="false"
            style="width: 100%"
          />
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
          <el-input v-model="formData.address" :rows="2" type="textarea" placeholder="请输入地址" />
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
</template>

<script setup lang="ts">
import ClientAPI, { ClientForm } from "@/api/crm/client.api";
import { useDictStore } from "@/store";
import { mapKeys } from "lodash-es";

const props = defineProps({
  // 初始表单数据
  initialData: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(["refresh"]);

const dialog = reactive({
  title: "修改客户",
  visible: false,
});

const formRef = ref();
const formData = reactive<ClientForm>({});
const clientTypeMap = ref();

const computedRules = computed(() => {
  const rules: Partial<Record<string, any>> = {
    clientName: [{ required: true, message: "请输入客户名", trigger: "blur" }],
    clientStage: [{ required: true, message: "请选择客户分级", trigger: "blur" }],
    clientType: [{ required: true, message: "请选择客户类型", trigger: "blur" }],
  };
  return rules;
});

const open = (data) => {
  if (data?.id) {
    dialog.title = "修改客户";
    Object.assign(formData, props.initialData, data);
  } else {
    dialog.title = "新增客户";
  }
  dialog.visible = true;
};

// 提交客户表单
const handleSubmitClick = async () => {
  const isValid = await formRef.value.validate();
  if (isValid) {
    const id = formData.id;
    if (id) {
      await ClientAPI.updateOne(id, formData);
      ElMessage.success("修改成功");
    } else {
      await ClientAPI.createOne(formData);
      ElMessage.success("新增成功");
    }

    handleCloseDialog();
    emit("refresh");
  }
};

// 关闭客户弹窗
const handleCloseDialog = () => {
  dialog.visible = false;

  formRef.value.resetFields();
  formRef.value.clearValidate();

  formData.id = undefined;
};

async function loadDictItems() {
  const clientTypeDictItems = await useDictStore().getDictItems("CLIENT_TYPE");
  clientTypeMap.value = mapKeys(clientTypeDictItems, "value");
}

onMounted(async () => {
  await loadDictItems();
});

defineExpose({
  open,
});
</script>
