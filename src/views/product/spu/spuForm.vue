<template>
  <div>
    <el-form label-width="100px">
      <el-form-item label="SPU名称">
        <el-input
          placeholder="请输入spu名称"
          v-model="SpuParams.spuName"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU品牌">
        <el-select placeholder="请选择spu品牌" v-model="SpuParams.tmId">
          <el-option
            :label="item.tmName"
            v-for="(item, index) in AllTreadMark"
            :key="item.id"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          placeholder="请输入spu描述"
          v-model="SpuParams.description"
        ></el-input>
      </el-form-item>
      <el-form-item label="SPU照片">
        <!--
            v-model:fileList -> 展示默认图片
            action:上传图片的接口地址
            list-type:文件列表的类型

         -->
        <el-upload
          v-model:file-list="imgList"
          action="/api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :before-upload="handlerUpload"
        >
          <el-icon>
            <Plus />
          </el-icon>
        </el-upload>

        <el-dialog v-model="dialogVisible">
          <img
            w-full
            :src="dialogImageUrl"
            alt="Preview Image"
            style="width: 100%; height: 100%"
          />
        </el-dialog>
      </el-form-item>
      <el-form-item label="SPU销售属性">
        <el-select
          v-model="saleAttrIdAndValueName"
          :placeholder="
            unSelectSaleAttr.length
              ? `还未选择${unSelectSaleAttr.length}`
              : '无'
          "
        >
          <el-option
            :value="`${item.id}:${item.name}`"
            v-for="(item, index) in unSelectSaleAttr"
            :key="item.id"
            :label="item.name"
          >
            {{ item.name }}
          </el-option>
        </el-select>
        <el-button
          @click="addSaleAttr"
          :disabled="!saleAttrIdAndValueName"
          style="margin-left: 10px"
          type="primary"
          icon="Plus"
          size="default"
        >
          添加属性
        </el-button>
        <!-- table 展示销售属性与属性值的地方 -->
        <el-table border style="margin: 10px 0" :data="saleAttr">
          <el-table-column
            type="index"
            width="80px"
            label="序号"
            align="center"
          ></el-table-column>
          <el-table-column
            label="属性名"
            width="120px"
            prop="saleAttrName"
          ></el-table-column>
          <el-table-column label="属性值">
            <!-- row:即为当前SPU已有的销售属性对象 -->
            <template v-slot="{ row, $index }">
              <el-tag
                @close="row.spuSaleAttrValueList.splice($index, 1)"
                style="margin: 0px 5px"
                v-for="(item, index) in row.spuSaleAttrValueList"
                :key="row.id"
                class="mx-1"
                closable
              >
                {{ item.saleAttrValueName }}
              </el-tag>
              <el-input
                @blur="toLook(row)"
                v-model="row.saleAttrValue"
                v-if="row.flag"
                placeholder="请你输入属性值"
                size="small"
                style="width: 100px"
              ></el-input>
              <el-button
                @click="toEdit(row)"
                v-else
                type="primary"
                icon="Plus"
                size="small"
              ></el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120px">
            <template v-slot="{ row, $index }">
              <el-button
                type="primary"
                size="small"
                icon="Delete"
                @click="saleAttr.splice($index, 1)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-form-item>
          <el-button
            :disabled="saleAttr.length <= 0"
            type="primary"
            @click="save"
          >
            保存
          </el-button>
          <el-button type="primary" @click="cancel">取消</el-button>
        </el-form-item>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type {
  AllTradeMark,
  SaleAttr,
  SaleAttrResponseData,
  SpuData,
  SpuHasImg,
  SpuImage,
  TradeMark,
} from '@/api/product/spu/type';
import {
  reqAddOrUpdateSpu,
  reqAllSaleAttr,
  reqAllTradeMark,
  reqSpuHasSaleAttr,
  reqSpuImageList,
} from '@/api/product/spu';
import { computed, ref } from 'vue';
import { HasSaleAttr, SaleAttrValue } from '@/api/product/spu/type';
import { ElMessage } from 'element-plus';

