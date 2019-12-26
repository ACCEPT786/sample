<template>
  <el-row class="tac">
    <div class="flex direction-row-reverse" style="padding-bottom: 20px;">
      <el-button type="primary" @click="handleAdd">增加客户</el-button>
    </div>

    <el-table :data="tableData" ref="multipleTable" tooltip-effect="dark" border @selection-change="handleSelectionChange" v-loading="loading" style="width: 100%">
      <!-- <el-table-column type="selection"></el-table-column> -->
      <el-table-column prop="id" label="序号"></el-table-column>
      <el-table-column prop="displayName" label="名称"></el-table-column>
      <el-table-column prop="userName" label="账号"></el-table-column>
      <el-table-column prop="passWord" label="密码"></el-table-column>
      <el-table-column prop="deducted" label="转发比例（%）"></el-table-column>
      <el-table-column fixed="right" label="操作">
        <template slot-scope="scope">
          <el-button @click="handleModify(scope.row)" type="text" size="small">编辑</el-button>
          <el-button @click="handleDel(scope.row)" type="text" size="small">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @current-change="handleCurrentChange" :current-page.sync="currentPage" :page-size="pageSize" layout="total, prev, pager, next" :total="count">
    </el-pagination>

    <el-dialog :visible.sync="dialogVisible" :before-close="handleClose" :close-on-press-escape="false" :close-on-click-modal="false">
      <el-form :model="form" ref="form" :rules="rules">
        <el-form-item label="名称" label-width="120px" prop="displayName">
          <el-input v-model="form.displayName"></el-input>
        </el-form-item>
        <el-form-item label="账号" label-width="120px" prop="userName">
          <el-input v-model="form.userName" :disabled="!isAdd"></el-input>
        </el-form-item>
        <el-form-item label="密码" label-width="120px" prop="passWord">
          <el-input v-model="form.passWord"></el-input>
        </el-form-item>
        <el-form-item label="转发比例（%）" label-width="120px" prop="deducted">
          <el-input v-model="form.deducted"></el-input>
        </el-form-item>
        <el-form-item label="账户类型" label-width="120px" prop="level">
          <el-select v-model="form.level" placeholder="请选择">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit('form')">保 存</el-button>
      </div>
    </el-dialog>

  </el-row>
</template>

<script>
export default {
  data() {
    let patter = /^[1-9]\d*$/;
    //转发比例校验规则
    var deductedCheck = (rule, value, callback) => {
      // value = Number(value);
      if (patter.test(value)) {
        if (value < 0 || value > 100) {
          callback(new Error("转发比例在 0 至 100 %之间"));
        } else {
          callback();
        }
      } else {
        callback(new Error("转发比例必须为整数"));
      }
    };
    return {
      loading: false,
      currentPage: 1,
      pageSize: 10,
      count: 0,
      dialogVisible: false,
      isAdd: true,
      levelOptions: [
        // { label: "管理员", value: 1 },
        { label: "普通用户", value: 2 }
      ],
      tableData: [],
      multipleSelection: [],
      form: {},
      rules: {
        displayName: [
          { required: true, message: "请输入名称", trigger: "blur" }
        ],
        userName: [{ required: true, message: "请输入账号", trigger: "blur" }],
        passWord: [{ required: true, message: "请输入密码", trigger: "blur" }],
        deducted: [
          { required: true, message: "请输入转发比例", trigger: "change" },
          { validator: deductedCheck, trigger: "change" }
        ],
        level: [
          { required: true, message: "请选择账户类型", trigger: "change" }
        ]
      }
    };
  },
  mounted() {
    var that = this;
    that.handleSearch();
  },
  methods: {
    // 菜单勾选赋值
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    // 分页切换
    handleCurrentChange() {
      var that = this;
      let offset = (that.currentPage - 1) * that.pageSize;
      let url =
        process.env.SERVER_URL +
        "/api/privilege/getData?offset=" +
        offset +
        "&limit=" +
        that.pageSize +
        "&uid=" +
        window.sessionStorage.getItem("id") +
        "&token=" +
        window.sessionStorage.getItem("token");
      that.httpGet(url);
    },
    // 新增按钮事件
    handleAdd() {
      var that = this;
      that.isAdd = true;
      that.form = {};
      that.dialogVisible = true;
    },
    // 编辑事件
    handleModify(val) {
      var that = this;
      that.dialogVisible = true;
      that.isAdd = false;
      that.form = JSON.parse(JSON.stringify(val));
    },
    // 单条删除
    handleDel(val) {
      this.$confirm("确认删除这些项目?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let deleteUrl =
            process.env.SERVER_URL +
            "/api/privilege/del?uid=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token");
          var idList = [];
          idList.push(val.id);
          this.httpPost(deleteUrl, idList);
        })
        .catch(err => {});
    },
    // 新增/编辑提交
    handleSubmit(formName) {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      let url =
        process.env.SERVER_URL +
        "/api/privilege/submit?isAdd=" +
        that.isAdd +
        "&uid=" +
        uid +
        "&token=" +
        token;
      this.$refs[formName].validate(valid => {
        if (valid) {
          that.httpPost(url, this.form);
        } else {
          that.showMsg("输入格式错误！", "error");
          return false;
        }
      });
    },
    // 新增/编辑关闭
    handleClose() {
      this.dialogVisible = false;
      this.$refs["form"].resetFields();
    },
    // 查询数据
    handleSearch() {
      var that = this;
      var uid = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      that.currentPage = 1;
      let url =
        process.env.SERVER_URL +
        "/api/privilege/getData?offset=0&limit=" +
        that.pageSize +
        "&uid=" +
        uid +
        "&token=" +
        token;
      that.httpGet(url);
    },
    httpGet(url) {
      var that = this;
      that.$http.get(url).then(
        res => {
          that.loading = false;
          that.tableData = [];
          var body = res.body;
          console.log(body);
          if (200 == body.code) {
            that.count = body.data.count;
            that.tableData = body.data.data;
            return;
          }
          that.showMsg(body.msg, "error");
        },
        err => {
          that.loading = false;
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
        }
      );
    },
    httpPost(url, data) {
      var that = this;
      that.loading = true;
      that.$http.post(url, data).then(
        res => {
          that.loading = false;
          if (200 == res.body.code) {
            that.dialogVisible = false;
            that.showMsg("操作成功！", "success");
            that.handleSearch();
            return;
          }
          that.showMsg(res.body.msg, "error");
        },
        err => {
          that.loading = false;
          that.showMsg("服务器请求失败，请检查网络连接！", "error");
        }
      );
    },
    showMsg(msg, type) {
      this.$message({
        message: msg,
        type: type,
        showClose: true,
        center: true
      });
    }
  }
};
</script>

