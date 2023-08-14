<template>
  <div class="logo" v-if="setting.logoHidden">
    <img :src="setting.logo" alt="图片未加载成功" />
    <p>{{ setting.title }}</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Logo',
};
</script>
<script lang="ts" setup>
// 引入没置标题与 logo 配置文件
import setting from '../../setting.ts';
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $base_menu_logo_height;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 10px;
  img {
    width: 40px;
    height: 40px;
  }
  p {
    font-size: $base_logo_title_fontSize;
    margin-left: 10px;
    white-space: nowrap;
  }
}
</style>
