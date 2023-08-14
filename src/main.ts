import { createApp } from 'vue';
import App from '@/App.vue';
// 引入 element-plus 插件与样式
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// 配置 element-plus 国际化配置
//@ts-expect-error
import zhCn from 'element-plus/dist/locale/zh-cn.mjs';
// 暗黑模式需要的样式
import 'element-plus/theme-chalk/dark/css-vars.css';
// 引入模板的全局样式
import '@/styles/index.scss';
// svg 插件需要配置代码
import 'virtual:svg-icons-register';
// 引入自定义插件对象：注册整个项目全局组件
import gloalComponent from '@/components';
// 引入路由
import router from './router';
// 引入路由鉴权的文件
import './permisstion.ts';
// 引入仓库
import pinia from './store';

// 获取应用实例对象
const app = createApp(App);
// 安装 element-plus 插件
app.use(ElementPlus, {
  locale: zhCn, // element-plus 国际化的配置
});

// 安装自定义插件
app.use(gloalComponent);
// 安装仓库
app.use(pinia);
// 注册模板路由
app.use(router);
// 引入自定义指令文件
import { isHasButton } from '@/directive/has';
isHasButton(app);

// 挂载应用
app.mount('#app');
11111;
