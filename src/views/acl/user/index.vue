<template>
  <div>
    <el-card style="height: 80px">
      <el-form :inline="true" class="form">
        <el-form-item label="用户名:">
          <el-input placeholder="请输入用户名" v-model="keyWord"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="default"
            :disabled="!keyWord.trim().length"
            @click="search"
          >
            搜索
          </el-button>
          <el-button size="default" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin: 10px 0">
      <el-button type="primary" size="default" @click="addUser">
        添加用户
      </el-button>
      <el-button
        type="primary"
        size="default"
        color="red"
        :disabled="!selectIdArr.length"
        @click="deleteSelectUser"
      >
        批量删除
      </el-button>
      <!-- 表格展示用户的信息 -->
      <el-table
        style="margin: 10px 0"
        border
        :data="userArr"
        @selection-change="selectChange"
      >
        <el-table-column type="selection" align="center"></el-table-column>
        <el-table-column
          type="index"
          label="#"
          align="center"
        ></el-table-column>
        <el-table-column label="id" align="center" prop="id"></el-table-column>
        <el-table-column
          label="用户名字"
          align="center"
          prop="username"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="用户名称"
          align="center"
          prop="name"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="用户角色"
          align="center"
          prop="roleName"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          label="更新时间"
          align="center"
          prop="updateTime"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column label="操作" width="300px" align="center">
          <template v-slot="{ row, $index }">
            <el-button
              type="primary"
              size="small"
              icon="User"
              @click="setRole(row)"
            >
              分配角色
            </el-button>
            <el-button
              type="primary"
              size="small"
              icon="Edit"
              @click="updateUser(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              :title="`确定要删除${row.username}吗？`"
              width="250px"
              icon="Delete"
              @confirm="deleteUser(row.id)"
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
      <!-- 分页器 -->
      <el-pagination
        v-model:current-page="pageNo"
        v-model:page-size="pageSize"
        :page-sizes="[5, 7, 9, 11]"
        :background="true"
        layout="prev, pager, next, jumper,->, sizes, total"
        :total="total"
        @size-change="handler"
        @current-change="getHasUser"
      />
    </el-card>
    <!-- 抽屉结构：完成添加新的用户账号|更新已有的账号信息 -->
    <el-drawer v-model="drawer">
      <!-- 头部标题 -->
      <template #header>
        <h4>{{ userParams.id ? '修改用户' : '添加用户' }}</h4>
      </template>
      <template #default>
        <el-form :model="userParams" :rules="rules" ref="formRef">
          <el-form-item label="用户姓名" prop="username">
            <el-input
              placeholder="请输入用户姓名"
              v-model="userParams.username"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户昵称" prop="name">
            <el-input
              placeholder="请输入用户昵称"
              v-model="userParams.name"
            ></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password" v-if="!userParams.id">
            <el-input
              placeholder="请输入用户密码"
              v-model="userParams.password"
            ></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="save">确定</el-button>
        </div>
      </template>
    </el-drawer>
    <!-- 抽屉结构：用户某一个已有的账号进行职位分配 -->
    <el-drawer v-model="drawer1">
      <template #header>
        <h4>分配角色</h4>
      </template>
      <template #default>
        <el-form>
          <el-form-item label="用户姓名">
            <el-input v-model="userParams.username" :disabled="true"></el-input>
          </el-form-item>
          <el-form-item label="职位列表">
            <el-checkbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAllChange"
            >
              全选
            </el-checkbox>
            <!-- 显示职位的复选框 -->
            <el-checkbox-group
              v-model="userRole"
              @change="handleCheckedCitiesChange"
            >
              <el-checkbox
                v-for="(role, index) in allRole"
                :key="index"
                :label="role"
              >
                {{ role.roleName }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="drawer1 = false">取消</el-button>
          <el-button type="primary" @click="confirmClick">确定</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue';
import {
  reqAddOrUpdateUser,
  reqAllRole,
  reqRemoveUser,
  reqSelectUser,
  reqSetUserRole,
  reqUserInfo,
} from '@/api/acl/user';
import type {
  Records,
  UserResponseData,
  User,
  AllRoleResponseData,
  AllRole,
  SetRoleData,
} from '@/api/acl/user/type';
import { ElMessage } from 'element-plus';
import { rules } from '@typescript-eslint/eslint-plugin';
import useLayOutSettingStore from '@/store/modules/setting';
// 默认页码
let pageNo = ref<number>(1);
// 一页展示几条数据
let pageSize = ref<number>(5);
// 用户的总个数
let total = ref<number>(0);
// 存储全部用户的数组
let userArr = ref<Records>([]);
// 定义响应式数据控制抽屉的显示与隐藏
let drawer = ref<boolean>(false);
// 收集用户信息的响应式数据
let userParams = reactive<User>({
  username: '',
  name: '',
  password: '',
});
// 获取 form 组件实例
let formRef = ref<any>();
// 控制分配角色抽屉显示与隐藏
let drawer1 = ref<boolean>(false);
// 存储全部职位的数据
let allRole = ref<AllRole>([]);
// 当前用户已有的职位
let userRole = ref<AllRole>([]);
// 收集顶部复选框全选数据
const checkAll = ref<boolean>(false);
// 控制顶部全选框不确定样式
const isIndeterminate = ref<boolean>(true);
// 准备一个数组存储批量删除的id
let selectIdArr = ref<User[]>([]);
// 定义响应式数据:收集用户进来的关键字
let keyWord = ref<string>('');
// 获取仓库对象
const settingStore = useLayOutSettingStore();
// 组件挂载完毕
onMounted(() => {
  getHasUser();
});
// 获取全部已有的用户信息
const getHasUser = async (pager = 1) => {
  // 收集当前页码
  pageNo.value = pager;
  let result: UserResponseData = await reqUserInfo(
    pageNo.value,
    pageSize.value,
    keyWord.value,
  );
  if (result.code === 200) {
    total.value = result.data.total;
    userArr.value = result.data.records;
  }
};
// 分页器下拉菜单的自定义事件的回调
const handler = () => {
  getHasUser();
};
// 添加用户按钮的回调
const addUser = () => {
  // 清空验证信息
  nextTick(() => {
    formRef.value.clearValidate();
  });
  // 清空数据
  Object.assign(userParams, { username: '', name: '', password: '', id: '' });
  // 抽屉显示出来
  drawer.value = true;
};
// 更新己有的用户按钮的回调
// row即为已有的用户的账号信息
const updateUser = (row: User) => {
  // 抽屉显示出来
  drawer.value = true;
  // 存储收集已有的账号信息
  Object.assign(userParams, row);
  nextTick(() => {
    formRef.value.clearValidate();
  });
};
// 保存按钮的回调
const save = async () => {
  // 点击保存按钮的时候，务必需要保证表单全部复合条件在去发请求
  await formRef.value.validate();
  // 保存按钮：添加新的用户更新已有的用户账号信息
  let result: any = await reqAddOrUpdateUser(userParams);
  console.log(result);
  //  添加或者更新成功
  if (result.code === 200) {
    drawer.value = false;
    ElMessage.success(userParams.id ? '更新成功！' : '添加成功！');

    // 获取最新的全部账号的信息
    // getHasUser(userParams.id ? pageNo.value : 1);
    // 浏览器自动刷新一次
    window.location.reload();
  } else {
    drawer.value = false;
    ElMessage.error(userParams.id ? '更新失败！' : '添加失败！');
  }
};
// 取消按钮到的回调
const cancel = () => {
  // 抽屉显示出来
  drawer.value = false;
};
// 校验用户规则的回调函数
const validatorUsername = (rule: any, value: any, callback: any) => {
  // 用户名字昵称，长度至少五位
  if (value.trim().length >= 5) {
    callback();
  } else {
    callback(new Error('用户的名字至少五位'));
  }
};
const validatorname = (rule: any, value: any, callback: any) => {
  // 用户名字昵称，长度至少五位
  if (value.trim().length >= 5) {
    callback();
  } else {
    callback(new Error('昵称的名字至少五位'));
  }
};
const validatorPassword = (rule: any, value: any, callback: any) => {
  // 用户名字昵称，长度至少五位
  if (value.trim().length >= 6) {
    callback();
  } else {
    callback(new Error('密码的名字至少六位'));
  }
};
// 表单校验呃呃规则对象
const rules = {
  // 用户名字
  username: [{ required: true, trigger: 'blur', validator: validatorUsername }],
  // 用户昵称
  name: [{ required: true, trigger: 'blur', validator: validatorname }],
  // 用户密码
  password: [{ required: true, trigger: 'blur', validator: validatorPassword }],
};
// 分配角色按钮的回调
const setRole = async (row: User) => {
  // 存储已有的用户的信息
  Object.assign(userParams, row);
  // 获取全部的职位的数据与当前用户已有的职位的数据
  let result: AllRoleResponseData = await reqAllRole(userParams.id as number);
  if (result.code === 200) {
    // 存储全部职位
    allRole.value = result.data.allRolesList;
    // 存储当前用户职位
    userRole.value = result.data.assignRoles;
    // 显示抽屉
    drawer1.value = true;
  }
};
// 顶部的全部复选框的 chang e事件
const handleCheckAllChange = (val: boolean) => {
  // val:true(全选)|false(没有全选)
  userRole.value = val ? allRole.value : [];
  // 不确定的样式（确定样式）
  isIndeterminate.value = false;
};
// 底部全部的复选框 change 事件
const handleCheckedCitiesChange = (value: string[]) => {
  // 顶部复选框的勾选数据
  // 代表：勾选上的项目个数与全部的职位个数相等，顶部的复选框勾选上
  checkAll.value = value.length === allRole.value.length;
  isIndeterminate.value =
    value.length !== allRole.value.length && value.length > 0;
};
// 确定按钮的回调(分配职位)
const confirmClick = async () => {
  // 手机参数
  let data: SetRoleData = {
    userId: userParams.id as number,
    roleIdList: userRole.value.map((item) => item.id) as number[],
  };
  // 分配用户职位
  let result: any = await reqSetUserRole(data);
  if (result.code === 200) {
    // 提示信息
    ElMessage.success('分配成功！');
    // 关闭抽屉
    drawer1.value = false;
    // 获取更新完毕用户的信息，更新完毕留在当前页
    getHasUser(pageNo.value);
  } else {
    ElMessage.error('分配失败！');
  }
};
// 删除某一个用户
const deleteUser = async (userId: number) => {
  let result: any = await reqRemoveUser(userId);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    getHasUser(userArr.value.length > 1 ? pageNo.value : pageNo.value - 1);
  } else {
    ElMessage.error('删除失败');
  }
};
// table复选框勾选的时候会触发的事件
const selectChange = (value: any) => {
  selectIdArr.value = value;
};
// 批量删除按钮的回调
const deleteSelectUser = async () => {
  let idList: any = selectIdArr.value.map((item) => item.id);
  let result: any = await reqSelectUser(idList);
  if (result.code === 200) {
    ElMessage.success('删除成功！');
    getHasUser(userArr.value.length > 1 ? pageNo.value : pageNo.value - 1);
  } else {
    ElMessage.error('删除失败');
  }
};
// 搜索按钮的回调
const search = () => {
  // 根据关键字获取相应的用户数据
  getHasUser();
  // 清空关键字
  keyWord.value = '';
};
// 重置按钮
const reset = () => {
  settingStore.refsh = !settingStore.refsh;
};
</script>

<style scoped lang="scss">
.form {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
