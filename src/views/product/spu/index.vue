<template>
  <div>
    <!-- 三级分类 -->
    <Category :scene="scene"></Category>
    <el-card style="margin: 10px 0">
      <!-- v-if |v-show :都可以实现显示与隐藏 -->
      <div v-show="scene === 0">
        <el-button
          @click="addSpu"
          type="primary"
          icon="Plus"
          size="default"
          :disabled="!categoryStore.c3Id"
        >
          添加SPU
        </el-button>
        <!-- 展示已有的 SPU 数据 -->
        <el-table border style="margin: 10px 0" :data="records">
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="80px"
          ></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"></el-table-column>
          <el-table-column
            label="SPU描述"
            prop="description"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="操作">
            <!-- row:即为己有的SPU对象 -->
            <template v-slot="{ row, $index }">
              <el-button
                @click="addSku(row)"
                type="primary"
                icon="Plus"
                size="small"
                title="添加SPU"
              ></el-button>
              <el-button
                @click="updateSpu(row)"
                type="primary"
                icon="Edit"
                size="small"
                title="修改SPU"
              ></el-button>
              <el-button
                @click="findSku(row)"
                type="primary"
                icon="View"
                size="small"
                title="查看SPU"
              ></el-button>
              <el-popconfirm
                :title="`确定删除${row.spuName}吗？`"
                width="200px"
                @confirm="deleteSpu(row)"
              >
                <template #reference>
                  <el-button
                    type="primary"
                    icon="Delete"
                    size="small"
                    title="删除SPU"
                  ></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          :page-sizes="[3, 5, 7, 9]"
          :background="true"
          layout=" prev, pager, next, jumper,->,total, sizes,"
          :total="total"
          @size-change="changeSize"
          @current-change="getHasSpu"
        />
      </div>
      <!-- 添加 SPU|修改 SPU 子组件 -->
      <SpuForm
        ref="spu"
        v-show="scene === 1"
        @changeScent="changeScene"
      ></SpuForm>
      <!-- 添加 SKU 的子组件 -->
      <SkuForm
        ref="sku"
        v-show="scene === 2"
        @changeScene="changeScene"
      ></SkuForm>
      <!-- dialog 对话框：展示已有的SKU数据 -->
      <el-dialog v-model="show" title="SKU列表">
        <el-table border :data="skuArr">
          <el-table-column label="SKU名字" prop="skuName"></el-table-column>
          <el-table-column label="SKU价格" prop="price"></el-table-column>
          <el-table-column label="SKU重量" prop="weight"></el-table-column>
          <el-table-column label="SKU图片">
            <template v-slot="{ row, $index }">
              <img
                :src="row.skuDefaultImg"
                style="width: 100px; height: 100px"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type {
  HasSpuResponseData,
  Records,
  SkuData,
  skuInfoData,
  SpuData,
} from '@/api/product/spu/type';
import { onBeforeUnmount, ref, watch } from 'vue';
import { reqHasSpu, reqRemoveSpu, reqSkuList } from '@/api/product/spu';
// 引入子组件
import SpuForm from './spuForm.vue';
import SkuForm from './skuForm.vue';
// 引入分类的仓库
import useCategoryStore from '@/store/modules/category';
import { ElMessage } from 'element-plus';

let categoryStore = useCategoryStore();

//场景数据
let scene = ref<number>(0); // 0:显示已有的SPU 1:添加或者修改已有 SPU  2:添加 SKU 的结构

// 分页器默认页码
let pageNo = ref<number>(1);
// 每一页展示几条数据
let pageSize = ref<number>(3);
// 存储已有的SPU的数据
let records = ref<Records>([]);
// 存储已有SPU总个数
let total = ref<number>(0);
// 获取子组件实例SpuForm
let spu = ref<any>();
// 获取子组件实例SkuForm
let sku = ref<any>();
// 存储全部的 SKU 数据
let skuArr = ref<SkuData[]>([]);
let show = ref<boolean>(false);
// 监听三级分类 ID
watch(
  () => categoryStore.c3Id,
  () => {
    // 务必保证有三级分类ID
    if (!categoryStore.c3Id) return;
    getHasSpu();
  },
);
// 此方法执行：可以获取某一个三级分类下全部的已有的SPU
const getHasSpu = async (pager = 1) => {
  pageNo.value = pager;
  let result: HasSpuResponseData = await reqHasSpu(
    pageNo.value,
    pageSize.value,
    categoryStore.c3Id,
  );
  if (result.code === 200) {
    records.value = result.data.records;
    total.value = result.data.total;
  }
};
// 分页器下拉菜单发生变化的时候触发
const changeSize = () => {
  getHasSpu();
};
// 添加新的 SPU 按钮的回调
const addSpu = () => {
  // 切换为场景1：添加与修改己有 SPU   结构 -> SpuForm
  scene.value = 1;
  // 点击添加SPU按钮，调用子组件的方法初始化数据
  spu.value.initAddSpu(categoryStore.c3Id);
};
// 修改已有的 SPU 的按钮的回调
const updateSpu = (row: SpuData) => {
  // 切换为场景1：添加与修改己有  SPU   结构 -> SpuForm
  scene.value = 1;
  // 调用子组件实例方法获取完整己有的 SPU 的数据
  spu.value.initHasSpuData(row);
};

// 子组件 SpuForm 绑定自定义事件：目前是让子组件通知父组件切换场景为O
const changeScene = (obj: any) => {
  // 子组件 SpuForm.点击取消变为场景O:展示己有的 SPU
  scene.value = obj.flag;
  if (obj.params === '更新') {
    // 再次获取全部的已有SPU
    // 更新留在当前页
    getHasSpu(pageNo.value);
  } else {
    // 添加留在第一页
    getHasSpu();
  }
};

// 添加SKU按钮的回调
const addSku = (row: SpuData) => {
  // 点击添加SKU按钮切换场景为2
  scene.value = 2;
  // 调用子组件的方法初始化添加SKU的数据
  sku.value.initSkuData(categoryStore.c1Id, categoryStore.c2Id, row);
};
//
const findSku = async (row: SpuData) => {
  let result: skuInfoData = await reqSkuList(row.id as number);
  if (result.code === 200) {
    skuArr.value = result.data;
    // 对话框显示出来
    show.value = true;
  }
};
//
const deleteSpu = async (row: SpuData) => {
  let result = await reqRemoveSpu(row.id as number);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    // 获取剩余的已有的spu属性
    getHasSpu(records.value.length > 1 ? pageNo.value : pageNo.value - 1);
  } else {
    ElMessage.success('删除失败！');
  }
};
// 路由组件销毁前，情况仓库关于分类的数据
onBeforeUnmount(() => {
  categoryStore.$reset();
});
</script>

<style scoped lang="scss"></style>
