<template>
  <div class="tabbar">
    <div class="tabbar_left">
      <Breadcurmb></Breadcurmb>
    </div>
    <div class="tabbar_right">
      <Setting></Setting>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Tabbar',
};
</script>
<script setup lang="ts">
import Breadcurmb from '@/layout/tabbar/breadcrumb/index.vue';
import Setting from '@/layout/tabbar/setting/index.vue';
</script>

<style scoped lang="scss">
.tabbar {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .tabbar_left {
    display: flex;
    align-items: center;
    margin-left: 20px;
  }

  .tabbar_right {
    display: flex;
    align-items: center;
  }
}
</style>