let $emit = defineEmits(['changeScent']);
// 点击取消按钮：通知父组件切换场景为1，展示有的SPU的数据
const cancel = () => {
  $emit('changeScent', {
    flag: 0,
    params: '更新',
  });
};
// 存储已有的 SPU 这些数据
let AllTreadMark = ref<TradeMark[]>([]);
// 商品图片
let imgList = ref<SpuImage[]>([]);
// 已有的 SPU 销售属性
let saleAttr = ref<SaleAttr[]>([]);
// 全部的销售属性
let allSaleAttr = ref<HasSaleAttr[]>([]);
// 存储已有的SPU对象
let SpuParams = ref<SpuData>({
  category3Id: '', // 收集三级分类的ID
  spuName: '', // SPU的名字
  description: '', // SPU的描述
  tmId: '', // 品牌Id
  spuImageList: [],
  spuSaleAttrList: [],
});
// 控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false);
// 存储预览图片地址
let dialogImageUrl = ref<string>('');
// 将来收集还未选择的销售属性的D与属性值的名字
let saleAttrIdAndValueName = ref<string>('');
const initHasSpuData = async (spu: SpuData) => {
  // 存储已有的SPU对象，将来在模板中展示
  SpuParams.value = spu;
  // spu :即为父组件传递过来的己有的SPU对象 [不完整]
  // 获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark();
  // 获取某一个品牌旗下全部售卖商品的图片
  let result1: SpuHasImg = await reqSpuImageList(spu.id as number);
  // 获取已有的 SPU 销售属性的数据
  let result2: SaleAttrResponseData = await reqSpuHasSaleAttr(spu.id as number);
  // 获取整个项目全部 SPU 的销售属性
  let result3 = await reqAllSaleAttr();

  // 存储全部品牌的数据
  AllTreadMark.value = result.data;
  // SPU 对应商品图片
  imgList.value = result1.data.map((item) => {
    return {
      name: item.imgName,
      url: item.imgUrl,
    };
  });
  // 存储已有的SPU的销售属性
  saleAttr.value = result2.data;
  // 存储全部的销售属性
  allSaleAttr.value = result3.data;
};
// 照片墙点击预览按钮的时候触发的钩子
const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url;
  // 对话框弹出
  dialogVisible.value = true;
};
// 照片墙删除文件的钩子
const handleRemove = () => {
  console.log(123);
};
// 照片钱上传成功之前的钩子约束文件的大小与类型
const handlerUpload = (file: any) => {
  if (file.type === ('image/png' || 'image|jpeg' || 'image/gif')) {
    if (file.size / 1024 / 1024 < 3) {
      return true;
    } else {
      ElMessage.error('上传文件大小务必在3M以内！');
      return false;
    }
  }
  ElMessage.error('上传文件务必PNG|JPG|GIF');
  return false;
};
// 计算出当前SPU还未拥有的销售属性
let unSelectSaleAttr = computed(() => {
  // 全部销售属性：颜色、版本、尺码
  // 己有的销售属性：颜色、版本
  let unSelectArr = allSaleAttr.value.filter((item) => {
    return saleAttr.value.every((item1) => {
      return item.name !== item1.saleAttrName;
    });
  });
  return unSelectArr;
});
// 添加销售属性的方法
const addSaleAttr = () => {
  /*
      baseSaleAttrId:number,
      saleAttrName:string,
      spuSaleAttrValueList:SpuSaleAttrValueList
    */
  const [baseSaleAttrId, saleAttrName] =
    saleAttrIdAndValueName.value.split(':');
  //  准备一个新的销售属性对象：将来带给服务器即可
  let newSaleAttr: SaleAttr = {
    baseSaleAttrId,
    saleAttrName,
    spuSaleAttrValueList: [],
  };
  // 追加到数组当中
  saleAttr.value.push(newSaleAttr);
  // 清空收集的数据
  saleAttrIdAndValueName.value = '';
};
// 属性值按钮的点击事件
const toEdit = (row: SaleAttr) => {
  // 点击按钮的时候，input 组件不就不出来 -> 编辑模式
  row.flag = true;
  row.saleAttrValue = '';
};
// 表单元素失却焦点的事件回调
const toLook = (row: SaleAttr) => {
  // 整理收集的属性的ID与属性值的名字
  const { baseSaleAttrId, saleAttrValue } = row;
  // 整理成服务器需要的属性值形式
  let newSaleAttrValue: SaleAttrValue = {
    baseSaleAttrId,
    saleAttrValueName: saleAttrValue as string,
  };
  // 非法情况判断
  if ((saleAttrValue as string).trim() === '') {
    ElMessage.error('属性值不能为空');
    return;
  }
  // 判断属性值是否在数组当中存在
  let repeat = row.spuSaleAttrValueList.find((item) => {
    return item.saleAttrValueName === saleAttrValue;
  });
  if (repeat) {
    ElMessage.error('属性值不能相同');
    return;
  }
  // 追加新的属性值对象
  row.spuSaleAttrValueList.push(newSaleAttrValue);
  //  切换为查看模式
  row.flag = false;
};
// 保存
const save = async () => {
  // 整理参数
  // 1.照片墙
  SpuParams.value.spuImageList = imgList.value.map((item: any) => {
    return {
      imgName: item.name, // 图片的名字
      imgUrl: (item.response && item.response.data) || item.url,
    };
  });
  // 2:整理销售属性的数据
  SpuParams.value.spuSaleAttrList = saleAttr.value;
  // 发请求：添加SPU更新已有的SPU
  let result = await reqAddOrUpdateSpu(SpuParams.value);
  // 成功
  if (result.code === 200) {
    ElMessage.success(SpuParams.value.id ? '修改成功' : '添加成功');
    // 通知父组件切换场景为0
    $emit('changeScent', {
      flag: 0,
      params: SpuParams.value.id ? '更新' : '添加',
    });
  } else {
    // 失败
    ElMessage.error(SpuParams.value.id ? '修改失败' : '添加失败');
  }
};
// 添加一个新的SPU 初始化请求的方法
const initAddSpu = async (category3Id: number | string) => {
  //清空数据
  Object.assign(SpuParams.value, {
    category3Id: '', //收集三级分类的ID
    spuName: '', //SPU的名字
    description: '', //SPU的描述
    tmId: '', //品牌的ID
    spuImageList: [],
    spuSaleAttrList: [],
  });
  //清空照片
  imgList.value = [];
  // 清空id
  SpuParams.value.id = '';
  //清空销售属性
  saleAttr.value = [];
  saleAttrIdAndValueName.value = '';
  // 存储三级分类的ID
  SpuParams.value.category3Id = category3Id;
  // 获取全部品牌的数据
  let result: AllTradeMark = await reqAllTradeMark();
  // 获取整个项目全部 SPU 的销售属性
  let result1 = await reqAllSaleAttr();
  // 存储数据
  AllTreadMark.value = result.data;
  allSaleAttr.value = result1.data;
};
// 对外暴露
defineExpose({
  initHasSpuData,
  initAddSpu,
});
</script>

<style scoped lang="scss"></style>
