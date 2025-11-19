<!-- 客户 -->
<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords">
          <el-input
            v-model="queryParams.keywords"
            placeholder="姓名/手机号/身份证号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-select
            v-model="queryParams.city"
            placeholder="请选择"
            style="width: 180px"
            filterable
            clearable
          >
            <el-option v-for="item in cityArray" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务区" prop="serviceArea">
          <el-select
            v-model="queryParams.serviceArea"
            filterable
            clearable
            placeholder="请选择"
            style="width: 180px"
          >
            <el-option v-for="item in areaArray" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态" prop="auditStatus">
          <Dict v-model="queryParams.auditStatus" code="AUDIT_STATUS" style="width: 150px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery()">搜索</el-button>
          <el-button icon="refresh" @click="handleResetQuery()">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-[10px]">
        <el-button
          v-hasPerm="['bigong:feed:export']"
          type="primary"
          icon="download"
          @click="handleExport()"
        >
          导出含图片的excel（速度慢，最好一个一个导）
        </el-button>
        <el-button
          v-hasPerm="['bigong:feed:export']"
          type="warning"
          icon="download"
          @click="handleExport(true)"
        >
          导出只含图片地址的excel（速度极快，但需点击下载图片）
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
        <template #self-img-column="{ row }">
          <el-image
            :src="row.selfImgUrl"
            style="width: 50px; height: 50px"
            :preview-src-list="[row.selfImgUrl]"
            fit="cover"
            show-progress
            :preview-teleported="true"
          ></el-image>
        </template>
        <template #audit-status-column="{ row }">
          <el-tag :type="auditStatusMap[row.auditStatus].tagType">
            {{ auditStatusMap[row.auditStatus].label }}
          </el-tag>
        </template>
        <template #visited-at-column="{ row }">
          {{ row.visitedAt.replace("T", " ").replace("Z", "").replace(".000", "") }}
        </template>
        <!-- 操作列插槽 -->
        <template #operation="{ row }">
          <el-button type="warning" link icon="view" @click.stop="handleViewClick(row)">
            查看
          </el-button>
          <el-button
            type="primary"
            link
            size="small"
            icon="check"
            @click.stop="handleAuditSuccessClick(row)"
          >
            通过
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            icon="close"
            @click.stop="handleAuditFailedClick(row)"
          >
            不通过
          </el-button>
          <el-button
            type="info"
            link
            size="small"
            icon="delete"
            @click.stop="handleDeleteClick(row)"
          >
            删除
          </el-button>
        </template>
      </BaseTable>
    </el-card>

    <FeedDialog ref="feedDialogRef" @refresh="handleQuery" />
  </div>
</template>

<script setup lang="ts">
import BaseTable from "@/components/BaseTable/index.vue";

defineOptions({
  name: "Dict",
  inherititems: false,
});

import FeedAPI, { FeedPageQuery, FeedPageVO } from "@/api/bigong/feed.api";

import { RequestQueryBuilder } from "@nestjsx/crud-request";
import { mapKeys } from "lodash-es";
import { useDictStore } from "@/store";
import FeedDialog from "@/views/bigong/feed/components/feed-dialog.vue";
import { AUDIT_STATUS_ENUM } from "@/enums/bigong/feed.enum";

