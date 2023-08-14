// 书写属性相关API文件
import request from '@/util/request';
import type { CategoryResponseData, AttrResponseData, Attr } from './type';

//属性管理模块接口

enum API {
  // 获取一级分类接口的地址
  C1_URL = '/admin/product/getCategory1',
  // 获取二级分类接口的地址
  C2_URL = '/admin/product/getCategory2/',
  // 获取三级分类接口的地址
  C3_URL = '/admin/product/getCategory3/',
  // 获取分类下已有的属性值和属性地址
  ATTR_URL = '/admin/product/attrInfoList/',
  // 添加或修改已有属性的接口
  ADDORUPDATE_URL = '/admin/product/saveAttrInfo',
}

// 获取一级分类接口的方法
export const reqC1 = () => request.get<any, CategoryResponseData>(API.C1_URL);
// 获取二级分类接口的方法
export const reqC2 = (category1Id: number | string) =>
  request.get<any, CategoryResponseData>(API.C2_URL + category1Id);
// 获取三级分类接口的方法
export const reqC3 = (category2Id: number | string) =>
  request.get<any, CategoryResponseData>(API.C3_URL + category2Id);

// 获取对应分类下已有的属性和属性值接口
export const reqAttr = (
  category1Id: number | string,
  category2Id: number | string,
  category3Id: number | string,
) =>
  request.get<any, AttrResponseData>(
    API.ATTR_URL + `${category1Id}/${category2Id}/${category3Id}`,
  );

// 新增或者修改已有的属性接口
export const reqAddOrUpdateAttr = (data: Attr) =>
  request.post<any, any>(API.ADDORUPDATE_URL, data);
