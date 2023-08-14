<template>
  <div>
    <el-card class="box-card">
      <!-- 卡片顶部的添加品牌的按钮 -->
      <el-button type="primary" icon="Plus" @click="addTrademark">
        添加品牌
      </el-button>
      <!-- 表格组件:用于展示已有的品牌数据 -->
      <!--
         table:
           --- border:可以设置表格纵向是否有边框
           table-column
           --- label:某一列标题
           --- width:设置列的宽度
           --- align:设置这一列对齐的方式
      -->
      <el-table style="margin: 10px 0" border :data="trademarkArr">
        <el-table-column
          label="序号"
          width="80px"
          align="center"
          type="index"
        ></el-table-column>
        <el-table-column label="品牌名称" prop="tmName"></el-table-column>
        <!-- table-column:默认展示数据用div -->
        <el-table-column label="品牌LOGO" prop="">
          <template v-slot="{ row, $index }">
            <img :src="row.logoUrl" style="width: 100px; height: 100px" />
          </template>
        </el-table-column>
        <el-table-column label="品牌仓库">
          <template v-slot="{ row, $index }">
            <el-button
              type="primary"
              icon="Edit"
              size="small"
              @click="updateTrademark(row)"
            ></el-button>

            <el-popconfirm
              :title="`您确定要删除${row.tmName}?`"
              width="200px"
              icon="Delete"
              @confirm="removeTradeMark(row.id)"
            >
              <template #reference>
                <el-button
                  type="primary"
                  icon="Delete"
                  size="small"
                ></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <!--
         分页器组件
             pagination
                --- v-model:current-page:设置分页器当前显示页码
                --- v-model:page-size:设置每一页展示数据条数
                --- page-sizes:用于设置下拉菜单数据
                --- small:是否采用小型分页器
                --- background:设置分页器按钮的背景颜色
                --- layout:可以设置分页器六个了组件布局位置
      -->
      <el-pagination
        @current-change="getHasTrademark"
        @size-change="sizePage"
        v-model:current-page="pageNo"
        v-model:page-size="limit"
        :page-sizes="[3, 5, 7, 9]"
        :background="true"
        layout="prev, pager, next, jumper,->,total, sizes,"
        :total="total"
      />
    </el-card>
    <!-- 对话框组件：在添加品牌与修改已有品牌的业务的时候使用结构 -->
    <!--
       v-model 用与控制显示与隐藏的 true显示 false隐藏
        title:设置对话框左上角标题
    -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="trademarkParams.id ? '修改品牌' : '添加品牌'"
    >
      <el-form
        style="width: 80%"
        :model="trademarkParams"
        :rules="rules"
        ref="formRef"
      >
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input
            placeholder="请您输入品牌名称"
            v-model="trademarkParams.tmName"
          ></el-input>
        </el-form-item>
        <el-form-item label="品牌图片" label-width="100px" prop="logoUrl">
          <!--
              upload 组件属性
                  --- action 图片上传路径带上 /api 代理服务器不发送这次post请求
           -->
          <el-upload
            class="avatar-uploader"
            action="/api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img
              v-if="trademarkParams.logoUrl"
              :src="trademarkParams.logoUrl"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- 具名插槽：footer -->
      <template #footer>
        <el-button type="primary" size="default" @click="cancel">
          取消
        </el-button>
        <el-button type="primary" size="default" @click="confirm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { UploadProps } from 'element-plus';
//引入组合式API函数ref
import { nextTick, onMounted, reactive, ref } from 'vue';
import {
  reqAddOrUpdateTrademark,
  reqDeleteTrademark,
  reqHasTrademark,
} from '@/api/product/trademark';
import type {
  Records,
  TradeMark,
  TradeMarkResponseData,
} from '@/api/product/trademark/type';
import { ElMessage } from 'element-plus';
// 当前页码
let pageNo = ref<number>(1);
// 每一页展示多少条数据
let limit = ref<number>(3);
// 存储已有品牌数据的总数
let total = ref<number>(0);
// 存储已有品牌的数据
let trademarkArr = ref<Records>([]);
// 控制对话框显示与隐藏
let dialogFormVisible = ref<boolean>(false);
// 定义一个新增品牌数据
let trademarkParams = reactive<TradeMark>({
  tmName: '',
  logoUrl: '',
});
// 获取 el-form 组件实例
let formRef = ref();
// 获取己有品牌的接口封装为一个函数:在任何的情况下获取数据，调用此函数即可
const getHasTrademark = async (pager = 1) => {
  // 当前页码
  pageNo.value = pager;
  let result: TradeMarkResponseData = await reqHasTrademark(pager, limit.value);
  if (result.code === 200) {
    // 存储已有品牌的总个数
    total.value = result.data.total;
    trademarkArr.value = result.data.records;
  }
};
// 组件挂载完毕 --- 发请求获取第一页三个品牌的数据
onMounted(() => {
  getHasTrademark();
});

