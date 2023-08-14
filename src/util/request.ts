// 进行 axios 二次的封装：使用它的请求与响应拦截器
import axios from 'axios';
import { ElMessage } from 'element-plus';
// 引入用户相关的仓库
import useUserStore from '@/store/modules/user';
// 第一步：利用 axios 对象的 create 方法，去创造 axios 实例（其他的配置：基础路径、超时的时间）
let request = axios.create({
  // 基础路径
  baseURL: import.meta.env.VITE_APP_BASE_API, // 基础路径会携带/api
  timeout: 5000, // 发请求超时设置
});
// 第二步：request 实例添加请求与响应拦截器
request.interceptors.request.use((config) => {
  // 获取用户相关的小仓库：获取仓库内部的token,登录成功以后携带给服务器
  let userStore = useUserStore();
  if (userStore.token) {
    config.headers.token = userStore.token;
  }
  // config 配置对象，headers 属性请求头，经常给服务器端携带公共参数
  // 返回配置对象
  return config;
});

// 第三步：request 实例添加响应拦截器
request.interceptors.response.use(
  (response) => {
    // 成功回调
    // 简化数据

    return response.data;
  },
  (error) => {
    // 失败回调：处理 http 网络错误的
    // 定义一个变量：存储网络错误信息
    let msg = '';
    // http 状态码
    let status = error.response.status;
    switch (status) {
      case 401:
        msg = 'token 过期';
        break;
      case 403:
        msg = '无权访问';
        break;
      case 404:
        msg = '请求地址错误';
        break;
      case 500:
        msg = '服务器错误';
        break;

      default:
        msg = '网络错误';
        break;
    }
    // 提示错误欣喜
    ElMessage({
      type: 'error',
      message: msg,
    });
    return Promise.reject(error);
  },
);
// 对外暴露
export default request;
