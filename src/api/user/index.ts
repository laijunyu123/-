// 统一管理咱们用户相关的接口
// 项目相关的请求的地址
import request from '@/util/request';
import type {
  loginFormData,
  loginResponseData,
  userInfoResponseData,
} from './type';

enum API {
  LOGIN_URL = '/admin/acl/index/login',
  USERINFO_URL = '/admin/acl/index/info',
  LOGOUT_URL = '/admin/acl/index/logout',
  // 删除某一个已有的属性
  DELETEATTR_URL = '/admin/product/deleteAttr/',
}

// 登录接口
export const reqLogin = (data: loginFormData) =>
  request.post<any, loginResponseData>(API.LOGIN_URL, data);

// 获取用户信息接口
export const reqUserInfo = () =>
  request.get<any, userInfoResponseData>(API.USERINFO_URL);

// 退出登录
export const reqLogout = () => request.post<any, any>(API.LOGOUT_URL);

// 删除某一个已有的属性业务
export const reqRemoveAttr = (attrId: number) =>
  request.delete<any, any>(API.DELETEATTR_URL + attrId);
