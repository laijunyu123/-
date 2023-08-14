<template>
  <el-card>
    <el-table border style="margin: 10px 0" :data="skuArr">
      <el-table-column
        type="index"
        label="序号"
        align="center"
        width="80px"
      ></el-table-column>
      <el-table-column
        label="名称"
        prop="skuName"
        show-overflow-tooltip
        width="150px"
      ></el-table-column>
      <el-table-column
        label="描述"
        prop="skuDesc"
        show-overflow-tooltip
        width="150px"
      ></el-table-column>
      <el-table-column label="图片" width="150px">
        <template v-slot="{ row, $index }">
          <img :src="row.skuDefaultImg" style="width: 100px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column
        label="重量（kg）"
        prop="weight"
        width="150px"
      ></el-table-column>
      <el-table-column
        label="价格（元）"
        prop="price"
        width="150px"
      ></el-table-column>
      <el-table-column label="操作" width="350px">
        <template v-slot="{ row, $index }">
          <el-button
            @click="updateSale(row)"
            type="primary"
            size="small"
            :icon="row.isSale === 1 ? 'Bottom' : 'Top'"
          ></el-button>
          <el-button
            type="primary"
            size="small"
            icon="Edit"
            @click="updateSku"
          ></el-button>
          <el-button
            type="primary"
            size="small"
            icon="InfoFilled"
            @click="findSku(row)"
          ></el-button>
          <el-popconfirm
            :title="`确定删除${row.skuName}吗`"
            width="300px"
            icon="Delete"
            @confirm="removeSku(row)"
          >
            <template #reference>
              <el-button type="primary" size="small" icon="Delete"></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="pageNo"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 40]"
      :background="true"
      layout=" prev, pager, next, jumper,->,total, sizes,"
      :total="total"
      @size-change="handler"
      @current-change="getHasSku(pageNo)"
    />
    <!-- 抽屉组件：展示商品详情 -->
    <el-drawer v-model="drawer">
      <!-- 标题部分 -->
      <template #header>
        <h4>查看商品详情</h4>
      </template>
      <template #default>
        <el-row style="margin: 10px 0">
          <el-col :span="6">名称</el-col>
          <el-col :span="18">{{ skuInfo.skuName }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">描述</el-col>
          <el-col :span="18">{{ skuInfo.skuDesc }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">价格</el-col>
          <el-col :span="18">{{ skuInfo.price }}</el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">平台属性</el-col>
          <el-col :span="18">
            <el-tag
              style="margin: 5px 5px"
              v-for="(item, index) in skuInfo.skuAttrValueList"
              :key="item.id"
            >
              {{ item.valueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">销售属性</el-col>
          <el-col :span="18">
            <el-tag
              style="margin: 5px 5px"
              v-for="(item, index) in skuInfo.skuSaleAttrValueList"
              :key="item.id"
            >
              {{ item.saleAttrValueName }}
            </el-tag>
          </el-col>
        </el-row>
        <el-row style="margin: 10px 0">
          <el-col :span="6">商品图片</el-col>
          <el-col :span="18">
            <el-carousel
              :interval="4000"
              type="card"
              height="200px"
              trigger="click"
            >
              <el-carousel-item
                v-for="(item, index) in skuInfo.skuImageList"
                :key="item.id"
              >
                <img
                  :src="item.imgUrl"
                  alt="图片不在了"
                  style="width: 100%; height: 100%"
                />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </template>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  reqCancelSale,
  reqRemoveSku,
  reqSaleSku,
  reqSkuInfo,
  reqSkuList,
} from '@/api/product/sku';
import type {
  SkuData,
  SkuInfoData,
  SkuResponseData,
} from '@/api/product/sku/type';
import { ElMessage } from 'element-plus';
// 分页器当前页面
let pageNo = ref<number>(1);
// 每页展示多少条数据
let pageSize = ref<number>(10);
let total = ref<number>(0);
let skuArr = ref<SkuData[]>([]);
// 控制抽屉显示与隐藏的字段
let drawer = ref<boolean>(false);
let skuInfo = ref<any>({});
// 组件挂载完毕
onMounted(() => {
  getHasSku();
});
//
const getHasSku = async (pager = 1) => {
  // 当前分页器的页码
  pageNo.value = pager;
  let result: SkuResponseData = await reqSkuList(pageNo.value, pageSize.value);
  if (result.code === 200) {
    total.value = result.data.total;
    skuArr.value = result.data.records;
  }
};
// 分页器下拉菜单发生变化触发
const handler = () => {
  getHasSku();
};
//
const updateSale = async (row: SkuData) => {
  // 如果当前商品的 isSale === 1 ,说明当前商品是上架的状态 -> 更新为下架
  // 否则 else 情况与上面情况相反
  if (row.isSale === 1) {
    await reqSaleSku(row.id as number);
    ElMessage.success('下架成功！');
    // 发请求获取当前更新完毕的全部已有的 SKU
    getHasSku(pageNo.value);
  } else {
    await reqCancelSale(row.id as number);
    ElMessage.success('上架成功！');
    getHasSku(pageNo.value);
  }
};
// 更新已有的 SKU
const updateSku = () => {
  ElMessage.success('正在研发中！');
};
// 查看商品详情按钮的回调
const findSku = async (row: SkuData) => {
  // 抽屉展示出来
  drawer.value = true;
  // 获取已有的商品详情的数据
  let result: SkuInfoData = await reqSkuInfo(row.id as number);
  // 存储已有的 SKU
  if (result.code === 200) {
    skuInfo.value = result.data;
  }
};
// 删除某一个已有的商品
const removeSku = async (row: SkuData) => {
  // 删除某一个已有商品的情况
  let result: any = await reqRemoveSku(row.id as number);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    getHasSku(skuArr.value.length > 1 ? pageNo.value : pageNo.value - 1);
  } else {
    ElMessage.error('删除失败！');
  }
};
</script>
<style scoped>
.el-carousel__item h3 {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
  background-color: #d3dce6;
}
</style>
<style scoped lang="scss"></style>
