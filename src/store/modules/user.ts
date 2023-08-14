import type {
  loginFormData,
  loginResponseData,
  userInfoResponseData,
} from '@/api/user/type';

// 创建用户相关的小仓库
import { defineStore } from 'pinia';
// 引入接口
import { reqLogin, reqUserInfo, reqLogout } from '@/api/user';
import type { UserState } from './types/type';
// 引入操作本地存储的工具方法
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '@/util/token';
// 引入路由（常量路由）
import { constantRouter, asyncRoute, anyRoute } from '@/router/routes';
// 引入深拷贝方法
import router from '@/router';
import { cloneDeep } from 'lodash';
// 按钮权限的实现
//
// 创建用户小仓库
let useUserStore = defineStore('User', {
  // 小仓库存储数据的地方
  state: (): UserState => ({
    token: GET_TOKEN(), // 用户的唯一标识
    menuRoutes: constantRouter, // 仓库存储生成菜单需要数组（路由）
    username: '',
    avatar: '',
    // 存储当前用户树缝包含某一个=按钮
    buttons: [],
  }),
  // 异步|逻辑
  actions: {
    // 用户登录的方法
    async userLogin(data: loginFormData) {
      // 登录请求
      let result: loginResponseData = await reqLogin(data);

      // 登录请求:成功200->token
      if (result.code === 200) {
        // pinia 仓库存储 token
        // 由于 pinia|vuex 存储数据其实利用 js 对象
        this.token = result.data as string;
        // 本地持久化存储 token
        SET_TOKEN(result.data as string);
        // 保证当前订单 async 函数返回一个成功的 promise
        return 'ok';
      } else {
        // 登录请求：失败201->登录失败的错误信息
        return Promise.reject(new Error(result.data));
      }
    },
    // 获取用户信息的方法
    async userInfo() {
      // 获取用户信息进行存储仓库当中(用户头像、名字)
      let result: userInfoResponseData = await reqUserInfo();
      // 如果获取用户信息成功，存储一下用户信息
      if (result.code === 200) {
        this.username = result.data.name;
        this.avatar = result.data.avatar;
        this.buttons = result.data.buttons;
        // 计算当前用户需要展示的异步路由
        const userAsyncRoute = this.filterAsyncRoute(
          cloneDeep(asyncRoute),
          result.data.routes,
        );
        // 菜单的数据
        this.menuRoutes = [...constantRouter, ...userAsyncRoute, anyRoute];
        // 目前路由器管理的只有常量路由：用户计算完毕异步路由、任意路由动态追加
        [...userAsyncRoute, anyRoute].forEach((route: any) => {
          router.addRoute(route);
        });
        return 'ok';
      } else {
        return Promise.reject(new Error(result.message));
      }
    },
    // 退出登录
    async userLogout() {
      let result: any = await reqLogout();
      if (result.code === 200) {
        // 目前没有 mock 接口：退出登录接口 (通知服务器本地用户唯一标识失效)
        this.token = '';
        this.username = '';
        this.avatar = '';
        REMOVE_TOKEN();
        return 'ok';
      } else {
        return Promise.reject(new Error(result.message));
      }
    },
    // 用于过滤当前用户需要展示的异步路由
    filterAsyncRoute(asyncRoute: any, routes: any) {
      return asyncRoute.filter((item: any) => {
        if (routes.includes(item.name)) {
          if (item.children && item.children.length > 0) {
            item.children = this.filterAsyncRoute(item.children, routes);
          }
          return true;
        }
      });
    },
  },
  // 计算属性
  getters: {},
});

// 对外暴露获取小仓库的方法
export default useUserStore;
