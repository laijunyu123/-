<template>
  <div>
    <!-- 三级分类全局组件 -->
    <Category :scene="scene" />
    <el-card style="margin: 10px 0">
      <div v-show="scene === 0">
        <el-button
          type="primary"
          size="default"
          icon="Plus"
          :disabled="!categoryStore.c3Id"
          @click="addAttr"
        >
          添加平台属性
        </el-button>
        <el-table border style="margin: 10px 0" :data="attrArr">
          <el-table-column
            label="序号"
            type="index"
            align="center"
            width="80px"
          ></el-table-column>
          <el-table-column
            label="属性名称"
            width="150px"
            prop="attrName"
          ></el-table-column>
          <el-table-column label="属性值名称">
            <template v-slot="{ row, $index }">
              <el-tag
                style="margin: 5px"
                v-for="(item, index) in row.attrValueList"
                :key="item.id"
              >
                {{ item.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150px">
            <!-- row:已有的属性对象 -->
            <template #="{ row, $index }">
              <!-- 修改已有属性的按钮 -->
              <el-button
                type="primary"
                icon="Edit"
                size="small"
                @click="updateAttr(row)"
              ></el-button>
              <el-popconfirm
                :title="`确定要删除${row.attrName}?`"
                @confirm="deleteAttr(row.id)"
              >
                <template #reference>
                  <el-button
                    type="primary"
                    icon="Delete"
                    size="small"
                  ></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-show="scene === 1">
        <!-- 展示添加属性与修改属性的结构 -->
        <el-form :inline="true">
          <el-form-item label="属性名称">
            <el-input
              placeholder="请输入属性名称"
              v-model="attrParams.attrName"
            ></el-input>
          </el-form-item>
        </el-form>
        <el-button
          @click="addAttrValue"
          :disabled="!attrParams.attrName"
          type="primary"
          icon="Plus"
        >
          添加属性值
        </el-button>
        <el-button type="primary" @click="cancel">取消</el-button>
        <el-table
          border
          style="margin: 10px 0"
          :data="attrParams.attrValueList"
        >
          <el-table-column
            label="序号"
            type="index"
            width="80px"
            align="center"
          ></el-table-column>
          <el-table-column label="属性值">
            <!-- row:即为当前的属性值对象 -->
            <template v-slot="{ row, $index }">
              <el-input
                v-if="row.flag"
                @blur="toLook(row, $index)"
                placeholder="请你输入属性值"
                v-model="row.valueName"
                size="small"
                :ref="(vc:any)=>inputArr[$index] = vc"
              ></el-input>
              <div v-else @click="toEdit(row, $index)">{{ row.valueName }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template v-slot="{ row, $index }">
              <el-button
                type="primary"
                icon="Delete"
                size="small"
                @click="attrParams.attrValueList.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          type="primary"
          @click="save"
          :disabled="attrParams.attrValueList.length <= 0"
        >
          保存
        </el-button>
        <el-button type="primary" @click="cancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 组合式 API 函数 watch
import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
// 引入获取已有属性与属性值接口
import { reqAddOrUpdateAttr, reqAttr } from '@/api/product/attr';
import type {
  Attr,
  AttrResponseData,
  AttrValue,
} from '@/api/product/attr/type';
// 获取分类仓库
import useCategoryStore from '@/store/modules/category';
import { ElMessage } from 'element-plus';
import { reqRemoveAttr } from '@/api/user';
let categoryStore = useCategoryStore();
// 存储已有的属性与属性值
let attrArr = ref<Attr[]>([]);
// 定义卡片组件内容切换变量
let scene = ref<number>(0); // scene = 0 展示 table,scene = 1,展示添加与修改结构
// 收集新增的属性的数据
let attrParams = reactive<Attr>({
  attrName: '', // 新增属性的名字
  attrValueList: [], // 新增的属性值数组
  categoryId: '', // 三级分类ID
  categoryLevel: 3, // 代表的是三级分类
});
// 准备一个数组，将来存储对应组件实例 el-input
let inputArr = ref<any>([]);

// 监听仓库三级分类id变化
watch(
  () => categoryStore.c3Id,
  () => {
    // 清空上一次查询的属性与属性值
    attrArr.value = [];
    // 保证三级分类有才发请求
    if (!categoryStore.c3Id) return;
    getAttr();
  },
);
// 获取已有的属性与属性值方法
const getAttr = async () => {
  // 获取分类的id
  const { c1Id, c2Id, c3Id } = categoryStore;
  // 获取分类下的属性与属性值
  let result: AttrResponseData = await reqAttr(c1Id, c2Id, c3Id);
  if (result.code === 200) {
    attrArr.value = result.data;
  }
};
// 添加品牌属性按钮回调
const addAttr = () => {
  // 每一次点击的时候,先清空一下数据再收集数据
  Object.assign(attrParams, {
    attrName: '',
    attrValueList: [],
    // 顺便,收集新增属性的三级分类的ID
    categoryId: categoryStore.c3Id,
    categoryLevel: 3,
  });
  // 切换为添加与修改的结构
  scene.value = 1;
};
// table 表格修改品牌属性按钮回调
const updateAttr = (row: Attr) => {
  // 切换为显示
  scene.value = 1;
  // 将已有的属性对象赋值给 attrParams 对象
  // ES6 -> Object.assign进行对象的合并
  Object.assign(attrParams, JSON.parse(JSON.stringify(row)));
};
// 取消按钮的回调
const cancel = () => {
  scene.value = 0;
};
// 添加属性值按钮的回调
const addAttrValue = () => {
  // 点击添加属性值按钮的时候，向数组添加一个属性值对象
  attrParams.attrValueList.push({
    valueName: '',
    flag: true, // 控制每一个属性值编辑模式与切换模式的切换
  });
  // 获取最后el-input:组件聚焦
  nextTick(() => {
    inputArr.value[inputArr.value.length - 1].focus();
  });
};
// 保存按钮的回调
const save = async () => {
  // 发请求
  let result: any = await reqAddOrUpdateAttr(attrParams);
  // 添加属性或者修改已有属性成功
  if (result.code === 200) {
    // 切换场景
    scene.value = 0;
    // 提示信息
    ElMessage.success(attrParams.id ? '修改属性成功!' : '添加属性成功!');
    // 获取全部已有的属性或属性值
    getAttr();
  } else {
    ElMessage.error(attrParams.id ? '修改属性修改!' : '添加属性修改!');
  }
};
// 属性值表单元素失去焦点是的回调
const toLook = (row: AttrValue, $index: number) => {
  // 非法情况判断1
  if (row.valueName.trim() === '') {
    // 删除掉对应属性为空的元素
    attrParams.attrValueList.splice($index, 1);
    ElMessage.error('属性值不能为空!');
    return;
  }
  // 非法情况判断2
  let repeat = attrParams.attrValueList.find((item: any) => {
    // 切记把当前失去焦点的属性值对象从当前数组抛除判断
    if (item !== row) {
      return item.valueName === row.valueName;
    }
  });
  if (repeat) {
    // 将重复的属性值从数组中干掉
    attrParams.attrValueList.splice($index, 1);
    // 提示信息
    ElMessage.error('属性值不能重复!');
    return;
  }
  // 相应到的属性值的 flag 标签变为false,展示 div
  row.flag = false;
};
// 属性值 div 点击事件
const toEdit = (row: AttrValue, $index: number) => {
  // 相应到的属性值的 flag 标签变为true,展示 input
  row.flag = true;
  // nextTick:响应式数据发生变化，获取更新的DOM(组件实例)
  nextTick(() => {
    inputArr.value[$index].focus();
  });
};
// 删除某一个己有的属性方法回调
const deleteAttr = async (attrId: number) => {
  // 发相应的删除己有的属性的请求
  let result: any = await reqRemoveAttr(attrId);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    // 获取己有的属性与属性值
    getAttr();
  } else {
    ElMessage.error('删除失败！');
  }
};
// 路由组件销毁的时候，把仓库分类相关的数据清空
onBeforeUnmount(() => {
  // 清空仓库的数据
  categoryStore.$reset();
});
</script>

<style scoped lang="scss"></style>
