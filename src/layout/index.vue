<template>
  <div class="layout_container">
    <!-- 左侧菜单 -->
    <div class="layout_slider" :class="{ fold: LayOutSettingStore.fold }">
      <Logo></Logo>
      <!-- 展示菜单 -->
      <!-- 滚动组件 -->
      <el-scrollbar class="scrollbar">
        <!-- 菜单组件 -->
        <el-menu
          :collapse="LayOutSettingStore.fold"
          :default-active="$route.path"
          background-color="#001529"
          text-color="white"
          active-text-color="yellowgreen"
        >
          <!-- 根据路由动态生成菜单 -->
          <Menu :menuList="userStore.menuRoutes"></Menu>
        </el-menu>
      </el-scrollbar>
    </div>
    <!-- 顶部导航 -->
    <div class="layout_tabber" :class="{ fold: LayOutSettingStore.fold }">
      <!-- layout 组件的顶部导航 tabbar -->
      <Tabbar></Tabbar>
    </div>
    <!-- 内容展示区 -->
    <div class="layout_main" :class="{ fold: LayOutSettingStore.fold }">
      <Main></Main>
    </div>
  </div>
</template>
<script lang="ts">
export default {
  name: 'Layout',
};
</script>
<script lang="ts" setup>
// 获取路由路由对象
import { useRoute } from 'vue-router';
// 右侧内容展示区
import Main from '@/layout/main/index.vue';
//引入左侧单 logo 子组件
import Logo from '@/layout/logo/index.vue';
// 引入顶部 tabbar 组件
import Tabbar from '@/layout/tabbar/index.vue';
// 引入菜单组件
import Menu from '@/layout/menu/index.vue';

import useUserStore from '@/store/modules/user';
import useLayOutSettingStore from '@/store/modules/setting';
// 获取用户相关的小仓库
let userStore = useUserStore();
// 获取路由对象
let $route = useRoute();

// 获取 layout 配置仓库
let LayOutSettingStore = useLayOutSettingStore();
</script>

<style lang="scss" scoped>
.layout_container {
  width: 100%;
  height: 100vh;

  .layout_slider {
    width: $base_menu_width;
    height: 100vh;
    background-color: $base_menu_background;
    color: white;
    transition: 0.3s;

    .scrollbar {
      width: 100%;
      height: calc(100vh - $base_menu_logo_height);
    }
    &.fold {
      width: $base-menu-min-width;
    }
    .el-menu {
      border-right: none;
    }
  }

  .layout_tabber {
    position: fixed;
    width: calc(100% - $base_menu_width);
    height: $base_tabbar_height;
    top: 0;
    left: $base_menu_width;
    transition: 0.3s;
    &.fold {
      width: calc(100vw - $base_menu_min-width);
      left: $base_menu_min-width;
    }
    .el-menu {
      border-right: none;
    }
  }

  .layout_main {
    position: absolute;
    width: calc(100% - $base_menu_width);
    height: calc(100vh - $base_tabbar_height);
    left: $base_menu_width;
    top: $base_tabbar_height;
    padding: 20px;
    overflow: auto;
    transition: 0.3s;
    &.fold {
      width: calc(100vw - $base_menu_min-width);
      left: $base_menu_min-width;
    }
  }
}
</style>
