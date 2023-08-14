<script lang="ts">
export default {
  name: 'Breadcrumb',
};
</script>
<template>
  <!-- 顶部左侧静态 -->
  <el-icon style="margin-right: 10px" @click="changeIcon">
    <component :is="LayOutSettingStore.fold ? 'Fold' : 'Expand'"></component>
  </el-icon>
  <!-- 左侧面包屑 -->
  <el-breadcrumb separator-icon="ArrowRight">
    <!-- 需要动态展示路由的名字与标题 -->
    <el-breadcrumb-item
      v-for="(item, index) in $route.matched"
      :key="index"
      v-show="item.meta.title"
      :to="item.path"
    >
      <!-- 图标 -->
      <el-icon>
        <component :is="item.meta.icon"></component>
      </el-icon>
      <!-- 面包屑展示对应路由的标题 -->
      <span style="margin: 0 5px">{{ item.meta.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import useLayOutSettingStore from '@/store/modules/setting';
import { useRoute } from 'vue-router';
// 获取 layout 配置相关的仓库
let LayOutSettingStore = useLayOutSettingStore();
// 获取路由对象
let $route = useRoute();

// 点击图标的方法
const changeIcon = () => {
  // 图标进行切换
  LayOutSettingStore.fold = !LayOutSettingStore.fold;
};
</script>

<style scoped lang="scss"></style>
