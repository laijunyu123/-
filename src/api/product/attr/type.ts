// 分类相关数据的 ts 类型

export interface ResponseData {
  code: number;
  message: string;
  ok: boolean;
}

// 分类 ts
export interface CategoryObj {
  id: number | string;
  name: string;
  category1Id?: number;
  category2Id?: number;
}

// 相应的分类接口返回数据的类型
export interface CategoryResponseData extends ResponseData {
  data: CategoryObj[];
}

// 属性与属性值的 ts 类型

// 属性值对象的 ts 类型
export interface AttrValue {
  id?: number;
  valueName: string;
  attrId?: number;
  flag?: boolean;
}
// 存储每一个属性值的数组类型
export type AttrValueList = AttrValue[];
// 属性对象
export interface Attr {
  id?: number;
  attrName: string;
  categoryId: number | string;
  categoryLevel: number;
  attrValueList: AttrValueList[];
}
// 存储每一个属性对象的数组 ts 类型
export type AttrList = Attr[];
// 属性接口返回数据的 ts 类型
export interface AttrResponseData extends ResponseData {
  data: Attr[];
}
