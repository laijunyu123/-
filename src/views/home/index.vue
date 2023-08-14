<template>
  <div>
    <el-card>
      <div class="box">
        <img :src="userStore.avatar" class="avatar" />
        <div class="bottom">
          <h3 class="title">{{ getTime() }}好呀 {{ userStore.username }}</h3>
          <p class="subtitle">硅谷甄选运营平台</p>
        </div>
      </div>
    </el-card>
    <div class="bottoms">
      <svg-icon name="welcome" width="600px" height="300px"></svg-icon>
    </div>
  </div>
</template>
<script setup lang="ts">
// 引入用户相关的仓库，获取当前用户的头像
import useUserStore from '@/store/modules/user';
import { getTime } from '@/util/time';
// 获取存储用户信息的仓库对象
let userStore = useUserStore();
</script>
<style scoped lang="scss">
.box {
  display: flex;
  align-items: center;
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }
  .bottom {
    margin-left: 20px;
    .title {
      font-size: 30px;
      font-weight: bold;
      margin-bottom: 20px;
    }
    .subtitle {
      font-style: italic;
      color: skyblue;
    }
  }
}
.bottoms {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
