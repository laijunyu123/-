<template>
  <div class="login_container">
    <el-row>
      <el-col :span="12" :xs="0"></el-col>
      <el-col :span="12" :xs="24">
        <!-- 登录的表单 -->
        <el-form
          ref="loginForms"
          :model="loginForm"
          :rules="rules"
          class="login_form"
        >
          <h1>Hello</h1>
          <h2>欢迎来到硅谷甄选</h2>
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :prefix-icon="User"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :prefix-icon="Lock"
              :show-password="true"
              type="password"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              :loading="loading"
              class="login_btn"
              type="primary"
              @click="login"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script lang="ts" setup>
import { User, Lock } from '@element-plus/icons-vue';
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// 引入获取当前时间的函数
import { getTime } from '@/util/time';
// 引入用户相关的小仓库
import useUserStore from '@/store/modules/user';
import { ElNotification } from 'element-plus';

let useStore = useUserStore();
// 获取 el-from 组件
let loginForms = ref();

// 获取路由器
let $router = useRouter();
// 获取路由对象
let $route = useRoute();

// 定义变量控制按钮加载效果
let loading = ref(false);
// 收集账号与密码的数据
let loginForm = reactive({
  username: 'admin',
  password: 'atguigu123',
});
// 登录按钮的回调
const login = async () => {
  // 保证全部表单相验通过再发请求
  await loginForms.value.validate();

  // 加载效果：开始加载
  loading.value = true;
  // 通知仓库发登录请求
  // 请求成功->首页展示数据的地方
  // 请求失败->弹出登录错误信息
  try {
    // 保证登录成功
    await useStore.userLogin(loginForm);
    // 编程式导航跳转到展示数据首页
    // 判断登录的时候，路由路径当中是否有 query 参数，如果有就往 query 参数跳，没有跳转到首页
    let redirect: any = $route.query.redirect;
    $router.push({
      path: redirect || '/',
    });
    // 登录成功提示信息
    ElNotification({
      type: 'success',
      message: '登录成功',
      title: 'hi' + getTime() + '好',
    });
    // 登录成功：加载效果消失
    loading.value = true;
  } catch (error) {
    // 登录失败：加载效果消失
    loading.value = false;
    //登录夫败的提示信思
    ElNotification({
      type: 'error',
      message: (error as Error).message,
    });
  }
};

// 自定义校验规则需要的函数
const validatorUserName = (rule: any, value: any, callback: any) => {
  // rule:即为规则的校验对象
  // value:即为表单元素的文本内容
  // 函数:如果符合条件 callback 放行即为通过
  // 如果不符合条件 callback 注入错误信息
  if (value.length >= 5) {
    callback();
  } else {
    callback(new Error('账号长度至少五位'));
  }
};

const validatorPassword = (rule: any, value: any, callback: any) => {
  if (value.length >= 6) {
    callback();
  } else {
    callback(new Error('账号长度至少六位'));
  }
};

// 定义表单校验的配置对象
const rules = {
  username: [
    /*
    规制对象属性：
          required:代表这个属性必须要校验
          min:文本长度至少多少位
          max:文本长度最多多少位
          message:错误提示信息
          trigger:触发校验表单的时机 change 文本发生变化时触发  blur 失去焦点时触发
    */
    /* {
      required: true,
      message: '用户名不能为空',
      trigger: 'blur',
    },
    {
      required: true,
      min: 5,
      max: 10,
      message: '账号长度至少5位',
      trigger: 'change',
    }, */
    { trigger: 'change', validator: validatorUserName },
  ],
  password: [
    /*  {
      required: true,
      min: 6,
      max: 15,
      message: '密码的长度至少6位',
      tirgger: 'change',
    }, */
    {
      trigger: 'change',
      validator: validatorPassword,
    },
  ],
};
</script>
<style lang="scss" scoped>
.login_container {
  width: 100%;
  height: 100vh;
  background: url('@/assets/images/background.jpg') no-repeat;
  background-size: cover;

  .login_form {
    position: relative;
    width: 80%;
    top: 30vh;
    background: url('@/assets/images/login_form.png') no-repeat;
    background-size: cover;
    padding: 40px;

    h1 {
      color: #fff;
      font-size: 40px;
    }

    h2 {
      font-size: 20px;
      color: #fff;
      margin: 20px 0;
    }

    .login_btn {
      width: 100%;
    }
  }
  // 设置最小视口样式
  @media screen and (max-width: 768px) {
    .login_form {
      left: 0;
      bottom: 0;
      right: 0;
      margin: 0 auto;
    }
  }
}
</style>
