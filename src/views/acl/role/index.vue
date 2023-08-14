<template>
  <div>
    <el-card style="height: 80px">
      <el-form :inline="true" class="form">
        <el-form-item label="职位搜索">
          <el-input
            placeholder="请输入搜索职位的关键字"
            v-model="keyword"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="default"
            :disabled="!keyword.trim().length"
            @click="search"
          >
            搜索
          </el-button>
          <el-button size="default" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin: 10px 0">
      <el-button type="primary" size="default" icon="Plus" @click="addRole">
        添加职位
      </el-button>
      <el-table border style="margin: 10px 0" :data="allRole">
        <el-table-column
          type="index"
          align="center"
          label="#"
        ></el-table-column>
        <el-table-column align="center" label="id" prop="id"></el-table-column>
        <el-table-column
          align="center"
          label="职位名称"
          prop="roleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          align="center"
          label="创建时间"
          prop="createTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          align="center"
          label="更新时间"
          prop="updateTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column align="center" label="操作" width="300px">
          <template v-slot="{ row, $index }">
            <el-button
              type="primary"
              size="small"
              icon="User"
              @click="setPermission(row)"
            >
              分配权限
            </el-button>
            <el-button
              type="primary"
              size="small"
              icon="Edit"
              @click="updateRole(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确定要删除${row.roleName}?`"
              width="300px"
              icon="Delete"
              @confirm="removeRole(row.id)"
            >
              <template #reference>
                <el-button type="primary" size="small" icon="Delete">
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        :background="true"
        layout="prev, pager, next, jumper,->, sizes, total"
        :total="total"
        @size-change="sizeChange"
        @current-change="getHasRole"
      />
    </el-card>
    <!-- 添加职位与更新职位的结构：对话框 -->
    <el-dialog
      v-model="dialogVisite"
      :title="RoleParams.id ? '更新职位' : '添加职位'"
    >
      <el-form :model="RoleParams" :rules="rules" ref="form">
        <el-form-item label="职位名称" prop="roleName">
          <el-input
            placeholder="请你输入职位的名称"
            v-model="RoleParams.roleName"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" @click="dialogVisite = false">取消</el-button>
        <el-button type="primary" size="default" @click="save">确定</el-button>
      </template>
    </el-dialog>
    <!-- 抽屉组件：分配职位的菜单权限与按钮权限 -->
    <el-drawer v-model="drawer">
      <template #header>
        <h4>分配菜单与按钮的权限</h4>
      </template>
      <template #default>
        <!-- 树形控件 -->
        <el-tree
          ref="tree"
          :data="menuArr"
          show-checkbox
          node-key="id"
          :props="defaultProps"
          :default-expand-all="true"
          :default-checked-keys="selectArr"
        />
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawer = false">取消</el-button>
          <el-button type="primary" @click="handler">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
//当前页码
import { nextTick, onMounted, reactive, ref } from 'vue';
import {
  reqAddOrUpdateRole,
  reqAllMenuList,
  reqAllRoleList,
  reqRemoveRole,
  reqSetPermisstion,
} from '@/api/acl/role';
import type {
  RoleResponseData,
  Records,
  RoleData,
  MenuResponseData,
  MenuList,
} from '@/api/acl/role/type';
import useLayOutSettingStore from '@/store/modules/setting';
import { rules } from '@typescript-eslint/eslint-plugin';
import { ElMessage } from 'element-plus';
// 引入骨架的仓库

const settingStore = useLayOutSettingStore();

