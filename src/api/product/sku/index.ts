// SKU模块接口管理
import request from '@/util/request';
import type { SkuResponseData, SkuInfoData } from '@/api/product/sku/type';
// 枚举地址

enum API {
  // 获取已有的商品的数据 SKU
  SKU_URL = '/admin/product/list/',
  // 上架
  SALE_URL = '/admin/product/cancelSale/',
  // 下架
  CANCELSALE_URL = '/admin/product/onSale/',
  // 获取商品详情接口
  SKUINFO_URL = '/admin/product/getSkuInfo/',
  // 删除已有的商品
  DELETE_URL = '/admin/product/deleteSku/',
}

// 获取商品 SKU 的接口
export const reqSkuList = (page: number, limit: number) =>
  request.get<any, SkuResponseData>(API.SKU_URL + `${page}/${limit}`);

// 已有商品上架的请求
export const reqSaleSku = (skuId: number) =>
  request.get<any, any>(API.SALE_URL + skuId);

// 已有商品下架的请求
export const reqCancelSale = (skuId: number) =>
  request.get<any, any>(API.CANCELSALE_URL + skuId);

// 获取商品详情的接口
export const reqSkuInfo = (skuId: number) =>
  request.get<any, SkuInfoData>(API.SKUINFO_URL + skuId);

// 删除某一个已有的商品
export const reqRemoveSku = (skuId: number) =>
  request.delete<any, any>(API.DELETE_URL + skuId);
