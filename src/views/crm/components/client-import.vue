<template>
  <div>
    <el-dialog
      v-model="visible"
      :align-center="true"
      title="导入数据"
      width="600px"
      @close="handleClose"
    >
      <el-scrollbar max-height="60vh">
        <el-form
          ref="importFormRef"
          label-width="auto"
          style="padding-right: var(--el-dialog-padding-primary)"
          :model="importFormData"
          :rules="importFormRules"
        >
          <el-form-item label="文件名" prop="files">
            <el-upload
              ref="uploadRef"
              v-model:file-list="importFormData.files"
              class="w-full"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
              :drag="true"
              :limit="1"
              :auto-upload="false"
              :on-exceed="handleFileExceed"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或
                <em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  格式为*.xlsx / *.xls / *.csv，文件不超过一个
                  <el-link
                    type="primary"
                    icon="download"
                    :underline="false"
                    @click="handleDownloadTemplate"
                  >
                    下载模板
                  </el-link>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <div style="padding-right: var(--el-dialog-padding-primary)">
          <el-button v-if="resultData.length > 0" type="primary" @click="handleShowResult">
            错误信息
          </el-button>
          <el-button
            type="primary"
            :disabled="importFormData.files.length === 0"
            @click="handleUpload"
          >
            确 定
          </el-button>
          <el-button @click="handleClose">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="resultVisible" title="导入结果" width="600px">
      <el-alert
        :title="`导入结果：${invalidCount}条失败，${validCount}条成功`"
        type="warning"
        :closable="false"
      />
      <el-table :data="resultData" style="width: 100%; max-height: 400px">
        <el-table-column prop="index" align="center" width="100" type="index" label="序号" />
        <el-table-column prop="message" label="错误信息" width="400">
          <template #default="scope">
            {{ scope.row }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseResult">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage, type UploadUserFile } from "element-plus";
import ClientAPI from "@/api/crm/client.api";
import FileAPI from "@/api/file.api";

const emit = defineEmits(["import-success"]);
const visible = defineModel("modelValue", {
  type: Boolean,
  required: true,
  default: false,
});

const resultVisible = ref(false);
const resultData = ref<string[]>([]);
const invalidCount = ref(0);
const validCount = ref(0);

const importFormRef = ref(null);
const uploadRef = ref(null);

const importFormData = reactive<{
  files: UploadUserFile[];
}>({
  files: [],
});

watch(visible, (newValue) => {
  if (newValue) {
    resultData.value = [];
    resultVisible.value = false;
    invalidCount.value = 0;
    validCount.value = 0;
  }
});

const importFormRules = {
  files: [{ required: true, message: "文件不能为空", trigger: "blur" }],
};

// 文件超出个数限制
const handleFileExceed = () => {
  ElMessage.warning("只能上传一个文件");
};

// 下载导入模板
const handleDownloadTemplate = () => {
  FileAPI.getClientTemplate().then((response: string) => {
    const downloadUrl = response;
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();

    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(downloadUrl);
  });
};

// 上传文件
const handleUpload = async () => {
  if (!importFormData.files.length) {
    ElMessage.warning("请选择文件");
    return;
  }

  const result = await ClientAPI.import(importFormData.files[0].raw as File);
  if (result.errorCount === 0) {
    ElMessage.success("导入成功，导入数据：" + result.successCount + "条");
    emit("import-success");
    handleClose();
  } else {
    ElMessage.error("上传失败");
    resultVisible.value = true;
    resultData.value = result.errorMessageArray;
    invalidCount.value = result.errorCount;
    validCount.value = result.successCount;
  }
};

// 显示错误信息
const handleShowResult = () => {
  resultVisible.value = true;
};

// 关闭错误信息弹窗
const handleCloseResult = () => {
  resultVisible.value = false;
};

// 关闭弹窗
const handleClose = () => {
  importFormData.files.length = 0;
  visible.value = false;
};
</script>
