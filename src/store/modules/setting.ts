// 小仓库：layout组件配置的仓库
import { defineStore } from 'pinia';

let useLayOutSettingStore = defineStore('SettingStore', {
  state: () => ({
    // 用户控制菜单折叠还是收起的控制
    fold: false,
    refsh: false, // 仓库的属性用于控制刷新效果
  }),
});

export default useLayOutSettingStore;