const queryFormRef = ref();
const auditStatusMap = ref();
const feedDialogRef = ref();
const cityArray = ref([
  "呼和浩特市",
  "包头市",
  "乌海市",
  "赤峰市",
  "呼伦贝尔市",
  "兴安盟",
  "通辽市",
  "锡林郭勒盟",
  "乌兰察布市",
  "鄂尔多斯市",
  "巴彦淖尔市",
  "阿拉善盟",
]);
const areaArray = ref([
  "呼和浩特服务区",
  "哈素海服务区",
  "呼和浩特西服务区",
  "榆林停车区",
  "昭君停车区",
  "大宝山服务区",
  "武松停车区",
  "清水河服务区",
  "哈乐（国省）服务区",
  "沙尔沁停车区",
  "包头服务区",
  "拉僧庙服务区",
  "乌海服务区",
  "美丽河服务区",
  "桥头服务区",
  "乌丹停车区",
  "头分地服务区",
  "樱桃沟服务区",
  "乌珠日停车区",
  "达来诺日服务区",
  "希拉沐沦服务区",
  "公主湖服务区",
  "玛尼罕服务区",
  "安庆服务区",
  "赤峰停车区",
  "牛营子服务区",
  "四十家子停车区",
  "富裕地服务区",
  "旺业甸停车区",
  "响水服务区",
  "大板服务区",
  "召胡图格停车区",
  "将军台服务区",
  "隆昌服务区",
  "天山服务区",
  "后新立服务区",
  "查巴奇停车区",
  "牙哈沟服务区",
  "兴安岭服务区",
  "扎敦河停车区",
  "牙克石服务区",
  "扎泥河服务区",
  "巴彦库仁服务区",
  "西乌珠尔服务区",
  "巴尔虎部落服务区",
  "惠风川停车区",
  "雅尔根楚服务区",
  "音河服务区",
  "向阳峪停车区",
  "诺门罕（国省）停车区",
  "罕达盖（国省）停车区",
  "乌兰哈达停车区",
  "突泉服务区",
  "永安停车区",
  "科右前旗服务区",
  "永合服务区",
  "巴彦扎拉嘎停车区",
  "新林南服务区",
  "树木沟（国省）服务区",
  "吐列毛杜农场（国省）服务区",
  "哈日诺尔（国省）服务区",
  "大石寨（国省）服务区",
  "前好力保（国省）服务区",
  "乌兰敖都（国省）服务区",
  "阿尔山南（国省）服务区",
  "中和（国省）停车区",
  "车勒服务区",
  "博王服务区",
  "伊胡塔停车区",
  "科尔沁服务区",
  "通辽北停车区",
  "花吐古拉服务区",
  "珠日河停车区",
  "荷叶花服务区",
  "巴西服务区",
  "乌兰服务区",
  "通辽停车区",
  "余粮堡服务区",
  "东明服务区",
  "奈曼服务区",
  "白音昌服务区",
  "别日木图（国省）服务区",
  "阿日昆都楞（国省）服务区",
  "齐哈服务区",
  "赛汉塔拉北服务区",
  "锡林服务区",
  "白银服务区",
  "长胜湾服务区",
  "明安图服务区",
  "宝力根陶海服务区",
  "桑根达来服务区",
  "赛音呼都嘎服务区",
  "朱日和停车区",
  "都仁乌力吉服务区",
  "镶黄旗停车区",
  "镶黄旗南服务区",
  "锡林浩特服务区",
  "灰腾河服务区",
  "哈毕日嘎服务区",
  "前房子服务区",
  "炮台营服务区",
  "锡林浩特南服务区",
  "宝日胡硕（国省）服务区",
  "白音淖服务区",
  "黄家村服务区",
  "丰镇服务区",
  "商都西服务区",
  "玻璃忽镜停车区",
  "德包图服务区",
  "化德东停车区",
  "石咀子停车区",
  "兴和服务区",
  "卓资山服务区",
  "集宁东服务区",
  "苏木山服务区",
  "集宁南服务区",
  "十八台服务区",
  "复兴停车区",
  "乌兰花（国省）服务区",
  "天成（国省）服务区",
  "柳青梁停车区",
  "响沙湾服务区",
  "成陵服务区",
  "响沙湾（国省）服务区",
  "白彦花停车区",
  "乌拉山服务区",
  "西小召服务区",
  "临河服务区",
  "临河新服务区",
  "磴口服务区",
  "陕坝停车区",
  "青山服务区",
  "纳林湖服务区",
  "查干停车区",
  "前达门（国省）服务区",
  "狼山（国省）服务区",
  "红古尔玉林服务区",
  "尚丹停车区",
  "乌力吉服务区",
  "苏宏图服务区",
  "呼和包斯格服务区",
  "哈尔苏海服务区",
  "雅于停车区",
  "雅干服务区",
  "天鹅湖停车区",
  "额济纳旗服务区",
  "赛汉陶来服务区",
  "路井停车区",
  "风雷山服务区",
  "黑鹰山停车区",
  "黑鹰山服务区",
]);

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<FeedPageQuery>({
  page: 1,
  limit: 10,
});

