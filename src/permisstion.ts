// 路由鉴权文件，项目当中路由能不能被访问的权限的设置（某一个路由什么条件下可以访问，什么条件下不可以访问）
import router from '@/router';
import nprogress from 'nprogress';
//引入进度条样式
import 'nprogress/nprogress.css';
nprogress.configure({ showSpinner: false });
// 获取用户相关的小仓库内部 token 数据，去判断用户是否登录成功
import useUserStore from '@/store/modules/user';
import pinia from '@/store';
import setting from '@/setting';
let userStore = useUserStore(pinia);

// 全局前置守卫

router.beforeEach(async (to, from, next) => {
  //to:你将要访问那个路由
  //from:你从来个路由而来
  //next:路由的放行函数
  // 访问某一个路由之前的守卫
  nprogress.start();
  // 获取 token 去判断用户登录了还是未登录
  let token = userStore.token;
  // 获取用户的名字
  let username = userStore.username;
  if (token) {
    // 用户登录
    if (to.path == '/login') {
      // 访问 login 路由
      next({ path: '/' });
    } else {
      // 访问其余路由
      if (username) {
        // 有用户信息放行
        next();
      } else {
        try {
          // 没有则发请求
          await userStore.userInfo();
          // 万一：刷新的时候是异步路由，有可能获取到用户信息、异步路由还没有加载完毕，出现空白的效果
          next({ ...to, replace: true });
        } catch (e) {
          // token 过期 或者 用户修改了token
          await userStore.userLogout();
          next({ path: '/login', query: { redirect: to.path } });
        }
      }
    }
  } else {
    // 未登录
    if (to.path == '/login') {
      next();
    } else {
      next({ path: '/login', query: { redirect: to.path } });
    }
  }
});

// 全局后置守卫
router.afterEach((to, from) => {
  document.title = setting.title + '-' + to.meta.title;
  nprogress.done();
});

// 第一个问题:任意路由切换实现进度条业务 ---nprogress
// 第二个问题：路由组件访问权限的问题
// 全部的路由组件：登录|404|首页|数据大屏}权限管理（三个子路由）|商品管理（四个子路由）

// 用户未登录只能访问 login
// 用户登录成功，不能访问 login(其余可以访问)
