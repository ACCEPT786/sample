<template>
  <el-row>
    <el-col :span="12" :offset="6">
      <div>
        <h1 style="text-align: center;font-size: 35px;font-weight: bold;padding: 30px">销量统计后台管理</h1>
      </div>
      <div class="panel panel-primary center-block">
        <div class="panel-heading">
          <h2 style="text-align: center;font-size: 30px;font-weight: bold;padding: 15px">登录</h2>
        </div>
        <div class="panel-body">
          <el-form>
            <el-form-item>
              <el-input v-model="form.username" style="margin-left: 15%;width: 70%" placeholder="账号" prefix-icon="el-icon-user" clearable @keyup.enter.native="onSubmit()"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input type="password" v-model="form.password" style="margin-left: 15%;width: 70%" placeholder="密码" prefix-icon="el-icon-lock" clearable @keyup.enter.native="onSubmit()"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit" style="width: 70%;margin-left: 15%">登录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
    <div style="background-color: slategrey;position: fixed;bottom: 0;width: 100%;text-align: center;height: 6%;">
      <div style="height: 100%;font-size: 20px;line-height: 300%;color: white" @click="handleNormal">普通用户</div>
    </div>
  </el-row>
</template>
<script>
export default {
  data() {
    return {
      form: {
        mcc: "",
        username: "",
        password: ""
      },
      mccOptions: [
        { label: "国内", value: "460" },
        { label: "海外", value: "999" }
      ]
    };
  },
  methods: {
    onSubmit() {
      if (undefined == this.form.username || "" == this.form.username) {
        this.$alert("帐号不能为空", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      if (undefined == this.form.password || "" == this.form.password) {
        this.$alert("密码不能为空", "提示", {
          confirmButtonText: "确定"
        });
        return;
      }
      this.$http
        .post(process.env.SERVER_URL + "/api/account/login", {
          username: this.form.username,
          password: this.form.password,
          level: 1
        })
        .then(function(res) {
          if (200 != res.data.code) {
            this.$alert(res.data.msg, "提示", {
              confirmButtonText: "确定"
            });
            return;
          }
          window.sessionStorage.setItem("id", res.data.data.id);
          window.sessionStorage.setItem("username", res.data.data.userName);
          window.sessionStorage.setItem(
            "displayName",
            res.data.data.displayName
          );
          window.sessionStorage.setItem("token", res.data.data.token);
          window.sessionStorage.setItem("level", res.data.data.level);
          this.$router.replace({ path: "/privilege" });
        });
    },
    handleNormal() {
      this.$router.replace({ path: "/login" });
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
  color: #3366cc;
}

.panel-primary {
  border-color: #337ab7;
}

.panel-primary .el-form-item .el-form-item__label {
  font-size: 18px;
  font-family: "Microsoft YaHei";
  font-weight: bold;
  padding-left: 15%;
}

.panel-primary .el-radio-group {
  width: 100%;
  padding-left: 30%;
}

.panel-primary .el-radio-group .el-radio__label {
  font-size: 18px;
  font-family: "Microsoft YaHei";
  font-weight: bold;
  padding-left: 50%;
}

.panel .el-input__inner:focus {
  border-color: #f56c6c;
}
</style>
