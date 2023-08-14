<template>
  <div>
    <el-table
      :data="PermisstionArr"
      style="width: 100%; margin-bottom: 20px"
      row-key="id"
      border
    >
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="权限值" prop="code"></el-table-column>
      <el-table-column label="修改时间" prop="updateTime"></el-table-column>
      <el-table-column label="操作">
        <!-- row即为已有的菜单对象|按钮的对象数据 -->
        <template v-slot="{ row, $index }">
          <el-button
            type="primary"
            size="small"
            :disabled="row.level === 4"
            @click="addPermisstion(row)"
          >
            {{ row.level === 3 ? '添加功能' : '添加菜单' }}
          </el-button>
          <el-button
            type="primary"
            size="small"
            :disabled="row.level === 1"
            @click="updatePermisstion(row)"
          >
            编辑
          </el-button>
          <el-popconfirm
            :title="`确定要删除${row.name}吗？`"
            icon="Delete"
            width="260px"
            @confirm="removeMenu(row.id)"
          >
            <template #reference>
              <el-button
                type="primary"
                size="small"
                :disabled="row.level === 1"
              >
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框组件：添加|更新已有菜单数据结构 -->
    <el-dialog
      v-model="dialogVisible"
      :title="menuData.id ? '更新菜单' : '添加菜单'"
      width="30%"
    >
      <!-- 表单元素:收集新增与已有菜单的数据 -->
      <el-form>
        <el-form-item label="名称">
          <el-input
            placeholder="请输入菜单名称"
            v-model="menuData.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-input
            placeholder="请输入菜单权限值"
            v-model="menuData.code"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
// 引入ts类型
import type {
  MenuParams,
  Permisstion,
  PermisstionList,
  PermisstionResponseData,
} from '@/api/acl/menu/type';
// 引入获取菜单的 API
import {
  reqAddOrUpdateMenu,
  reqAllPermisstion,
  reqRemoveMenu,
} from '@/api/acl/menu';
import { ElMessage } from 'element-plus';
// 存储菜单的数据
let PermisstionArr = ref<PermisstionList>([]);
// 控制对话框的显示与隐藏
let dialogVisible = ref<boolean>(false);
// 携带的参数
let menuData = reactive<MenuParams>({
  id: '',
  code: '',
  name: '',
  pid: 0,
  level: 0,
});
// 组件挂载完毕
onMounted(() => {
  getHasPermisstion();
});
// 获取菜单数据的方法
const getHasPermisstion = async () => {
  let result: PermisstionResponseData = await reqAllPermisstion();
  if (result.code === 200) {
    PermisstionArr.value = result.data;
  }
};
// 添加菜单数据 的方法
const addPermisstion = (row: Permisstion) => {
  // 清空数据
  Object.assign(menuData, {
    id: '',
    code: '',
    name: '',
    pid: 0,
    level: 0,
  });
  // 显示对话框
  dialogVisible.value = true;
  // 收集新增的菜单的 level 数据
  menuData.level = row.level + 1;
  // 给谁新增子菜单
  menuData.pid = row.id as number;
};
// 修改菜单数据 的方法
const updatePermisstion = (row: Permisstion) => {
  // 显示对话框
  dialogVisible.value = true;
  // 点击修改按钮：收集已有的菜单的数据进行更新
  Object.assign(menuData, row);
};
// 确定按钮的回调
const save = async () => {
  let result: any = await reqAddOrUpdateMenu(menuData);
  if (result.code === 200) {
    // 提示信息
    ElMessage.success(menuData.id ? '修改成功' : '添加成功');
    // 隐藏对话框
    dialogVisible.value = false;
    // 重新获取数据
    getHasPermisstion();
  } else {
    ElMessage.error(menuData.id ? '修改失败' : '添加失败');
  }
};
//
const removeMenu = async (id: number) => {
  let result: any = await reqRemoveMenu(id);
  if (result.code === 200) {
    // 提示信息
    ElMessage.success('删除成功！');
    // 重新获取数据
    getHasPermisstion();
  } else {
    ElMessage.error('删除失败');
  }
};
</script>

<style lang="scss" scoped></style>
