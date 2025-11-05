<template>
  <!--客户信息弹窗-->
  <el-dialog
    v-model="dialog.visible"
    :title="dialog.title"
    width="800px"
    :close-on-click-modal="false"
    @close="handleCloseDialog"
  >
    <!--    <el-form ref="formRef" :model="formData" label-width="100px" inline>-->
    <!--      <el-card shadow="never">-->
    <!--        <el-form-item label="姓名" prop="realName" style="width: 300px">-->
    <!--          <el-input v-model="formData.realName" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="身份证号" prop="idNo" style="width: 300px">-->
    <!--          <el-input v-model="formData.idNo" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="联系电话" prop="phone" style="width: 300px">-->
    <!--          <el-input v-model="formData.phone" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="城市" prop="city">-->
    <!--          <el-select-->
    <!--            v-model="formData.city"-->
    <!--            placeholder="请选择"-->
    <!--            style="width: 200px"-->
    <!--            filterable-->
    <!--            clearable-->
    <!--          >-->
    <!--            <el-option v-for="item in cityArray" :key="item" :label="item" :value="item" />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="服务区" prop="serviceArea">-->
    <!--          <el-select-->
    <!--            v-model="formData.serviceArea"-->
    <!--            filterable-->
    <!--            clearable-->
    <!--            placeholder="请选择"-->
    <!--            style="width: 200px"-->
    <!--          >-->
    <!--            <el-option v-for="item in areaArray" :key="item" :label="item" :value="item" />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="行驶方向" prop="direction">-->
    <!--          <el-select-->
    <!--            v-model="formData.direction"-->
    <!--            placeholder="请选择"-->
    <!--            style="width: 200px"-->
    <!--            filterable-->
    <!--            clearable-->
    <!--          >-->
    <!--            <el-option v-for="item in directionArray" :key="item" :label="item" :value="item" />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="提交时间" style="width: 300px">-->
    <!--          <el-input v-model="formData.createdAt" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="评价" prop="comment" style="width: 600px">-->
    <!--          <el-input v-model="formData.comment" type="textarea" />-->
    <!--        </el-form-item>-->
    <el-table :data="tableData" style="width: 100%" height="600px">
      <el-table-column prop="areaName" label="区域" width="180" />
      <el-table-column prop="locationName" label="位置" width="180" />
      <el-table-column prop="isVideo" label="是否视频" width="180">
        <template #default="{ row }">
          {{ row.isVideo ? "是（点击图片播放）" : "否" }}
        </template>
      </el-table-column>
      <el-table-column prop="fileUrl" label="图片/视频">
        <template #default="{ row }">
          <el-image
            v-if="!row.isVideo"
            :src="row.fileUrl"
            style="width: 150px; height: 150px"
            :preview-src-list="imgList"
            fit="cover"
            show-progress
            :preview-teleported="true"
          ></el-image>
          <el-image
            v-else
            :src="row.coverImgUrl"
            style="width: 150px; height: 150px"
            @click="playVideo(row.fileUrl)"
          ></el-image>
        </template>
      </el-table-column>
    </el-table>
    <!--      </el-card>-->
    <!--    </el-form>-->

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCloseDialog">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { FeedPageVO } from "@/api/bigong/feed.api";

const dialog = reactive({
  title: "查看",
  visible: false,
  disable: true,
});

const formRef = ref();
const formData = ref();
const tableData = ref([]);
const cityArray = ref([]);
const areaArray = ref([]);
const directionArray = ref(["东->西", "西->东", "南->北", "北->南"]);
const imgList = ref([]);

const open = (data: FeedPageVO, details: any[], array1: [], array2: []) => {
  // formData.value = { ...data };
  tableData.value = [...details];
  imgList.value = details.filter((f) => f.fileUrl && !f.isVideo).map((m) => m.fileUrl);
  // cityArray.value = [...array1];
  // areaArray.value = [...array2];
  dialog.visible = true;
};

// 关闭客户弹窗
const handleCloseDialog = () => {
  dialog.visible = false;
  //
  // formRef.value.resetFields();
  // formRef.value.clearValidate();
  //
  // formData.value.id = undefined;
};

const playVideo = (url) => {
  window.open(url, "_blank");
};

defineExpose({
  open,
});
</script>

<style scoped>
.el-form-item__content {
  margin-left: 0px;
}
</style>
