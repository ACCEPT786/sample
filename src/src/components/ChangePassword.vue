<template>
  <el-row>
    <el-col :span="12" :offset="6">
      <div style="height: 120px"></div>
      <div>
        <div class="panel panel-primary-password center-block">
          <div class="panel-heading">
            <h1 style="text-align: center;font-size: 30px;font-weight: bold;padding: 10px">修改密码</h1>
          </div>
          <div class="panel-body">
            <el-form style="padding-left: 10%" label-width="20%" label-position="left">
              <el-form-item label="原密码：">
                <el-input type="password" v-model="form.oldPassword" style="width: 70%;"></el-input>
              </el-form-item>
              <el-form-item label="新密码：">
                <el-input type="password" v-model="form.newPassword" style="width: 70%;"></el-input>
              </el-form-item>
              <el-form-item label="确认新密码：">
                <el-input type="password" v-model="form.confirmPassword" style="width: 70%"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit" style="width: 70%;margin-top: 5%">确定
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      form: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      }
    };
  },
  methods: {
    onSubmit() {
      var id = window.sessionStorage.getItem("id");
      var token = window.sessionStorage.getItem("token");
      if (undefined == this.form.oldPassword || "" == this.form.oldPassword) {
        this.$alert("原密码不能为空", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (undefined == this.form.newPassword || "" == this.form.newPassword) {
        this.$alert("新密码不能为空", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (
        undefined == this.form.confirmPassword ||
        "" == this.form.confirmPassword
      ) {
        this.$alert("确认新密码不能为空", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (this.form.confirmPassword != this.form.newPassword) {
        this.$alert("两次输入新密码不一致", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      this.form.id = id;
      this.form.token = token;
      this.$http
        .post(process.env.SERVER_URL + "/api/account/updatePassword", this.form)
        .then(function(res) {
          if (200 != res.data.code) {
            this.$alert(res.data.msg, "提示", {
              confirmButtonText: "确定"
            });
            return;
          }
          this.showMsg("保存成功");
          this.$router.go(-1);
        });
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

<style>
.panel {
  margin-bottom: 20px;
  background-color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
}

.panel-body {
  padding: 15px;
}

.panel-heading {
  padding: 10px 15px;
  border-bottom: 1px solid transparent;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
  text-align: center;
  color: #3366CC;
}

.panel-primary-password {
  border-color: #337ab7;
}
</style>
