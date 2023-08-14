// 书写品牌管理模块接口
//品牌管理模块相应接口地址
import request from '@/util/request';
import type { TradeMark, TradeMarkResponseData } from './type';

enum API {
  // 获取已有的品牌接口
  TRADEMARK_URL = '/admin/product/baseTrademark/',
  // 添加品牌
  ADDTRADEMARK_URL = '/admin/product/baseTrademark/save',
  // 修改品牌
  UPDATETRADEMARK_URL = '/admin/product/baseTrademark/update',
  // 删除已有的品牌
  DELETE_URL = '/admin/product/baseTrademark/remove/',
}

// 获取己有品牌的接口方法
/*
 *   page:获取第几页---默认第一页
 *   limit:获取几个已有品牌的数据
 * */
export const reqHasTrademark = (page: number, limit: number) =>
  request.get<any, TradeMarkResponseData>(
    API.TRADEMARK_URL + `${page}/${limit}`,
  );

// 添加与修改己有品牌接口方法
export const reqAddOrUpdateTrademark = (data: TradeMark) => {
  if (data.id) {
    // 修改已有品牌的数据
    return request.put<any, any>(API.UPDATETRADEMARK_URL, data);
  } else {
    // 新增品牌
    return request.post<any, any>(API.ADDTRADEMARK_URL, data);
  }
};
// 删除某一个己有品牌的数据
export const reqDeleteTrademark = (id: number) =>
  request.delete<any, any>(API.DELETE_URL + id);