// 表格列配置
const columns = reactive([
  { label: "姓名", prop: "realName", minWidth: 80 },
  { label: "身份证", prop: "idNo", minWidth: 120 },
  { label: "手机号", prop: "phone", minWidth: 80 },
  { label: "城市", prop: "city", minWidth: 80 },
  { label: "服务区", prop: "serviceArea", minWidth: 100 },
  { label: "行驶方向", prop: "direction", minWidth: 80 },
  { label: "访查时间", prop: "visitedAt", minWidth: 80, slot: "visited-at-column" },
  { label: "自我验证", prop: "selfImgUrl", minWidth: 120, slot: "self-img-column" },
  { label: "审核状态", prop: "auditStatus", minWidth: 90, slot: "audit-status-column" },
  { label: "创建时间", prop: "createdAt", minWidth: 80 },
  { label: "审核", minWidth: 180, slot: "operation", fixed: "right" },
]);

const tableData = ref<FeedPageVO[]>();

// 查询
function handleQuery() {
  loading.value = true;
  const queryString = RequestQueryBuilder.create({
    fields: [
      "id",
      "realName",
      "idNo",
      "phone",
      "city",
      "serviceArea",
      "direction",
      "selfImgUrl",
      "visitedAt",
      "auditStatus",
      "createdAt",
      "comment",
    ],
    search: {
      $and: [
        {
          $or: [
            { realName: { $cont: queryParams.keywords } },
            { phone: { $cont: queryParams.keywords } },
            { idNo: { $cont: queryParams.keywords } },
          ],
        },
        { auditStatus: queryParams.auditStatus },
        { city: queryParams.city },
        { serviceArea: queryParams.serviceArea },
      ],
    },
    page: queryParams.page,
    limit: queryParams.limit,
    resetCache: true,
  }).query();

  FeedAPI.getPageList<FeedPageVO>(queryString)
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

// 查看数据
function handleViewClick(row) {
  FeedAPI.getDetails(row.id).then((details) => {
    feedDialogRef.value.open(row, details, cityArray.value, areaArray.value);
  });
}

/**
 * 审核通过
 * @param row
 */
function handleAuditSuccessClick(row: any) {
  if (row.id) {
    ElMessageBox.confirm(`确认审核通过吗?`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(
      () => {
        loading.value = true;
        FeedAPI.updateOne(row.id, { auditStatus: AUDIT_STATUS_ENUM.SUCCESS })
          .then(() => {
            ElMessage.success("操作成功");
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      },
      () => {
        ElMessage.info("操作取消");
      }
    );
  }
}

/**
 * 审核不通过
 * @param row
 */
function handleAuditFailedClick(row: any) {
  if (row.id) {
    ElMessageBox.confirm(`确认审核不通过吗?`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(
      () => {
        loading.value = true;
        FeedAPI.updateOne(row.id, { auditStatus: AUDIT_STATUS_ENUM.FAILED })
          .then(() => {
            ElMessage.success("操作成功");
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      },
      () => {
        ElMessage.info("操作取消");
      }
    );
  }
}

/**
 * 删除
 * @param row
 */
function handleDeleteClick(row: any) {
  if (row.id) {
    ElMessageBox.confirm(`确认删除吗?`, "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(
      () => {
        loading.value = true;
        FeedAPI.delete(row.id)
          .then(() => {
            ElMessage.success("删除成功");
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      },
      () => {
        ElMessage.info("取消删除");
      }
    );
  }
}

async function handleExport(onlyUrl = false) {
  loading.value = true;
  queryParams.onlyUrl = onlyUrl;
  const result = await FeedAPI.export(queryParams);

  const blob = new Blob([result.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "export-data.xlsx";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
  loading.value = false;
}

async function loadDictItems() {
  const auditStatusDictItems = await useDictStore().getDictItems("AUDIT_STATUS");
  auditStatusMap.value = mapKeys(auditStatusDictItems, "value");
}

onMounted(async () => {
  await loadDictItems();
  await handleQuery();
});
</script>
