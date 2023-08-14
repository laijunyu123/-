<template>
  <!-- svg:图标外层的容器节点，内部需要与 use 标签结合使用 -->
  <svg :style="{ width, height }">
    <!-- xlink:href 指定用哪一个图标 -->
    <!-- use 标签的 fill 属性可以设置图标的颜色 -->
    <use :xlink:href="prefix + name" :fill="color"></use>
  </svg>
</template>
<script setup lang="ts">
import {} from 'vue';
// 接收父组件传递过来的参数
defineProps({
  // xlink:href 属性的前缀
  prefix: {
    type: String,
    default: '#icon-',
  },
  // 提供使用的图标的名字
  name: String,
  // 接收父组件传递的颜色
  color: {
    type: String,
    default: '',
  },
  // 接收父组件传递过来的图标的宽度
  width: {
    type: String,
    default: '16px',
  },
  // 接收父组件传递过来的图标的高度
  height: {
    type: String,
    default: '16px',
  },
});
</script>
<style scoped lang="css"></style>