let pageNo = ref<number>(1);
//一页展示几条数据
let pageSize = ref<number>(10);
// 搜索职位的关键字
let keyword = ref<string>('');
// 存储全部已有的职位
let allRole = ref<Records>([]);
// 职位总个数
let total = ref<number>(0);
// 控制对话框的显示与隐藏
let dialogVisite = ref<boolean>(false);
// 收集新增岗位的数据
let RoleParams = reactive<RoleData>({
  id: '',
  roleName: '',
});
// 获取 form 组件实例
let form = ref<any>();
// 控制抽屉显示与隐藏
let drawer = ref<boolean>(false);
// 定义数组存储用户权限的数据
let menuArr = ref<MenuList>([]);
// 准备一个数组：数组用于存储勾选的节点的 ID(四级)
let selectArr = ref<number[]>([]);
// 获取 tree 树形控件的实例
let tree = ref<any>();
// 组件挂载时
onMounted(() => {
  // 获取职位的请求
  getHasRole();
});
// // 获取全部用户信息的方法|分页器当前页码发生变化的回调
const getHasRole = async (pager = 1) => {
  // 修改当前的页码
  pageNo.value = pager;
  let result: RoleResponseData = await reqAllRoleList(
    pageNo.value,
    pageSize.value,
    keyword.value,
  );
  if (result.code === 200) {
    allRole.value = result.data.records;
    total.value = result.data.total;
  }
};
// 下拉菜单的回调
const sizeChange = () => {
  getHasRole();
};
// 搜索按钮的回调
const search = () => {
  // 根据关键字发请求
  getHasRole();
  keyword.value = '';
};
// 重置按钮的回调
const reset = () => {
  settingStore.refsh = !settingStore.refsh;
};
// 添加职位按钮的回调
const addRole = () => {
  // 清空数据
  Object.assign(RoleParams, {
    id: '',
    roleName: '',
  });
  // 清空验证信息
  nextTick(() => {
    form.value.clearValidate();
  });
  // 对话框显示
  dialogVisite.value = true;
};
// 更新已有职位的按钮的回调
const updateRole = (row: RoleData) => {
  // 存储已有职位id
  Object.assign(RoleParams, row);
  // 清空验证信息
  nextTick(() => {
    form.value.clearValidate();
  });
  // 对话框显示
  dialogVisite.value = true;
};
// 自定义校验规则的回调
const validatorRoleName = (rule: any, value: any, callBack: any) => {
  if (value.trim().length >= 2) {
    callBack();
  } else {
    callBack(new Error('职位名称至少两位'));
  }
};
// 职位校验规则
const rules = {
  roleName: [{ required: true, trigger: 'blur', validator: validatorRoleName }],
};
//
const save = async () => {
  // 表单校验结果，结果通过在发请求、结果没有通过不应该在发生请求
  await form.value.validate();
  // 添加职位|更新职位的请求
  let result: any = await reqAddOrUpdateRole(RoleParams);
  if (result.code === 200) {
    ElMessage.success(RoleParams.id ? '修改成功' : '添加成功');
    // 对话框消失
    dialogVisite.value = false;
    getHasRole(RoleParams.id ? pageNo.value : 1);
  } else {
    ElMessage.error(RoleParams.id ? '修改失败' : '添加失败');
  }
};
// 分配权限按钮的回调
// row 已有的职位的数据
const setPermission = async (row: RoleData) => {
  // 抽屉显示出来
  drawer.value = true;
  // 收集当前要分类权限的职位的数据
  Object.assign(RoleParams, row);
  // 根据职位获取权限数据
  let result: MenuResponseData = await reqAllMenuList(RoleParams.id as number);
  if (result.code === 200) {
    menuArr.value = result.data;
    selectArr.value = filterSelectArr(menuArr.value, []);
  }
};
// 树形控件
const defaultProps = {
  children: 'children',
  label: 'name',
};
const filterSelectArr = (allData: any, initArr: any) => {
  allData.forEach((item: any) => {
    if (item.select && item.level === 4) {
      initArr.push(item.id);
    }
    if (item.children && item.children.length > 0) {
      filterSelectArr(item.children, initArr);
    }
  });
  return initArr;
};
// 抽屉确定按钮的回调
const handler = async () => {
  // 职位id
  const roleId = RoleParams.id;
  // 选中节点的id
  let arr = tree.value.getCheckedKeys();
  // 半选的id
  let arr1 = tree.value.getHalfCheckedKeys();
  let permissionId = arr.concat(arr1);
  // 下发权限
  let result: any = await reqSetPermisstion(roleId as number, permissionId);
  if (result.code === 200) {
    // 关闭抽屉
    drawer.value = false;
    ElMessage.success('添加权限成功！');
    // 页面刷新
    window.location.reload();
  } else {
    ElMessage.error('添加权限失败！');
  }
};
//
const removeRole = async (id: number) => {
  let result = await reqRemoveRole(id);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    getHasRole(allRole.value.length > 1 ? pageNo.value : pageNo.value - 1);
  } else {
    ElMessage.error('删除失败！');
  }
};
</script>

<style lang="scss" scoped>
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
