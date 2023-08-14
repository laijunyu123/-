// 服务器全部接口返回的数据类型
export interface ResponseData {
  code: number;
  message: string;
  ok: boolean;
}

// SPU 数据的 ts 类型
export interface SpuData {
  id?: number | string;
  spuName: string;
  description: string;
  category3Id: string | number;
  tmId: number | string;
  spuSaleAttrList: null | SaleAttr[];
  spuImageList: null | SpuImage[];
}

// 数组：元素都是已有SPU数据类型
export type Records = SpuData[];
// 定义获取已有的 SPU 接口返回的数据 ts 类型
export interface HasSpuResponseData extends ResponseData {
  data: {
    records: Records;
    total: number;
    size: number;
    current: number;
    searchCount: boolean;
    pages: number;
  };
}

// 品牌数据的 TS 类型
export interface TradeMark {
  id: number;
  tmName: string;
  logoUrl: string;
}

// 品牌接返回的数据 ts 类型
export interface AllTradeMark extends ResponseData {
  data: TradeMark[];
}

// 商品图片的 ts 类型
export interface SpuImage {
  id?: number;
  createTime?: string;
  updateTime?: string;
  spuId?: number;
  imgName?: string;
  imgUrl?: string;
  name?: string;
  url?: string;
}

// 已有的 SPU 的照片墙数据的类型
export interface SpuHasImg extends ResponseData {
  data: SpuImage[];
}

// 已有的销售属性值对象 ts 类型
export interface SaleAttrValue {
  id?: number;
  createTime?: null;
  updateTime?: null;
  spuId?: number;
  baseSaleAttrId: number | string;
  saleAttrValueName: string;
  saleAttrName?: string;
  isChecked?: null;
}

// 存储已有的销售属性值数组类型
export type spuSaleAttrValueList = SaleAttrValue[];

// 销售属性对象 ts 类型
export interface SaleAttr {
  id?: number;
  createTime?: number;
  updateTime?: number;
  spuId?: number;
  baseSaleAttrId: number | string;
  saleAttrName: string;
  spuSaleAttrValueList: spuSaleAttrValueList;
  flag?: boolean;
  saleAttrValue?: string;
}

// SPU 已有的销售属性接口返回数据 ts 类型
export interface SaleAttrResponseData extends ResponseData {
  data: SaleAttr[];
}

// 已有的全部SPU的返回数据ts类型
export interface HasSaleAttr {
  id: number;
  name: string;
}

//
export interface HasSaleAttrResponseData extends ResponseData {
  data: HasSaleAttr[];
}
export interface Attr {
  attrId: number | string; //平台属性的ID
  valueId: number | string; //属性值的ID
}

export interface saleArr {
  saleAttrId: number | string; //属性ID
  saleAttrValueId: number | string; //属性值的ID
}
export interface SkuData {
  category3Id: string | number; //三级分类的ID
  spuId: string | number; //已有的SPU的ID
  tmId: string | number; //SPU品牌的ID
  skuName: string; //sku名字
  price: string | number; //sku价格
  weight: string | number; //sku重量
  skuDesc: string; //sku的描述
  skuAttrValueList?: Attr[];
  skuSaleAttrValueList?: saleArr[];
  skuDefaultImg: string; //sku图片地址
}

//获取SKU数据接口的ts类型
export interface skuInfoData extends ResponseData {
  data: SkuData[];
}
