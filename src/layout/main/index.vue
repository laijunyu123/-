<template>
  <!-- 路由组件出口位置 -->
  <router-view v-slot="{ Component }">
    <transition name="fade">
      <!-- 渲染layout 一级路由组件的子路由 -->
      <component :is="Component" v-if="flag" />
    </transition>
  </router-view>
</template>

<script lang="ts">
export default {
  name: 'Main',
};
</script>

<script setup lang="ts">
import useLayOutSettingStore from '@/store/modules/setting';
import { ref, watch, nextTick } from 'vue';
let LayOutSettingStore = useLayOutSettingStore();

// 控制当前组件是否销毁重建
let flag = ref(true);
// 监听仓库内部数据是否发生改变，如果发生变化，说明用户点击过刷新按钮
watch(
  () => LayOutSettingStore.refsh,
  () => {
    // 点击刷新按钮路由组件需要销毁
    flag.value = false;
    nextTick(() => {
      flag.value = true;
    });
  },
);
</script>

<style scoped lang="scss">
.fade-enter-from {
  opacity: 0;
  transform: scale(0);
}
.fade-enter-active {
  transition: 0.5s;
}
.fade-enter-to {
  opacity: 1;
  transform: scale(1);
}
</style>
