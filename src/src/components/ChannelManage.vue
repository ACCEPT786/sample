<template>
  <div>
    <el-dialog title :visible.sync="dialogFormVisible" :before-close="handleDialogClose" title="渠道">
      <div style="padding-bottom: 30px;">
        <span>已选择数: {{selectionNum}}</span>
        <el-input style="width: 50%; padding-left: 5%" v-model="inputHsman" placeholder="厂商"></el-input>
        <el-button type="primary" style="margin-left: 3%" @click="handleSearch">搜索</el-button>
      </div>
      <div>
        <el-table :data="tableHsmanDialogData" ref="multipleHsmanDialogTable" tooltip-effect="dark" border v-loading="loadingDialogHsman" @selection-change="handleSelectionChange" height="350" style="width: 100%">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="hsman" label="厂商"></el-table-column>
          <el-table-column prop="hstype" label="机型"></el-table-column>
          <el-table-column prop="exthstype" label="拓展机型"></el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit" style="width: 100%">增加</el-button>
      </div>
    </el-dialog>
    <el-container>
      <el-aside width="200px">
        <div class="radio-group">
          <el-radio-group v-model="customId" @change="rowClick">
            <el-radio v-for="item in tableData" :label="item.id" :key="item.id" border>{{item.displayName}}</el-radio>
          </el-radio-group>
        </div>
      </el-aside>
      <el-main>
        <div class="flex direction-column">
          <div class="flex direction-row-reverse">
            <el-button type="primary" @click="addChannel">增加渠道</el-button>
          </div>
          <div class="flex-item">
            <el-table :data="tableHsmanData" ref="multipleHsmanTable" tooltip-effect="dark" border highlight-current-row v-loading="loadingHsman">
              <el-table-column prop="id" label="序号"></el-table-column>
              <el-table-column prop="hsman" label="厂商"></el-table-column>
              <el-table-column prop="hstype" label="机型"></el-table-column>
              <el-table-column prop="exthstype" label="拓展机型"></el-table-column>
              <el-table-column fixed="right" label="管理">
                <template slot-scope="scope">
                  <el-button @click="handleDelete(scope.row)" type="danger" size="small">删除渠道</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      customId: "",
      tableData: [],
      tableHsmanData: [],
      loadingCustom: false,
      loadingHsman: false,
      loadingDialogHsman: false,
      tableHsmanDialogData: [],
      httpUrl: process.env.SERVER_URL + "/api/channel",
      dialogFormVisible: false,
      multipleSelection: [],
      selectionNum: 0,
      account: {},
      inputHsman: ""
    };
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      var that = this;
      that.loadingCustom = true;
      this.$http
        .get(
          this.httpUrl +
            "/customer?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token")
        )
        .then(
          res => {
            that.loadingCustom = false;
            that.tableData = [];
            if (200 == res.body.code) {
              that.tableData = [];
              for (var i = 0; i < res.body.data.length; i++) {
                var item = res.body.data[i];
                that.tableData.push(item);
                if (i === 0) {
                  this.customId = this.tableData[0].id;
                }
              }
              //this.$refs.multipleTable.setCurrentRow(this.tableData[0], true);
              //this.account = this.tableData[0];
              this.handleUserChannel();
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.loadingCustom = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    rowClick(row) {
      //this.account = JSON.parse(JSON.stringify(row));
      this.handleUserChannel();
    },

    handleDialogClose() {
      this.dialogFormVisible = false;
    },

    handleDelete(row) {
      this.$http
        .get(
          this.httpUrl +
            "/del?token=" +
            window.sessionStorage.getItem("token") +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&channelId= " +
            row.id +
            "&customId=" +
            this.customId
        )
        .then(
          res => {
            if (200 == res.body.code) {
              this.handleUserChannel();
              return;
            }
            this.showMsg(res.body.msg, "error");
          },
          err => {
            this.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleUserChannel() {
      var that = this;
      that.loadingHsman = true;
      that.tableHsmanData = [];
      this.$http
        .get(
          this.httpUrl +
            "/rel/hsman?id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token") +
            "&customerId=" +
            that.customId
        )
        .then(
          res => {
            that.loadingHsman = false;
            that.tableHsmanData = [];
            if (200 == res.body.code) {
              that.tableHsmanData = [];
              for (var i = 0; i < res.body.data.length; i++) {
                var item = res.body.data[i];
                that.tableHsmanData.push(item);
              }
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.loadingHsman = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    addChannel() {
      var that = this;
      that.tableHsmanDialogData = [];
      that.inputHsman = "";
      that.dialogFormVisible = true;
      that.loadingDialogHsman = true;
      this.$http
        .get(
          this.httpUrl +
            "/hsman?customerId=" +
            that.customId +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token")
        )
        .then(
          res => {
            that.loadingDialogHsman = false;
            if (200 == res.body.code) {
              that.tableHsmanDialogData = [];
              for (var i = 0; i < res.body.data.length; i++) {
                var item = res.body.data[i];
                that.tableHsmanDialogData.push(item);
              }
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.loadingDialogHsman = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleSearch() {
      var that = this;
      that.loadingDialogHsman = true;
      this.$http
        .get(
          this.httpUrl +
            "/hsman?customerId=" +
            that.customId +
            "&hsman=" +
            that.inputHsman +
            "&id=" +
            window.sessionStorage.getItem("id") +
            "&token=" +
            window.sessionStorage.getItem("token")
        )
        .then(
          res => {
            that.loadingDialogHsman = false;
            that.tableHsmanDialogData = [];
            if (200 == res.body.code) {
              that.tableHsmanDialogData = [];
              for (var i = 0; i < res.body.data.length; i++) {
                var item = res.body.data[i];
                that.tableHsmanDialogData.push(item);
              }
              return;
            }
            that.showMsg(res.body.msg, "error");
          },
          err => {
            that.loadingDialogHsman = false;
            that.showMsg("服务器请求失败，请检查网络连接！", "error");
          }
        );
    },

    handleSubmit() {
      if (this.selectionNum > 0) {
        var idList = [];
        for (let j in this.multipleSelection) {
          let item = this.multipleSelection[j];
          idList.push(item.id);
        }
        this.$http
          .post(
            this.httpUrl +
              "/add?token=" +
              window.sessionStorage.getItem("token") +
              "&id=" +
              window.sessionStorage.getItem("id") +
              "&customId=" +
              this.customId,
            idList
          )
          .then(
            res => {
              if (200 == res.body.code) {
                this.dialogFormVisible = false;
                this.handleUserChannel();
                return;
              }
              this.showMsg(res.body.msg, "error");
            },
            err => {
              this.showMsg("服务器请求失败，请检查网络连接！", "error");
            }
          );
      }
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.selectionNum = val.length;
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
/*!* 用来设置当前页面element全局table的内间距 *!*/
/*.custom.el-table__row td {*/
/*padding: 3%;*/
/*}*/

/*!* 用来设置当前页面element全局table 选中某行时的背景色*!*/
/*.custom .el-table__body tr.current-row > td {*/
/*background-color: #30466f !important;*/
/*color: white; !* 设置文字颜色，可以选择不设置 *!*/
/*}*/

/*!* 用来设置当前页面element全局table 鼠标移入某行时的背景色*!*/
/*.custom .el-table--enable-row-hover .el-table__body tr:hover > td {*/
/*background-color: white;*/
/*!* color: #f19944; *! !* 设置文字颜色，可以选择不设置 *!*/
/*}*/

/*.custom .el-radio-button__inner {*/
/*width: 100%;*/
/*}*/
.radio-group .el-radio-group {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  flex-direction: column;
}

.radio-group .el-radio__inner {
  display: none;
}

.radio-group .el-radio {
  margin-right: 0px;
}

.radio-group .el-radio.is-bordered + .el-radio.is-bordered {
  margin-left: 0px;
}

.radio-group .el-radio.is-bordered {
  border: 0px;
  border-radius: 0px;
  background-color: white;
  color: black;
}

.radio-group .el-radio.is-bordered.is-checked {
  border: 0px;
  border-radius: 0px;
  background-color: rgb(48, 70, 111);
}

.radio-group .el-radio.is-bordered.is-checked .el-radio__label {
  color: white;
}
</style>