// 分页器当前页码发生变化的时候会触发
// 对于当前页码发生变化自定义事件，组件 pagination 父组件回传了数据(当前的页码)
// const changePageNo = () => {
//   getHasTrademark();
// };

// 当下拉单发生变化的时候触发此方法
// 这个自定义事件，分页器组件会将下拉菜单选中数据返回
const sizePage = () => {
  // 当前每页数据量发生变化时，当前页码归1
  getHasTrademark();
};

// 添加品牌按钮的回调
const addTrademark = () => {
  // 对话框显示
  dialogFormVisible.value = true;
  // 收集数据清空
  trademarkParams.id = 0;
  trademarkParams.tmName = '';
  trademarkParams.logoUrl = '';
  // 第一中方法
  nextTick(() => {
    formRef.value.clearValidate();
  });
  // 第二种
  // formRef.value?.clearValidate();
};
// 修改品牌按钮的回调
// row:即为当前己有的品牌
const updateTrademark = (row: TradeMark) => {
  // 清空校验规则
  nextTick(() => {
    formRef.value.clearValidate();
  });
  // 对话框显示
  dialogFormVisible.value = true;
  // 收集已有品牌进行展示
  // es6语法 合并对象
  Object.assign(trademarkParams, row);
  // trademarkParams.tmName = row.tmName;
  // trademarkParams.logoUrl = row.logoUrl;
  // trademarkParams.id = row.id;
};
// 对话框取消按钮
const cancel = () => {
  // 对话框隐藏
  dialogFormVisible.value = false;
};

// 对话框确定按钮
const confirm = async () => {
  // 在你发请求之前，要对于整个表单进行校验
  // 调用这个方法进行全部表单相校验,如果校验全部通过，再执行后面的语法
  // await 是等待成功的结果，失败后续语句就不执行了
  await formRef.value.validate();
  // 对话框隐藏
  let result = await reqAddOrUpdateTrademark(trademarkParams);
  // 添加|修改已有品牌
  if (result.code === 200) {
    // 关闭对话框
    dialogFormVisible.value = false;
    // 弹出提示信息
    ElMessage.success(trademarkParams.id ? '修改品牌成功!' : '添加品牌成功!');
    // 再次发请求获取己有全部的品牌数据
    getHasTrademark(trademarkParams.id ? pageNo.value : 1);
  } else {
    ElMessage.error(trademarkParams.id ? '修改品牌失败  !' : '添加品牌失败  !');
    // 关闭对话框
    dialogFormVisible.value = false;
  }
};
// 上传图片组件-> 上传图片之前触发的钩子函数
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  // 钩子是在图片上传成功之前触发,在上传文件之前可以约束文件类型和大小
  // 要求文件上传类型为 png|jpg|gif 文件大小 4m
  if (rawFile.type === ('image/png' || 'image|jpeg' || 'image/gif')) {
    if (rawFile.size / 1024 / 1024 < 4) {
      return true;
    } else {
      ElMessage.error('上传大小应该小于4M');
    }
  } else {
    ElMessage.error('上传文件务必是png或jpg或gif');
    return false;
  }
};
// 图片上传成功的钩子
const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile,
) => {
  // response 即为当前这次上传图片 post 请求服务器返回的数据
  // 收集上传图片的地址,添加一个新的品牌的时候带给服务器
  trademarkParams.logoUrl = response.data;
  // 图片上传成功，清除掉对应图片校验结果
  formRef.value.clearValidate('logoUrl');
};

// 品牌校验自定义校验方法
const validatorTmName = (rule: any, value: any, callBack: any) => {
  // 是当表单元素触发 blur 时候，会触发此方法
  // 自定义校验规则
  if (value.trim().length >= 2) {
    callBack();
  } else {
    // 校验未通过返回的错误的提示信息
    callBack(new Error('品牌名称位数需要大于等于2'));
  }
};
// 品牌logo图片的自定义规则方法
const validatorLogoUrl = (rule: any, value: any, callBack: any) => {
  console.log(value);
  // 如果图片上传
  if (value) {
    callBack();
  } else {
    callBack(new Error('图片务必上传'));
  }
};

// 表单校验规则对象
const rules = {
  tmName: [
    // required:这个字段务必校验，表单前面出来五角星
    // trigger:代表触发校验规则时机（blur|change）
    { required: true, trigger: 'blur', validator: validatorTmName },
  ],
  logoUrl: [{ required: true, validator: validatorLogoUrl }],
};
// 气泡确认框确定按钮回调
const removeTradeMark = async (id: number) => {
  // 点击确定按钮删除己有品牌请求
  let result = await reqDeleteTrademark(id);
  if (result.code === 200) {
    ElMessage.success('删除品牌成功!');
    getHasTrademark(
      trademarkArr.value.length > 1 ? pageNo.value : pageNo.value - 1,
    );
  } else {
    ElMessage.error('删除品牌失败!');
  }
};
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>
